const apiai = require('apiai');
const uuid = require('uuid');
const _ = require('underscore');

class PruBot {

    constructor(accessToken, language) {
        this.apiaiService = apiai(accessToken, {language: language || 'en'});
        this.sessionIds = new Map();
    }

    async message(message) {
        if (!this.sessionIds.has(message.userId)) {
            this.sessionIds.set(message.userId, uuid.v4());
        }
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

}

module.exports = {
    PruBot: PruBot
};