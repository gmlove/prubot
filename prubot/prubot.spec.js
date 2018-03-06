const PruBot = require('./prubot').PruBot;
const expect = require('chai').expect;
const fetch = require('node-fetch');

describe('post chat message', () => {
    var bot;

    before(() => {
        bot = new PruBot('b339df6ba3d144028e53cd6a8a3f4e50');
    });

    it('should get an answer from api.ai bot service', async () => {
        const res = await bot.message({text: 'hello', userId: '123'});
        console.log(res);
    });

});