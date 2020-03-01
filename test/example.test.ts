import v from '../src'

test('seat', () => {
    const validation = v.create({
        seat: v.expect('This is required', c => c['seat'] !== '') // alternative v.expect('This is required')
    })
    const result = validation.test({ seat: '' })
    // => { pass: false, messages: { seat: 'This is required' } }
    expect(result.pass).toEqual(false)
    expect(result.messages.seat).toEqual('This is required')
})

test('age', () => {
    const validation = v.create({
        seat: v.expect('This is required', c => c['seat'] !== ''),
        age: v.when('drink', c => c['drink'] === 'budweiser').expect('Required when drink beer')
    })
    const result = validation.test({ seat: '6', drink: 'budweiser', age: '' })
    // => { pass: false, messages: { age: 'Required when drink beer' } }
    expect(result.pass).toEqual(false)
    expect(result.messages.age).toEqual('Required when drink beer')
})

test('age > 18', () => {
    const validation = v.create({
        seat: v.expect('This is required', c => c['seat'] !== ''),
        age: v.when('drink', c => c['drink'] === 'budweiser').expect('Required when drink beer').expect('You should be an adult', c => c['age'] > 17)
    })
    const result = validation.test({ seat: '6', drink: 'budweiser', age: 16 })
    // => { pass: false, messages: { age: 'You should be an adult' } }
    expect(result.pass).toEqual(false)
    expect(result.messages.age).toEqual('You should be an adult')
})

test('ordered', () => {
    const validation = v.create({
        seat: v.expect('This is required', c => c['seat'] !== ''),
        age: v.when('drink', c => c['drink'] === 'budweiser').expect('Required when drink beer').expect('You should be an adult', c => c['age'] > 17)
    })
    const result = validation.test({ seat: '6', drink: 'budweiser', age: 18 })
    // => { pass: trues, messages: {} }
    expect(result.pass).toEqual(true)
})