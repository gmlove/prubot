const { JetService }  = require('./jetservice');
const { UserService } = require('./user');
const fs = require('fs');
const expect = require('chai').expect;

describe('image recognizer', () => {
    var jetService, userService;

    before(() => {
        userService = new UserService();
        jetService = new JetService(userService);
    });

    it('should call jet service to make decision', async () => {
        let decision = await jetService.decisionResult('C823494', '', {billAmount: 21000});
        console.log('decision: ', JSON.stringify(decision));
    });
});
