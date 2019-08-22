# Functional chain

[![forthebadge](https://forthebadge.com/images/badges/you-didnt-ask-for-this.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/built-with-swag.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/no-ragrets.svg)](https://forthebadge.com)

A micro engine to create a chainable function APIs

## Installation

```bash
npm install --save functional-chain
```

## Basic example

Two arguments must be passed to the `Chainable` method in order to generate the function chain

1. An object of function builders. Each representing one method of the api
2. A `"resolve"` method, that will receive an array of all the functions, that have been chained. Its role is to call the functions and return the final output

```javascript
const { Chainable } = require('functional-chain');

const API = Chainable({
  add: (val) => {
    return num => num + val
  },

  subtract(val) {
    return num => num - val
  },

  multiplyBy(val) {
    return num => num * val
  },

  divideBy(val) {
    return num => num / val
  }
}, (chain, num) => {
  return chain.reduce((mem, fn) => fn(mem), num);
})

const { multiplyBy } = API;

const operation = multiplyBy(2)
  .and.subtract(6)
  .and.divideBy(2);

  // 33 * 2 => 66
  // 66 - 6 => 60
  // 60 / 2 => 30
  const res = operation(33);
  console.log(res) // -> 30
```

## Analysing the chain

An `analyse( chain )` method is provided which allows reflection and serialization of operation chains

```javascript

// ...

const operation = multiplyBy(2)
  .and.subtract(6)
  .and.divideBy(2);

analyse(operation);

// output =>
[
  { multiplyBy:  [2] },
  { subtract: [6]},
  { divideBy: [2] }
]


```


## Usage case example: Redux reducer

Let's write an example of a Redux store, which uses our chainable methods to apply transformations to the store.

First version, a standard reducer:

```javascript

const initialState = {
  requestCount: 0,
  loading:      false,

  // ...
};

createStore((state = initialState, action) => {
  switch (action.type) {
    case: 'START_REQUEST':
      const count = state.requestCount + 1;
      return { ...state, requestCount: count, loading: count > 0 }
    case: 'END_REQUEST':
      const count = state.requestCount - 1;
      return { ...state, requestCount: count, loading: count > 0 }

    // ...
  }
  return state;
});
```

Now, we take this a we try to add it some fun function chaining.

Let's build a little helper API to combine changes together

```javascript
const API = Chainable({
  increment(key) {
    return state => ({ [key]: state[key] + 1 });
  },

  decrement(key) {
    return state => ({ [key]: state[key] - 1 });
  },

  updateLoading() {
    return (state) => ({'loading': state.requestCount > 0 });
  }
}, (chain, state) => {
  // resolve method
  return chain.reduce((changes, fn) => {
    return { ...changes, ...fn(state )}
  }, {});
});
```

Now we use that in our store to define state transformations

```javascript
const { increment, decrement } = require('./stateHelpers');

const transformations = {
  "START_REQUEST": increment('requestCount')
    .and.updateLoading();

  "END_REQUEST": decrement('requestCount')
    .and.updateLoading();
};

createStore((state = initialState, action) => {
  const mut = transformations[action.type];
  if (!mut) {
    return state;
  }
  return { ...state, ...mut(state, action) };
})
```




