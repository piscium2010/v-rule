import v, { ERROR_0, ERROR_1, ERROR_2 } from '../src/index'

test('basic', () => {
    const validation = v.create({
        name: v.expect('required'),
        pwd: v.expect('required'),
        confirm: v.when('pwd').expect('should match pwd', c => c.pwd === c.confirm)
    })
    let result
    result = validation.test({ name: '', pwd: '' })
    // => { pass: false, messages: { name: 'required', pwd: 'required' } }
    expect(result.pass).toEqual(false)
    expect(result.messages.name).toEqual('required')
    expect(result.messages.pwd).toEqual('required')


    result = validation.test({ name: '', pwd: '2', confirm: '3' })
    // => r { pass: false, messages: { name: 'required', pwd: '', confirm: 'should match pwd' } }
    expect(result.pass).toEqual(false)
    expect(result.messages.name).toEqual('required')
    expect(result.messages.pwd).toEqual('')
    expect(result.messages.confirm).toEqual('should match pwd')
})

test('compound', () => {
    const validation = v.create({
        age: v.expect('required').expect('should be number', c => v.isInteger(c.age))
    })
    const result = validation.test({ age: 'seven' })
    // => { pass: false, messages: { age: 'should be number' } }
    expect(result.pass).toEqual(false)
    expect(result.messages.age).toEqual('should be number')
})

test('multi rules', () => {
    const validation = v.create({
        age: [
            v.expect('required').expect('should be number', c => v.isInteger(c.age)), // 1st rule
            v.when('min').when('max').expect('should between min and max', c => c.min < c.age && c.age < c.max)
        ]
    })
    const result = validation.test({ age: '17', min: 18, max: 50 })
    // => r { pass: false, messages: { age: 'should between min and max' } }
    expect(result.pass).toEqual(false)
    expect(result.messages.age).toEqual('should between min and max')
})

test('trigger another validation', () => {
    const validation = v.create({
        beer: v.when('beer').validate('age'), // or v.validate('age')
        age: v.expect('age should be greater than 18', c => c.age > 18)
    })
    const context = { age: '17' }
    const result = validation.test({ beer: 1 }, context)
    // => { pass: false, messages: { age: 'age should be greater than 18' } }
    expect(result.pass).toEqual(false)
    expect(result.messages.age).toEqual('age should be greater than 18')
})

test('validate one', () => {
    const validation = v.create({
        DATE_OF_BIRTH: v.expect('required').expect('is Date', c => v.isDate(c.DATE_OF_BIRTH)),
        MARRIAGE: v.expect('should be one of single/married', c => ['single', 'married'].includes(c.MARRIAGE)),
        DATE_OF_MARRIAGE: [
            v.when('MARRIAGE', c => c.MARRIAGE === 'married').
                expect('required when married'),
            v.when('DATE_OF_BIRTH').
                expect('should greater than date of birth', c => c.DATE_OF_MARRIAGE > c.DATE_OF_BIRTH),
        ]
    })
    const context = { DATE_OF_BIRTH: '2000-1-1', MARRIAGE: 'married' }
    const result = validation.test({ DATE_OF_MARRIAGE: '' }, context)
    // console.log(`r`,result)
    // => { pass: false, messages: { DATE_OF_MARRIAGE: 'required when married' } }
    expect(result.pass).toEqual(false)
    expect(result.messages.DATE_OF_MARRIAGE).toEqual('required when married')
})

test('validate all', () => {
    const validation = v.create({
        DATE_OF_BIRTH: v.expect('required').expect('is Date', c => v.isDate(c.DATE_OF_BIRTH)),
        MARRIAGE: v.expect('should be one of single/married', c => ['single', 'married'].includes(c.MARRIAGE)),
        DATE_OF_MARRIAGE: [
            v.when('MARRIAGE', c => c.MARRIAGE === 'married').
                expect('required when married'),
            v.when('DATE_OF_BIRTH').
                expect('should greater than date of birth', c => c.DATE_OF_MARRIAGE > c.DATE_OF_BIRTH),
        ]
    })
    const result = validation.test({
        DATE_OF_BIRTH: '2000-1-1',
        MARRIAGE: 'married',
        DATE_OF_MARRIAGE: '1999-1-1'
    })
    // => { 
    //      pass: false,
    //      messages: 
    //      { 
    //        DATE_OF_BIRTH: '',
    //        MARRIAGE: '',
    //        DATE_OF_MARRIAGE: 'should greater than date of birth' 
    //      } 
    //    }
    expect(result.pass).toEqual(false)
    expect(result.messages.DATE_OF_BIRTH).toEqual('')
    expect(result.messages.MARRIAGE).toEqual('')
    expect(result.messages.DATE_OF_MARRIAGE).toEqual('should greater than date of birth')
})



