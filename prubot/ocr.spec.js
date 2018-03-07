const { OCRService, CreditCardExtractor, InvoiceAmountExtractor }  = require('./ocr');
const fs = require('fs');
const expect = require('chai').expect;

describe('image recognizer', () => {
    var ocr, cardNumberExtractor, invoiceAmountExtractor;

    before(() => {
        ocr = new OCRService('AIzaSyBCmBskZqIYZAMi3CjB4cNRqJOv3K-sTHQ');
        cardNumberExtractor = new CreditCardExtractor();
        invoiceAmountExtractor = new InvoiceAmountExtractor();
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

    it('should recognize invoice amount of a card (private bill)', async () => {
        const text = await ocr.recognize(fs.readFileSync('./resource_test/private_bill.b64', 'utf8'));
        const invoiceAmount = invoiceAmountExtractor.extract(text);
        expect(invoiceAmount).to.eq(9791);
    });

    it('should recognize invoice amount of a card (public bill)', async () => {
        const text = await ocr.recognize(fs.readFileSync('./resource_test/public_bill.b64', 'utf8'));
        const invoiceAmount = invoiceAmountExtractor.extract(text);
        expect(invoiceAmount).to.eq(315);
    });

    it.skip('should extract data from new invoice', async () => {
        const text = await ocr.recognize(fs.readFileSync('./resource_test/sample_invoice.b64', 'utf8'));
        const invoiceAmount = invoiceAmountExtractor.extract(text);
        expect(invoiceAmount).to.eq(315);
    });

});