const fetch = require('node-fetch');
const fs = require('fs');
const _ = require('underscore');


class OCRService {

    constructor(googleAPIKey) {
        this.googleAPIKey = googleAPIKey;
    }

    async recognize(image) {
        let texts = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${this.googleAPIKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: [
                    {
                        image: {
                            content: image
                        },
                        features: [
                            {
                                type: 'TEXT_DETECTION'
                            }
                        ]
                    }
                ]
            })
        });
        texts = await texts.json();
        // console.log(JSON.stringify(texts));
        return texts.responses[0].fullTextAnnotation.text;
    }

}


class CreditCardExtractor {
    constructor() {
    }

    extract(text) {
        console.log(`recognized text: '${text}'`);
        let cardNumberCandidate = text.split('\n').filter((t) => /^[0-9 ]*$/.test(t) && t.split(' ').join('').length > 12)[0];
        return cardNumberCandidate.split(' ').join('');
    }
}

class InvoiceAmountExtractor {
    constructor () {}

    searchInvoiceAmount(texts) {
        let text = texts.filter((t) => /^.*\s([0-9,.]*)$/.test(t))[0];
        console.log('amount search text result: ', text);
        if (text) {
            return parseFloat(/^.*\s([0-9,.]*)$/.exec(text)[1].replace(/,/g, ''));
        }
        return 10000;
    }

    extract(text) {
        console.log(`recognized text: '${text}'`);
        let texts = text.split('\n');
        let invoiceAmount;
        for (let i = 0; i < texts.length; i++) {
            if (/notice\s*注意/.test(texts[i].toLowerCase())) {
                invoiceAmount = this.searchInvoiceAmount(texts.slice(0, i).reverse());
                break;
            }
        }
        console.log(`invoiceAmount: ${invoiceAmount}`);
        return invoiceAmount;
    }
}


module.exports = {
    OCRService: OCRService,
    CreditCardExtractor: CreditCardExtractor,
    InvoiceAmountExtractor: InvoiceAmountExtractor
};