test('invalid rule: 0', () => {
    try {
        const ruleStore = {
            name: v.when('age')
        }
        const validation = v.create(ruleStore)
        let r = validation.test({ name: '' })
    } catch (e) {
        expect(e).toEqual(ERROR_0)
    }
})

test('invalid rule: 1', () => {
    try {
        const ruleStore = {
            name: v.when('').expect('required')
        }
        const validation = v.create(ruleStore)
        validation.test({ name: '' })
    } catch (e) {
        expect(e).toEqual(ERROR_1)
    }
})

test('invalid rule: 2', () => {
    try {
        const ruleStore = {
            name: v.when('name').expect('')
        }
        const validation = v.create(ruleStore)
        validation.test({ name: '' })
    } catch (e) {
        expect(e).toEqual(ERROR_2)
    }
})

test('required', () => {
    const nMessage = 'required'
    const aMessage = 'required'
    const ruleStore = {
        name: v.expect(nMessage),
        age: v.expect(aMessage)
    }
    const validation = v.create(ruleStore)
    let r
    r = validation.test({ name: '', age: '' })
    expect(r.messages.name).toEqual(nMessage)
    expect(r.messages.age).toEqual(aMessage)
    r = validation.test({ name: 'n', age: '1' })
    expect(r.pass).toEqual(true)
    expect(r.messages.name).toEqual('')
    expect(r.messages.age).toEqual('')
})

test('shoudl be number', () => {
    const message = 'should be number'
    const ruleStore = {
        name: v.expect(message, ({ name }) => typeof name === 'number')
    }
    const validation = v.create(ruleStore)
    const r = validation.test({ name: '3' })
    expect(r.pass).toEqual(false)
    expect(r.messages.name).toEqual(message)
})

test('empty rule store', () => {
    const validation = v.create({})
    const r = validation.test({ name: '3' })
    expect(r.pass).toEqual(undefined)
    expect(r.messages).toEqual(undefined)
})

test('validate', () => {
    const bMessage = 'beer >= 1'
    const wMessage = 'whisky == 1'
    const validation = v.create({
        beer: [
            v.when('sex', ({ sex }) => sex === 'male')
                .when('age', ({ age }) => age > 20)
                .expect(bMessage, ({ beer }) => beer >= 1),
            v.validate('whisky')],
        whisky: v.when('sex', ({ sex }) => sex === 'male').when('age', ({ age }) => age > 20).expect(wMessage, ({ whisky }) => whisky == 1)
    })
    let r
    r = validation.test({ sex: 'male', age: 21, beer: 2 })
    expect(r.pass).toEqual(false)
    expect(r.messages.whisky).toEqual(wMessage)

    r = validation.test({ sex: 'male', age: 21, beer: 2, whisky: 1 })
    expect(r.pass).toEqual(true)
    expect(r.messages.whisky).toEqual('')
})

test('when > validate', () => {
    const bMessage = 'beer >= 1'
    const wMessage = 'whisky == 1'
    const validation = v.create({
        beer: [
            v.when('sex', ({ sex }) => sex === 'male')
                .when('age', ({ age }) => age > 20)
                .expect(bMessage, ({ beer }) => beer >= 1),
            v.when('whisky').validate('whisky')],
        whisky: v.when('sex', ({ sex }) => sex === 'male').when('age', ({ age }) => age > 20).expect(wMessage, ({ whisky }) => whisky == 1)
    })
    let r
    r = validation.test({ sex: 'male', age: 21, beer: 2 })
    expect(r.pass).toEqual(true)
    expect(r.messages.beer).toEqual('')
    expect(r.messages.whisky).toEqual(undefined)

    r = validation.test({ sex: 'male', age: 21, beer: 2, whisky: 2 })
    expect(r.pass).toEqual(false)
    expect(r.messages.whisky).toEqual(wMessage)
    expect(r.messages.beer).toEqual('')

    r = validation.test({ sex: 'male', age: 21, beer: 2, whisky: 1 })
    expect(r.pass).toEqual(true)
    expect(r.messages.whisky).toEqual('')
    expect(r.messages.beer).toEqual('')
})

