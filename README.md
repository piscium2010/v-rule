# v-rule
Light and flexible validation rules for form


## Advantages:

-   Limited API, save you from complicated configuration
-   Quite flexible, able to compose any validation rule
-   Small library with no dependence

## Core API
-   when(key: string, assert?: func)
-   whenNot(key: string, assert?: func)
-   expect(desc: string, assert?: func)
-   validate(key: string)

## Install

```js
npm i -S v-rule
```

## Example - Order beer in restaurant

### 1
<div>
    <img width="600px" src="https://github.com/piscium2010/piscium2010.github.io/raw/master/v-rule/images/a.png">
</div>

```jsx
import v from 'v-rule'

const validation = v.create({
    // alternative v.expect('This is required')
    seat: v.expect('This is required', c => c['seat'] !== '')
})
const result = validation.test({ seat: '' })
// => { pass: false, messages: { seat: 'This is required' } }
```

### 2
<div>
    <img width="600px" src="https://github.com/piscium2010/piscium2010.github.io/raw/master/v-rule/images/b.png">
</div>

```jsx
import v from 'v-rule'

const validation = v.create({
    seat: v.expect('This is required', c => c['seat'] !== ''),
    age: v.when('drink', c => c['drink'] === 'budweiser')
    .expect('Required when drink beer')
})
const result = validation.test({ seat: '6', drink: 'budweiser', age: '' })
// => { pass: false, messages: { age: 'Required when drink beer' } }
```

### 3
<div>
    <img width="600px" src="https://github.com/piscium2010/piscium2010.github.io/raw/master/v-rule/images/c.png">
</div>

```jsx
import v from 'v-rule'

const validation = v.create({
    seat: v.expect('This is required', c => c['seat'] !== ''),
    age: v.when('drink', c => c['drink'] === 'budweiser')
    .expect('Required when drink beer')
    .expect('You should be older than 18', c => c['age'] > 17)
})
const result = validation.test({ seat: '6', drink: 'budweiser', age: 16 })
// => { pass: false, messages: { age: 'You should be older than 18' } }
```

### 4
<div>
    <img width="600px" src="https://github.com/piscium2010/piscium2010.github.io/raw/master/v-rule/images/d.png">
</div>

```jsx
import v from 'v-rule'

const validation = v.create({
    seat: v.expect('This is required', c => c['seat'] !== ''),
    age: v.when('drink', c => c['drink'] === 'budweiser')
    .expect('Required when drink beer')
    .expect('You should be an adult', c => c['age'] > 17)
})
const result = validation.test({ seat: '6', drink: 'budweiser', age: 18 })
// => { pass: true, messages: {} }
```

## Usage

**Preset**

```jsx
import { preset } from 'v-rule'

const v = preset({
    required: (expect) => expect(`required`),
    min: (expect, n) => expect(`> ${n}`, c => c['$0'] > n),
    max: (expect, m) => expect(`> ${m}`, c => c['$0'] < m),
})
const validation = v.create({
    number: v.required().min(4).max(30)
})
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

v.test only tests with available values in obj whereas testAllRules will default unavailable value to {key: undefined} and test against all rules. Use v.testAllRules when submit form.

```js
const validation = v.create({
    name: v.expect('required'),
    pwd: v.expect('required')
})
let r = validation.testAllRules({ name: 'a' })
// => { pass: false, messages: { name: '', pwd: 'required' } }
```
