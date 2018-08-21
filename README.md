# break-async-iterator

**Problem:**

<!-- https://github.com/tc39/proposal-async-iteration/issues/126#issuecomment-403454433 -->

```js
const neverResolves /*(without user input)*/ = process.stdin /* (Readable is an async iterator as of Node v10) */
async function* stuck() {
  for await (const i of neverResolves) {
    yield // never reaches
  }
}
let i = stuck()
i.next() // stuck
i.return() // still stuck
```

**Solution**

```js
const breakAI = require('break-async-iterator')

const notStuck = breakAI(breakable => async function*() {
  try {
    for await (const i of breakable(neverResolves)) {
      yield
    }
  } finally {
    // reaches when `i.return()` or `i.throw()` is called
  }
})
let i = notStuck()
i.next() // still stuck
i.return() // but at least this can break the for-await loop
```

## Install

```
npm i break-async-iterator
```

## Usage

### API

**`breakAI(breakable => async function* asyncGenerator(){...})`**

* **`breakable`** A function that takes an iterator or a promise and returns a breakable version of the same

* **Returns** An async generator that returns an iterator (wrapped around the one returned by `asyncGenerator()`) that's able to interrupt any iterators or promises (that were passed through **`breakable()`**) when its `.return()` or `.throw()` are called

### Example

If you have an async generator function like this:

```js
async function* asyncGenerator() {
  for await (const value of anotherAsyncIterator) {
    yield value
  }
  yield await aPromise
}
```

Then simply wrap it like this

```js
const asyncGenerator = breakAI(breakable => async function*() {
  // and wrap any inner asyncIterators or promises with breakable:
  for await (const value of breakable(anotherAsyncIterator)) {
    yield value
  }
  yield await breakable(aPromise)
})
```