test('prevent infinite validate loop', () => {
    const bMessage = 'beer >= 1'
    const wMessage = 'whisky == 1'
    const validation = v.create({
        beer: [
            v.when('sex', ({ sex }) => sex === 'male')
                .when('age', ({ age }) => age > 20)
                .expect(bMessage, ({ beer }) => beer >= 1),
            v.validate('whisky')],
        whisky: [
            v.when('sex', ({ sex }) => sex === 'male')
                .when('age', ({ age }) => age > 20)
                .expect(wMessage, ({ whisky }) => whisky == 1),
            v.validate('bear')
        ]
    })
    let r
    r = validation.test({ sex: 'male', age: 21, beer: 2, whisky: 2 })
    expect(r.pass).toEqual(false)
    expect(r.messages.whisky).toEqual(wMessage)
})

// v.isBool
// v.oneOf
// v.expect(`${0} is requried`)
test('Form I', () => {
    const validation = v.create({
        NAME: v.expect('required'),
        AGE: v.expect('required').
            expect('is number', c => v.isInteger(c.AGE)),
        DATE_OF_BIRTH: v.expect('required').
            expect('is Date', c => v.isDate(c.DATE_OF_BIRTH)).
            expect('less than today', c => c.DATE_OF_BIRTH < new Date()), // multi expect
        MARRIAGE: v.expect('one of single/married', c => ['single', 'married'].includes(c.MARRIAGE)),
        DATE_OF_MARRIAGE: [ // multi rules
            v.when('MARRIAGE', c => c.MARRIAGE === 'single').
                expect('leave it empty for single', c => !v.isTruthy(c.DATE_OF_MARRIAGE)),
            v.when('MARRIAGE', c => c.MARRIAGE === 'married').
                expect('required'),
            v.expect('not greater than today', c => c.DATE_OF_MARRIAGE <= new Date()),
            v.when('DATE_OF_BIRTH').
                expect('greater than date of birth', c => c.DATE_OF_MARRIAGE > c.DATE_OF_BIRTH),
        ]
    })

    let r
    r = validation.test({ NAME: '' })
    expect(r.pass).toEqual(false)
    expect(r.messages.NAME).toEqual('required')

    r = validation.test({ AGE: 'a' })
    expect(r.pass).toEqual(false)
    expect(r.messages.AGE).toEqual('is number')

    r = validation.test({ DATE_OF_BIRTH: new Date('3010-1-1') })
    expect(r.pass).toEqual(false)
    expect(r.messages.DATE_OF_BIRTH).toEqual('less than today')

    r = validation.test({ MARRIAGE: 'yes' })
    expect(r.pass).toEqual(false)
    expect(r.messages.MARRIAGE).toEqual('one of single/married')

    r = validation.test({ DATE_OF_MARRIAGE: '2' }, { MARRIAGE: 'single' })
    expect(r.pass).toEqual(false)
    expect(r.messages.DATE_OF_MARRIAGE).toEqual('leave it empty for single')

    r = validation.test({ DATE_OF_MARRIAGE: '' }, { MARRIAGE: 'married' })
    expect(r.pass).toEqual(false)
    expect(r.messages.DATE_OF_MARRIAGE).toEqual('required')

    r = validation.test({ DATE_OF_MARRIAGE: new Date('3010-1-1') }, { MARRIAGE: 'married' })
    expect(r.pass).toEqual(false)
    expect(r.messages.DATE_OF_MARRIAGE).toEqual('not greater than today')

    r = validation.test({ DATE_OF_MARRIAGE: new Date('1999-1-1') }, { MARRIAGE: 'married', DATE_OF_BIRTH: new Date('2000-1-1') })
    expect(r.pass).toEqual(false)
    expect(r.messages.DATE_OF_MARRIAGE).toEqual('greater than date of birth')
})