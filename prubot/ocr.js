const fetch = require('node-fetch');
const fs = require('fs');


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


module.exports = {
    OCRService: OCRService,
    CreditCardExtractor: CreditCardExtractor
};
