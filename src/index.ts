import { isTruthy, isInteger, isNumber, isDate, isEmail, isUrl } from './util'
const noPrerequisite = () => ({ pass: true })
const emptyKeys = []

type Assert = (...arg) => boolean
type Message = { [name: string]: string }
type RuleStore = { [name: string]: any }
type Context = { [name: string]: any }
type ValidationResult = { pass: boolean, messages?: Message }
type Expect = (desc: string, assert?: Assert) => { expect: Expect }
type When = (key: string, assert?: Assert) => { when: When, expect: Expect }

export const ERROR_0 = `every rule should end with either expect(desc: string, assert?: func => bool) or validate(key: string).`
export const ERROR_1 = `non-empty string is required for when(key: string).`
export const ERROR_2 = `non-empty string is required for expect(desc: string, assert?: func => bool).`

function when(prerequisite, relativeKeys, key, assert?) {
    if (typeof key !== 'string' || key === '') { throw ERROR_1 }
    const rule = (instance, primaryKey) => {
        if (prerequisite(instance, primaryKey).pass) {
            const context = instance.context
            const obj = { [key]: context[key] }
            const relativeObj = relativeKeys.reduce((prev, rkey) => Object.assign(prev, { [rkey]: context[rkey] }), {})
            const values = proxy({ ...obj, ...relativeObj }, primaryKey)
            return { pass: assert ? assert(values) : isTruthy(obj[key]) }
        }
        return {}
    }

    return {
        when: when.bind(null, rule, [key, ...relativeKeys]),
        expect: expect.bind(null, rule, [key, ...relativeKeys]),
        validate: validate.bind(null, rule)
    }
}

function expect(prerequisite, relativeKeys, desc, assert?) {
    if (typeof desc !== 'string' || desc === '') { throw ERROR_2 }
    let rule
    rule = function (instance, primaryKey) {
        const result = prerequisite(instance, primaryKey) // {} or {pass: bool} or {pass: bool, messages: object}
        if (result.pass) {
            const context = instance.context
            const obj = { [primaryKey]: context[primaryKey] }
            const relativeObj = relativeKeys.reduce((prev, rkey) => Object.assign(prev, { [rkey]: context[rkey] }), {})
            const values = proxy({ ...obj, ...relativeObj }, primaryKey)
            const pass = assert ? assert(values) : isTruthy(obj[primaryKey])
            const messages = { [primaryKey]: pass ? '' : desc }
            return { pass, messages }
        }

        return result.pass === false && result.messages
            ? result // result from previous expect
            : { pass: true } // validation not triggered, default to true without messages
    }

    rule.expect = expect.bind(null, rule, relativeKeys)

    return rule
}

function validate(prerequisite, key) {
    return function (instance) {
        const result = { pass: true }
        if (prerequisite(instance).pass) { // {} or {pass: true}
            const oneResult = instance.applyRules(key)
            mergeResult(result, oneResult)
        }
        return result // validation not triggered, default to true without desc
    }
}

class Validation {
    context: Context
    ruleStore: RuleStore
    validatedKeys: Array<string>

    constructor(ruleStore) {
        this.ruleStore = ruleStore
        this.validatedKeys = []
        this.context = {}
    }

    getRules = key => this.ruleStore[key] ? [].concat(this.ruleStore[key]) : []

    isKeyValidated = key => {
        const one = this.validatedKeys.find(n => n === key)
        if (one) {
            return true
        } else {
            this.validatedKeys.push(key)
            return false
        }
    }

    applyRules = key => {
        if (this.isKeyValidated(key)) { return {} }
        const result = {}
        const instance = this
        const rules: any[] = this.getRules(key)
        for (let rule of rules) {
            if (typeof rule !== 'function') { throw ERROR_0 }
            const oneResult = rule(instance, key)
            mergeResult(result, oneResult)
            if (!oneResult.pass) { break }
        }
        return result
    }

    test(obj, context?) {
        const result = {}
        this.validatedKeys = []
        this.context = Object.assign({}, context, obj)
        for (let key in obj) {
            const oneResult = this.applyRules(key)
            mergeResult(result, oneResult)
        }
        return result as ValidationResult
    }

    testAllRules(obj, context?) {
        const defaultObj = Object.keys(this.ruleStore).reduce((prev, key) => Object.assign(prev, { [key]: undefined }), {})
        return this.test(Object.assign({}, defaultObj, obj), context)
    }
}

const v = {
    create: ruleStore => new Validation(ruleStore),
    expect: expect.bind(null, noPrerequisite, emptyKeys),
    when: when.bind(null, noPrerequisite, emptyKeys),
    validate: validate.bind(null, noPrerequisite),
    isTruthy,
    isInteger,
    isNumber,
    isDate,
    isEmail,
    isUrl
}

export default v

function mergeResult(origin, addition: any = {}) {
    if ('pass' in addition) {
        origin.pass = origin.pass === false ? origin.pass : addition.pass // do not overwrite false result
    }
    if ('messages' in addition) {
        origin.messages = Object.assign(origin.messages || {}, addition.messages)
    }
}

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