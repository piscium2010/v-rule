import { mergeResult } from './util'

type Message = { [name: string]: string }
type ValidationResult = { pass: boolean, messages?: Message }
type Context = { [name: string]: any }
type RuleStore = { [name: string]: any }

import { ERROR_0 } from './errors'

export default class Validation {
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
            if (typeof rule !== 'function') { throw new Error(ERROR_0) }
            const oneResult = rule(instance, key)
            mergeResult(result, oneResult)
            if (!oneResult.pass) { break }
        }
        return result
    }

    test = (obj, context?) => {
        const result = {}
        this.validatedKeys = []
        this.context = Object.assign({}, context, obj)
        for (let key in obj) {
            const oneResult = this.applyRules(key)
            mergeResult(result, oneResult)
        }
        return result as ValidationResult
    }

    testAllRules = (obj, context?) => {
        const defaultObj = Object.keys(this.ruleStore).reduce((prev, key) => Object.assign(prev, { [key]: undefined }), {})
        return this.test(Object.assign({}, defaultObj, obj), context)
    }
}
