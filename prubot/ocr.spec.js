const { OCRService, CreditCardExtractor }  = require('./ocr');
const fs = require('fs');
const expect = require('chai').expect;

describe('image recognizer', () => {
    var ocr, cardNumberExtractor;

    before(() => {
        ocr = new OCRService('AIzaSyBCmBskZqIYZAMi3CjB4cNRqJOv3K-sTHQ');
        cardNumberExtractor = new CreditCardExtractor();
    });

    it('should recognize text of image', async () => {
        const text = await ocr.recognize(fs.readFileSync('./resource_test/credit-card.b64', 'utf8'));
        console.log(text);
    });

    it('should recognize numbers of a card', async () => {
        const text = await ocr.recognize(fs.readFileSync('./resource_test/credit-card.b64', 'utf8'));
        const cardNumber = cardNumberExtractor.extract(text);
        expect(cardNumber).to.eq('7253325678951245');
    });

});