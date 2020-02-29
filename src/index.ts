import { isTruthy, isInteger, isNumber, isDate, isEmail, isUrl, mergeResult } from './util'
import { ERROR_0, ERROR_1, ERROR_2 } from './errors'
import Validation from './Validation'

type Assert = (...arg) => boolean
type Expect = (desc: string, assert?: Assert) => { expect: Expect }
type When = (key: string, assert?: Assert) => { when: When, expect: Expect }

const noPrerequisite = () => ({ triggered: true, pass: true })
const emptyKeys = []

function when(prerequisite, relativeKeys, key, assert?) {
    if (typeof key !== 'string' || key === '') { throw new Error(ERROR_1) }
    const rule = (instance, primaryKey) => {
        if (prerequisite(instance, primaryKey).triggered) {
            const context = instance.context
            const obj = { [key]: context[key] }
            const relativeObj = relativeKeys.reduce((prev, rkey) => Object.assign(prev, { [rkey]: context[rkey] }), {})
            const values = proxy({ ...obj, ...relativeObj }, primaryKey)
            // const is = isTruthy(obj[key])
            // console.log(`key`, key, is)
            return { triggered: assert ? assert(values) : isTruthy(obj[key]) }
        }
        return {}
    }

    return {
        when: when.bind(null, rule, [key, ...relativeKeys]),
        whenNot: whenNot.bind(null, rule, [key, ...relativeKeys]),
        expect: expect.bind(null, rule, [key, ...relativeKeys]),
        validate: validate.bind(null, rule)
    }
}

function whenNot(prerequisite, relativeKeys, key, assert?) {
    if (typeof key !== 'string' || key === '') { throw new Error(ERROR_1) }
    const rule = (instance, primaryKey) => {
        if (prerequisite(instance, primaryKey).triggered) {
            const context = instance.context
            const obj = { [key]: context[key] }
            const relativeObj = relativeKeys.reduce((prev, rkey) => Object.assign(prev, { [rkey]: context[rkey] }), {})
            const values = proxy({ ...obj, ...relativeObj }, primaryKey)
            return { triggered: assert ? assert(values) : !isTruthy(obj[key]) } // NOT
        }
        return {}
    }

    return {
        whenNot: whenNot.bind(null, rule, [key, ...relativeKeys]),
        when: when.bind(null, rule, [key, ...relativeKeys]),
        expect: expect.bind(null, rule, [key, ...relativeKeys]),
        validate: validate.bind(null, rule)
    }
}

function expect(prerequisite, relativeKeys, desc, assert?) {
    if (typeof desc !== 'string' || desc === '') { throw new Error(ERROR_2) }
    let rule
    rule = function (instance, primaryKey) {
        const pre = prerequisite(instance, primaryKey) // {} or {pass: bool} or {pass: bool, messages: object}
        const next = 'triggered' in pre ? pre['triggered'] : pre.pass

        if (next) {
            const context = instance.context
            const obj = { [primaryKey]: context[primaryKey] }
            const relativeObj = relativeKeys.reduce((prev, rkey) => Object.assign(prev, { [rkey]: context[rkey] }), {})
            const values = proxy({ ...obj, ...relativeObj }, primaryKey)
            const pass = assert ? assert(values) : isTruthy(obj[primaryKey])
            const messages = { [primaryKey]: pass ? '' : desc }
            return { pass, messages }
        }

        return pre.pass === false && pre.messages
            ? pre // result from previous expect
            : { triggered: false, pass: true, messages: { [primaryKey]: '' } } // validation not triggered
    }

    rule.expect = expect.bind(null, rule, relativeKeys)

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

const v = {
    create: ruleStore => new Validation(ruleStore),
    expect: expect.bind(null, noPrerequisite, emptyKeys),
    when: when.bind(null, noPrerequisite, emptyKeys),
    whenNot: whenNot.bind(null, noPrerequisite, emptyKeys),
    validate: validate.bind(null, noPrerequisite),
    isTruthy,
    isInteger,
    isNumber,
    isDate,
    isEmail,
    isUrl
}

export default v

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