const { Chainable, analyse }        = require('../');
const { expect, should }            = require('chai');

should();

describe('Chain of mutation methods', () => {

  const API = Chainable({
    setField: (key, val) => {
      return () => ({ [key]: val })
    },

    increment(key) {
      return state => ({ [key]: state[key] + 1 });
    },

    decrement(key) {
      return state => ({ [key]: state[key] - 1 });
    },

    nullify(key) {
      return () => ({ [key]: null });
    }
  }, (chain, state) => {
    // resolve method
    return chain.reduce((changes, fn) => {
      return { ...changes, ...fn(state )}
    }, {});
  });

  const { setField } = API;

  it('should a create a change record for a single mutation', (done) => {
    const transform = setField('foo', 'bar');

    const change = transform({});
    expect(change).to.deep.equal({
      foo: 'bar'
    });
    done();
  });

  it('should a create a change record for chain of mutations', (done) => {
    const transform = setField('foo', 'bar')
      .andThen.increment('num')
      .andThen.nullify('xyz');

    const change = transform({ num: 33 });
    expect(change).to.deep.equal({
      foo: 'bar',
      num: 34,
      xyz: null
    });
    done();
  });

  it('applies the transformations in the correct order', (done) => {
    const transform = setField('foo', 'bar')
      .andThen.increment('num')
      .andThen.nullify('num');

    const change = transform({ num: 33 });
    expect(change).to.deep.equal({
      foo: 'bar',
      num: null
    });
    done();
  });

  it('should enumerate applied mutations', () => {
    const transform = setField('foo', 'bar')
      .andThen.increment('num')
      .andThen.nullify('num');

    analyse(transform).should.deep.equal([
      { setField:  ['foo', 'bar'] },
      { increment: ['num']},
      { nullify: ['num'] }
    ]);
  });
});
