import { preset } from '../src'

test('test', () => expect(1).toEqual(1))

test('preset require', () => {
    const v = preset({
        require: expect => expect('this is required')
    })
    const validation = v.create({
        a: v.require()
    })

    let r
    r = validation.test({ a: '', b: '' })
    expect(r.pass).toEqual(false)
    expect(r.messages.a).toEqual('this is required')
})

test('preset min', () => {
    const v = preset({
        min: (expect, n) => expect(`>${n}`, c => c['$0'] > n)
    })
    const validation = v.create({
        a: v.min(3)
    })

    let r
    r = validation.test({ a: 2 })
    expect(r.pass).toEqual(false)
    expect(r.messages.a).toEqual('>3')
})

test('preset require min', () => {
    const v = preset({
        required: (expect) => expect(`required`, c => c['$0']),
        min: (expect, n) => expect(`>${n}`, c => c['$0'] > n),
        max: (expect, n) => expect(`<${n}`, c => c['$0'] < n),
    })
    const validation = v.create({
        a: v.required().min(4).max(7)
    })

    let r
    r = validation.test({ a: '' })
    expect(r.pass).toEqual(false)
    expect(r.messages.a).toEqual('required')

    r = validation.test({ a: 3 })
    expect(r.pass).toEqual(false)
    expect(r.messages.a).toEqual('>4')

    r = validation.test({ a: 8 })
    expect(r.pass).toEqual(false)
    expect(r.messages.a).toEqual('<7')
})

test('preset require min expect', () => {
    const v = preset({
        min: (expect, n) => expect(`>${n}`, c => c['$0'] > n),
        required: (expect) => expect(`required`, c => c['$0'])
    })
    const validation = v.create({
        a: v.required().min(4).expect('<15', c => c['a'] < 15)
    })

    let r
    r = validation.test({ a: 17 })
    expect(r.pass).toEqual(false)
    expect(r.messages.a).toEqual('<15')
})