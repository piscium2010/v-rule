import { hasValue, isInteger, isNumber, isDate, isEmail, isUrl, mergeResult } from './util'
import { ERROR_1, ERROR_2 } from './errors'
import Validation from './Validation'

type Assert = (...arg) => boolean
type Expect = (desc: string, assert?: Assert) => { expect: Expect }
type When = (key: string, assert?: Assert) => { when: When, whenNot: WhenNot, expect: Expect }
type WhenNot = (key: string, assert?: Assert) => { when: When, whenNot: WhenNot, expect: Expect }

const noPrerequisite = () => ({ triggered: true, pass: true })
const noPreset = {}
const emptyKeys = []

function when(prerequisite, relativeKeys, preset, key, assert?) {
    if (typeof key !== 'string' || key === '') { throw new Error(ERROR_1) }
    const rule = (instance, primaryKey) => {
        if (prerequisite(instance, primaryKey).triggered) {
            const context = instance.context
            const obj = { [key]: context[key] }
            const relativeObj = relativeKeys.reduce((prev, rkey) => Object.assign(prev, { [rkey]: context[rkey] }), {})
            const values = proxy({ ...obj, ...relativeObj }, primaryKey)
            return { triggered: assert ? assert(values) : hasValue(obj[key]) }
        }
        return {}
    }

    return {
        when: when.bind(null, rule, [key, ...relativeKeys], preset),
        whenNot: whenNot.bind(null, rule, [key, ...relativeKeys], preset),
        expect: expect.bind(null, rule, [key, ...relativeKeys], preset),
        validate: validate.bind(null, rule)
    }
}

function whenNot(prerequisite, relativeKeys, preset, key, assert?) {
    return when(prerequisite, relativeKeys, preset, key, assert ? assert : values => !hasValue(values[key]))
}

function expect(prerequisite, relativeKeys, preset, desc, assert?) {
    if (typeof desc !== 'string' || desc === '') { throw new Error(ERROR_2) }
    const funcs = {}
    const rule = function (instance, primaryKey) {
        const pre = prerequisite(instance, primaryKey)
        const next = 'triggered' in pre ? pre['triggered'] : pre.pass
        if (next) {
            const context = instance.context
            const obj = { [primaryKey]: context[primaryKey], ['$0']: context[primaryKey] }
            const relativeObj = relativeKeys.reduce((prev, rkey) => Object.assign(prev, { [rkey]: context[rkey] }), {})
            const values = proxy({ ...obj, ...relativeObj }, primaryKey)
            const pass = assert ? assert(values) : hasValue(obj[primaryKey])
            const messages = { [primaryKey]: pass ? '' : desc }
            return { pass: pass ? true : false, messages }
        }

        return pre.pass === false && pre.messages
            ? pre // result from previous expect or when or whenNot
            : { triggered: false, pass: true, messages: { [primaryKey]: '' } } // validation not triggered
    }

    rule.expect = expect.bind(null, rule, relativeKeys, preset)
    Object.keys(preset).forEach(k => funcs[k] = preset[k].bind(null, rule.expect))
    Object.assign(rule, funcs)
    return rule
}

function validate(prerequisite, key) {
    return function (instance) {
        const result = { pass: true }
        const pre = prerequisite(instance)
        const next = 'triggered' in pre ? pre['triggered'] : pre.pass
        if (next) {
            const oneResult = instance.applyRules(key)
            mergeResult(result, oneResult)
        }
        return result // validation not triggered, default to true without desc
    }
}

type ExpectChain = (...arg: any[]) => { expect: ExpectChain }
type Preset<T> = {
    [prop in keyof T]: (...args: any[]) => Preset<T> & { expect: ExpectChain }
}

function preset<T>(preset = noPreset as T) {
    const funcs = {} as Preset<T>
    const v = {
        create: ruleStore => new Validation(ruleStore),
        expect: expect.bind(null, noPrerequisite, emptyKeys, preset),
        when: when.bind(null, noPrerequisite, emptyKeys, preset),
        whenNot: whenNot.bind(null, noPrerequisite, emptyKeys, preset),
        validate: validate.bind(null, noPrerequisite),
        isTruthy: hasValue, // deprecated
        hasValue,
        isInteger,
        isNumber,
        isDate,
        isEmail,
        isUrl
    }
    Object.keys(preset).forEach(k => funcs[k] = preset[k].bind(null, v.expect))
    return Object.assign(v, funcs)
}

export { preset }
export default preset()

function proxy(obj, primaryKey) {
    const handler = {
        get: function (target, name) {
            if (name in target) {
                return target[name]
            } else if (typeof name === 'string' && name !== 'inspect') {
                const keys = Object.keys(obj).join(', ')
                throw `${name} is not in one of keys: ${keys}. Error occurs in rule: ${primaryKey}`
            }
        }
    }
    return typeof Proxy === 'function' ? new Proxy(obj, handler) : obj
}