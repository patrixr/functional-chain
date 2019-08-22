const { Chainable, analyse }        = require('..');
const { expect, should }            = require('chai');

should();

const fakeRequest = (user) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve() }, 10);
  });
};

const fetchUser = async () => {
  await fakeRequest();
  return { id: 1, name: 'Pat', roles: ['user'] };
}

describe('Chain of asynchronous API requests', () => {

  const UserAPI = Chainable({
    assignRole: (role) => {
      return async (user) => {
        await fakeRequest(user);
        return {
          ...user,
          roles: [ ...(user.roles || []), role ]
        }
      }
    },

    postComment(comment) {
      return async (user) => {
        await fakeRequest(user);
        return {
          ...user,
          comments: [ ...(user.comments || []), comment ]
        }
      };
    }
  }, async (chain, userId) => {
    let user = await fetchUser();
    for (let fn of chain) {
      user = await fn(user);
    }
    return user;
  });

  const { assignRole } = UserAPI;

  it('assign role asynchonously to the user', async () => {
    const makeKing = assignRole('king');
    const userId = 1;

    const res = await makeKing(userId);
    expect(res).to.deep.eq({
      id: 1,
      name: 'Pat',
      roles: ['user', 'king']
    });
  });

  it('apply multiple async changes to the user', async () => {
    const userId = 1;
    const operations = assignRole('king')
      .andThen
      .postComment('more wine !');

    const res = await operations(userId);
    expect(res).to.deep.eq({
      id: 1,
      name: 'Pat',
      roles: ['user', 'king'],
      comments: ['more wine !']
    });
  });

  it('should enumerate applied operations', (done) => {
    const userId = 1;
    const operations = assignRole('king')
      .andThen
      .postComment('more wine !');

    analyse(operations).should.deep.equal([
      { assignRole:  ['king'] },
      { postComment: ['more wine !']}
    ]);
    done();
  });
});
