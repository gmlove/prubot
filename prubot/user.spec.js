const { UserService, User }  = require('./user');
const fs = require('fs');
const expect = require('chai').expect;

describe('image recognizer', () => {
    let userSerivce;

    before(() => {
        userSerivce = new UserService();
    });

    it('should find user', () => {
        let user = userSerivce.getUser('1231');
        expect(user).to.not.be.empty;
        expect(user.name).to.eq('Bob');
    });

    it.only('should query user profile', async () => {
        let profile = await userSerivce.queryProfile('C823928');
        console.log('profile: ', profile);
    });
});
