const PruBot = require('./prubot').PruBot;
const expect = require('chai').expect;
const sinon = require('sinon');
const fetch = require('node-fetch');
const fs = require('fs');

describe('post chat message', () => {
    var bot, ocrService;

    before(() => {
        ocrService = sinon.createStubInstance(require('./ocr').OCRService);
        bot = new PruBot('53ded8d59c684f69b381638d7e4ef7f0', 'en', ocrService);
    });

    it('should get an answer from api.ai bot service', async () => {
        const res = await bot.message({text: 'hello', userId: '123'});
        expect(res.text).to.not.be.empty;
    });

    it.only('should get a welcome answer when initiate', async () => {
        const res = await bot.message({userId: '123'});
        expect(res.text).to.not.be.empty;
    });

    it('should get an answer from aip.ai for image', async () => {
        ocrService.recognize.returns(Promise.resolve('CREDIT CARD\n7253 3256 7895 1245\n5422.'));
        const res = await bot.message({
            userId: '123',
            image: fs.readFileSync('./resource_test/credit-card.b64', 'utf8')
        });
        expect(res.text).to.not.be.empty;
    });

});