const apiai = require('apiai');
const uuid = require('uuid');
const fs = require('fs');
const { JetService } = require('./jetservice');
const { UserService } = require('./user');
const { ManualProcess } = require('./manualprocess');
const _ = require('underscore');
const { CreditCardExtractor, InvoiceAmountExtractor } = require('./ocr');

class Status {
    constructor(userId) {
        this.userId = userId;
        this.lastUserMessage;
        this.lastBotMessage;
        this.eligible;
        this.history;
        this.creditCard;
        this.billInfo;
        this.eligible = true;
        this.step;
        this.claimFinished = false;
        this.conversationFinished = false;
    }
}

class PruBot {

    constructor(accessToken, language, ocrService) {
        this.apiaiService = apiai(accessToken, {language: language || 'en'});
        this.sessionIds = new Map();
        this.ocrService = ocrService;
        this.status = new Map();
        this.language = language;
        this.jetService = new JetService(new UserService());
        this.manualProcess = new ManualProcess();
    }

    isAskingFor(userId) {
        return 'credit-card';
    }

    claimFinished(userId) {
        console.log(userId);
        console.log(this.status.get(userId));
        return !!(this.status.get(userId) && this.status.get(userId).claimFinished);
    }

    async tryTranslateImage(message) {
        if (message.type) {
            switch(message.type) {
            case 'credit-card':
                message.image = new Buffer(fs.readFileSync('resource_test/credit-card.png')).toString('base64');
                message.creditCard = await this._extractCreditCard(message.image);
                break;
            case 'bill-info':
                // var billFile = Math.random() > 0.5 ? 'resource_test/non_eligible_bill.jpg' : 'resource_test/eligible_bill.jpg';
                // message.image = new Buffer(fs.readFileSync(billFile)).toString('base64');
                // message.billInfo = {billAmount: await this._extractCreditCard(message.image)};
                message.billInfo = {billAmount: 21000};
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
        if (!this.status.has(message.userId)) {
            this.status.set(message.userId, new Status(message.userId));
        }

        if (this.status.get(message.userId).step === 'cc-1') {
            this.status.get(message.userId).step = null;
            return await this._message({userId: message.userId, text: 'Done'});
        }

        if (this.status.get(message.userId).step === 'ne-1') {
            this.status.get(message.userId).step = null;
            return {
                text: '您的理賠申請資料已傳送到您的保險顧問Frankie，他會盡快與您聯系提出協助。\n多謝Karen！希望您滿意我的服務，祝您生活愉快。',
                userId: message.userId
            };
        }

        if (this.status.get(message.userId).conversationFinished && !this.status.get(message.userId).eligible) {
            this.status.get(message.userId).step = 'ne-1';
            this.status.get(message.userId).claimFinished = true;
            return {
                text: '謝謝，您的理賠申請正在處理中。您的理賠申請號碼為12345678。同時，想您的保險顧問聯絡您嗎？',
                userId: message.userId,
                payload: {
                    options: [
                        {id: 'talk-to-agent', text: '請我的保險顧問聯絡我。'},
                        {id: 'no-thanks', text: '不用了，謝謝。'}
                    ]
                }
            };
        }

        if (!message.text && !message.image) {
            return await this._initiate(message);
        } else if (message.type === 'bill-info') {
            // call jet service and control the flow
            let decision = await this.jetService.decisionResult('C823494', '', message.billInfo);
            this.status.get(message.userId).eligible = decision.eligible;
            if (!decision.eligible) {
                // TODO: add some text to the answer to indicate we'll go to manual process
                this.manualProcess.start();
                this.status.get(message.userId).eligible = false;
                return await this._message({text: 'payment', userId: message.userId});
            }

        // } else if (message.type === 'credit-card') {
        //     // collect credit card
        //     this.status.get(message.userId).step = 'cc-1';
        //     return {text: `您的銀行賬户號碼是${message.creditCard}嗎?`, userId: message.userId, payload: {
        //         options: [{id: 'confirm-credit-card-yes', text: '是的'}, {id: 'confirm-credit-card-no', text: '不对'}]
        //     }};
        } else {
            return await this._message(message);
        }
    }

    async _message(message) {
        console.log(`request to apiai: '${message.text}'`);
        let apiaiRequest = this.apiaiService.textRequest(message.text, {
            sessionId: this.sessionIds.get(message.userId),
            resetContexts: false
        });
        let response = await this._parseResponse(apiaiRequest);
        let ack = this.constructAck(message, response);
        return ack;
    }

    constructAck(message, response) {
        let ack;
        if (response.result && response.result.fulfillment) {
            let responseText = response.result.fulfillment.speech;
            let responseData = response.result.fulfillment.data;
            let responseMessages = response.result.fulfillment.messages;
            if (responseMessages) {
                let textMessage = responseMessages.filter((m) => m.type === 0)[0].speech;
                let payload = responseMessages.filter((m) => m.type === 4)[0];
                payload = payload ? payload.payload : {};
                ack = {text: textMessage, userId: message.userId, payload: payload};
            } else if (responseText) {
                ack = {text: responseText, userId: message.userId};
            } else {
                ack = {text: 'no response', userId: message.userId};
            }
        } else {
            ack = {text: 'no response', userId: message.userId};
        }
        this.status.get(message.userId);
        if (ack.text.indexOf('好的，請提供您的銀行賬户號碼。') != -1) {
            this.status.get(message.userId).conversationFinished = true;
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