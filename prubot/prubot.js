const apiai = require('apiai');
const uuid = require('uuid');
const _ = require('underscore');
const { CreditCardExtractor, InvoiceAmountExtractor } = require('./ocr');

class PruBot {

    constructor(accessToken, language, ocrService) {
        this.apiaiService = apiai(accessToken, {language: language || 'en'});
        this.sessionIds = new Map();
        this.ocrService = ocrService;
        this.dialogHistories = new Map();
    }

    isAskingFor(userId) {
        return 'credit-card';
    }

    async tryTranslateImage(message) {
        if (message.image) {
            switch(this.isAskingFor(message.userId)) {
            case 'credit-card':
                message.text = await this._extractCreditCard(message.image);
                break;
            case 'bill-amount':
                message.text = await this._extractCreditCard(message.image);
                break;
            default:
                throw new Error('not supported image type.');
            }
            console.log('translated message to text: ', message.text);
        }
    }

    async _initiate(message) {
        console.log('send welcome request to apiai');
        let apiaiRequest = this.apiaiService.eventRequest({name: 'Welcome'}, {
            sessionId: this.sessionIds.get(message.userId)
        });
        let response = await this._parseResponse(apiaiRequest);
        let ack = this.constructAck(message, response);
        return ack;
    }

    async _parseResponse(apiaiRequest) {
        return new Promise((resolve, reject) => {
            apiaiRequest.on('response', (response) => {
                console.log('response from apiai:', JSON.stringify(response));
                resolve(response);
            });
            apiaiRequest.on('error', (error) => reject(error));
            apiaiRequest.end();
        });
    }

    async message(message) {
        await this.tryTranslateImage(message);
        if (!this.sessionIds.has(message.userId)) {
            this.sessionIds.set(message.userId, uuid.v4());
        }
        if (!this.dialogHistories.has(message.userId)) {
            this.dialogHistories.set(message.userId, []);
        }
        if (!message.text && !message.image) {
            return await this._initiate(message);
        } else {
            return await this._message(message);
        }
    }

    async _message(message) {
        console.log(`request to apiai: '${message.text}'`);
        let apiaiRequest = this.apiaiService.textRequest(message.text, {
            sessionId: this.sessionIds.get(message.userId)
        });
        let response = await this._parseResponse(apiaiRequest);
        let ack = this.constructAck(message, response);
        this.dialogHistories.get(message.userId).push({q: message, a: ack});
        return ack;
    }

    constructAck(message, response) {
        let ack;
        if (response.result && response.result.fulfillment) {
            let responseText = response.result.fulfillment.speech;
            let responseData = response.result.fulfillment.data;
            let responseMessages = response.result.fulfillment.messages;
            if (responseText) {
                ack = {text: responseText, userId: message.userId};
            } else if (responseMessages) {
                let textMessage = responseMessages.filter((m) => m.type === 0)[0].speech;
                ack = {text: textMessage, userId: message.userId};
            } else {
                ack = {text: 'no response', userId: message.userId};
            }
        } else {
            ack = {text: 'no response', userId: message.userId};
        }
        return ack;
    }

    async _extractCreditCard(image) {
        let text = await this.ocrService.recognize(image);
        return new CreditCardExtractor().extract(text);
    }

    async _extractBillAmount(image) {
        let text = await this.ocrService.recognize(image);
        return new InvoiceAmountExtractor().extract(text);
    }

}

module.exports = {
    PruBot: PruBot
};