const { Chainable, analyse }        = require('..');
const { expect, should }            = require('chai');

should();

describe('Chain of mathematical operations', () => {

  const API = Chainable({
    push: (val) => {
      return arr => [ ...arr, val ]
    },

    incrementAll: () => {
      return arr => arr.map(v => v + 1);
    },

    mapToDay: () => {
      return arr => arr.map(v => [
        'Mon', 'Tue', 'Wed',
        'Thur', 'Fri', 'Sat',
        'Sun'
      ][v]);
    }
  }, (chain, arr) => {
    return chain.reduce((mem, fn) => fn(mem), arr)
  });

  const { push } = API;

  it('array transformations', (done) => {
    const transform = push(2)
      .and.push(3)
      .and.incrementAll()
      .and.mapToDay();

    const res = transform([1]);
    expect(res).to.deep.equal([
      'Wed', 'Thur', 'Fri'
    ]);
    done();
  });
});
