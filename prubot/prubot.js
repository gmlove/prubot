const apiai = require('apiai');
const uuid = require('uuid');
const _ = require('underscore');
const { CreditCardExtractor } = require('./ocr');

class PruBot {

    constructor(accessToken, language, ocrService) {
        this.apiaiService = apiai(accessToken, {language: language || 'en'});
        this.sessionIds = new Map();
        this.ocrService = ocrService;
    }

    async message(message) {
        if (message.image) {
            message.text = await this._extractCreditCard(message.image);
            console.log(message.text);
        }
        if (!this.sessionIds.has(message.userId)) {
            this.sessionIds.set(message.userId, uuid.v4());
        }
        console.log(`request to apiai: '${message.text}'`);
        let apiaiRequest = this.apiaiService.textRequest(message.text, {
            sessionId: this.sessionIds.get(message.userId)
        });
        let response = await new Promise((resolve, reject) => {
            apiaiRequest.on('response', (response) => {
                resolve(response);
            });
            apiaiRequest.on('error', (error) => reject(error));
            apiaiRequest.end();
        });
        console.log('response from apiai:', JSON.stringify(response));
        if (response.result && response.result.fulfillment) {
            let responseText = response.result.fulfillment.speech;
            let responseData = response.result.fulfillment.data;
            let responseMessages = response.result.fulfillment.messages;
            if (responseText) {
                return {text: responseText, userId: message.userId};
            } else if (responseMessages) {
                let textMessage = responseMessages.filter((m) => m.type === 0)[0].speech;
                return {text: textMessage, userId: message.userId};
            } else {
                return {text: 'no response', userId: message.userId};
            }
        }
    }

    async _extractCreditCard(image) {
        let text = await this.ocrService.recognize(image);
        return new CreditCardExtractor().extract(text);
    }

}

module.exports = {
    PruBot: PruBot
};