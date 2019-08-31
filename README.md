# v-rules
Form validation rules


## Advantages:

-   Dead simple API, learned in 1 minutes. u will feel like u are so smart
-   Quite flexible
-   Small library with no dependence

## API
-   when(key: string, assert?: context => bool)
-   expect(desc: string, assert? context => bool)
-   validate(key: string)

## Example

**basic**

```jsx
const validation = v.create({
        name: v.expect('required'),
        pwd: v.expect('required'),
        confirm: v.when('pwd').expect('should match pwd', c => c.pwd === c.confirm)
    })
let result
result = validation.test({ name: '', pwd: '' })
// => { pass: false, messages: { name: 'required', pwd: 'required' } }

result = validation.test({ name: '', pwd: '2', confirm: '3' })
// => r { pass: false, messages: { name: 'required', pwd: '', confirm: 'should match pwd' } }
```

**compound**

```js
const validation = v.create({
    age: v.expect('required').expect('should be number', c => v.isInteger(c.age))
})
const result = validation.test({ age: 'seven' })
// => { pass: false, messages: { age: 'should be number' } }
```

**multi rules**

```js
const validation = v.create({
    age: [
        v.expect('required').expect('should be number', c => v.isInteger(c.age)), // 1st rule
        v.when('min').when('max').expect('should between min and max', c => c.min < c.age && c.age < c.max)
    ]
})
const result = validation.test({ age: '17', min: 18, max: 50 })
// => r { pass: false, messages: { age: 'should between min and max' } }
```

**trigger another validation**

```js
const validation = v.create({
        beer: v.when('beer').validate('age'), // or v.validate('age')
        age: v.expect('age should be greater than 18', c => c.age > 18)
    })
const context = {age: '17'}
const result = validation.test({ beer: 1 }, context)
// => { pass: false, messages: { age: 'age should be greater than 18' } }
```

**validate one**

```js
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
    // => { pass: false, messages: { DATE_OF_MARRIAGE: 'required when married' } }
```

**validate all**

```js
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

```

**utils**

-   v.isTruthy
-   v.isNumber
-   v.isInteger
-   v.isDate
-   v.isEmail
-   v.isUrl

## Tests
```
npm test
```
