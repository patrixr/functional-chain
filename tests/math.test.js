const { Chainable, analyse }        = require('..');
const { expect, should }            = require('chai');

should();

describe('Chain of mathematical operations', () => {

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
  }, (chain, num) => { return chain.reduce((mem, fn) => fn(mem), num) })

  const { add, multiplyBy } = API;

  it('should add 10', (done) => {
    const operation = add(10);

    const res = operation(33);
    expect(res).to.eq(43);
    done();
  });

  it('should multiplyBy 2', (done) => {
    const operation = multiplyBy(2);

    const res = operation(33);
    expect(res).to.eq(66);
    done();
  });

  it('should chain multiple operations', (done) => {
    const operation = multiplyBy(2)
      .and.subtract(6)
      .and.divideBy(2);

    // 33 * 2 => 66
    // 66 - 6 => 60
    // 60 / 2 => 30
    const res = operation(33);
    expect(res).to.eq(30);
    done();
  });

  it('should enumerate applied operations', (done) => {
    const operation = multiplyBy(2)
      .and.subtract(6)
      .and.divideBy(2);

      analyse(operation).should.deep.equal([
        { multiplyBy:  [2] },
        { subtract: [6]},
        { divideBy: [2] }
      ]);
      done();
  });

});
