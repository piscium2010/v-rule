import { hasValue, isInteger, isNumber, isEmail, isUrl } from '../src/util'

let index = 0
let title = t => t + index++

test(title('isNumber'), () => { expect(isNumber('1')).toEqual(true) })
test(title('isNumber'), () => { expect(isNumber('a')).toEqual(false) })
test(title('isNumber'), () => { expect(isNumber('3.5')).toEqual(true) })
test(title('isNumber'), () => { expect(isNumber('3.5a')).toEqual(false) })
test(title('isNumber'), () => { expect(isNumber('3..5a')).toEqual(false) })
test(title('isNumber'), () => { expect(isNumber('3.50')).toEqual(true) })
test(title('isNumber'), () => { expect(isNumber('-3.50')).toEqual(false) })
test(title('isNumber'), () => { expect(isNumber('--3.50')).toEqual(false) })
test(title('isNumber'), () => { expect(isNumber('-+3.50')).toEqual(false) })
test(title('isNumber'), () => { expect(isNumber('+3.50')).toEqual(false) })
test(title('isNumber'), () => { expect(isNumber('3.5.0')).toEqual(false) })

test(title('isInteger'), () => { expect(isInteger('1')).toEqual(true) })
test(title('isInteger'), () => { expect(isInteger('a')).toEqual(false) })
test(title('isInteger'), () => { expect(isInteger('3.5')).toEqual(false) })
test(title('isInteger'), () => { expect(isInteger('3.5a')).toEqual(false) })
test(title('isInteger'), () => { expect(isInteger('3..5a')).toEqual(false) })
test(title('isInteger'), () => { expect(isInteger('3.50')).toEqual(false) })
test(title('isInteger'), () => { expect(isInteger('-3.50')).toEqual(false) })
test(title('isInteger'), () => { expect(isInteger('--3.50')).toEqual(false) })
test(title('isInteger'), () => { expect(isInteger('-+3.50')).toEqual(false) })
test(title('isInteger'), () => { expect(isInteger('+3.50')).toEqual(false) })
test(title('isInteger'), () => { expect(isInteger('3.5.0')).toEqual(false) })

test(title('isInteger'), () => { expect(isInteger('10')).toEqual(true) })
test(title('isInteger'), () => { expect(isInteger('01')).toEqual(true) })
test(title('isInteger'), () => { expect(isInteger('a01')).toEqual(false) })
test(title('isInteger'), () => { expect(isInteger('1123')).toEqual(true) })

test(title('isEmail'), () => { expect(isEmail('a@a.cn')).toEqual(true) })
test(title('isEmail'), () => { expect(isEmail('2@')).toEqual(false) })
test(title('isUrl'), () => { expect(isUrl('https://www.google.com')).toEqual(true) })
test(title('isUrl'), () => { expect(isUrl('a@a.cn')).toEqual(false) })