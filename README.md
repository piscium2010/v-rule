# v-rule
Light and flexible validatin rules for form


## Advantages:

-   Dead simple API, learned in 5 minutes.
-   Quite flexible
-   Small library with no dependence

## API
-   when(key: string, assert?: context => bool)
-   expect(desc: string, assert? context => bool)
-   validate(key: string)

## Install

```js
npm i -S v-rule
```

## Example

**Basic**

```jsx
import v from 'v-rule'
const validation = v.create({
        name: v.expect('required'),
        pwd: v.expect('required'),
        confirm: v.when('pwd')
            .expect('should match pwd', c => c.pwd === c.confirm)
    })
let result

result = validation.test({ name: '', pwd: '' })
// => { pass: false, messages: { name: 'required', pwd: 'required' } }

result = validation.test({ name: '', pwd: '2', confirm: '3' })
// => r { pass: false, messages: { name: 'required', pwd: '', confirm: 'should match pwd' } }
```

**Compound**

```js
const validation = v.create({
    age: v.expect('required').expect('should be number', c => v.isInteger(c.age))
})

const result = validation.test({ age: 'seven' })
// => { pass: false, messages: { age: 'should be number' } }
```

**Multi rules**

```js
const validation = v.create({
    age: [
        v.expect('required')
        .expect('should be number', c => v.isInteger(c.age)), // 1st rule
        v.when('min') // 2nd rule, only execute when 1st rule pass
        .when('max')
        .expect(
            'should between min and max',
            c => c.min < c.age && c.age < c.max
        )
    ]
})

const result = validation.test({ age: '17', min: 18, max: 50 })
// => r { pass: false, messages: { age: 'should between min and max' } }
```

**Trigger another rule**

```js
const validation = v.create({
    beer: v.when('beer').validate('age'), // or v.validate('age')
    age: v.expect('age should be greater than 18', c => c.age > 18)
})

const context = {age: '17'}
const result = validation.test({ beer: 1 }, context)
// => { pass: false, messages: { age: 'age should be greater than 18' } }
```

**Test all rules**

v.test only tests with available keys in obj whereas testAllRules will test all keys against all rules. Keys not provided will default to {key: undefined}. Use v.testAllRules when submit form.

```js
const validation = v.create({
    name: v.expect('required'),
    pwd: v.expect('required')
})
let r = validation.testAllRules({ name: 'a' })
// => { pass: false, messages: { name: '', pwd: 'required' } }
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
