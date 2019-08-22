function annotate(obj = {}) {
  return Object.keys(obj).reduce((res, key) => {
    const fn = obj[key];
    res[key] = (...params) => {
      const generatedFunction = fn(...params);
      generatedFunction.__args = params
      generatedFunction.__name = key
      return generatedFunction;
    };
    return res;
  }, {})
}

function analyse(chainWrapper) {
  return chainWrapper._chain.map((fn) => {
    return {
      [(fn.__name || '?')]: (fn.__args || [])
    };
  });
}

function Chainable(functionMap, resolve) {

  const annotatedMap = annotate(functionMap);

  /**
   * Function wrapper providing a chain api
   *
   * e.g Usage
   *  let fn = m.set('users').andThen.increment('userCount')
   *
   *  fn(state, action) => returns the changes to apply to the state
   *
   *
   * @export
   * @param {*} [chain=[]]
   * @returns
   */
  function Wrap(chain = []) {
    let chainWrapper = function (...params) {
      return resolve(chain, ...params);
    }

    for (let key in annotatedMap) {
      const fn = annotatedMap[key];
      chainWrapper[key] = (...params) => {
        // Build a fresh wrapper with the added function
        return Wrap([ ...chain, fn(...params) ]);
      }
    }

    chainWrapper.andThen = chainWrapper;
    chainWrapper.and = chainWrapper;
    chainWrapper._chain = chain;

    return chainWrapper;
  };


  return Object
    .keys(annotatedMap)
    .reduce((res, key) => {
      const fn = annotatedMap[key];
      res[key] = (...params) => Wrap([ fn(...params) ]);
      return res;
    }, {});
}

module.exports = { Chainable, analyse };
