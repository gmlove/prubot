const apiai = require('apiai');
const uuid = require('uuid');

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
        console.log(response);
        if (response.result && response.result.fulfillment) {
            let responseText = response.result.fulfillment.speech;
            let responseData = response.result.fulfillment.data;
            let responseMessages = response.result.fulfillment.messages;
            if (responseMessages) {
                return {text: responseMessages};
            } else if (responseText) {
                return {text: responseText};
            } else {
                return {text: 'no response'};
            }
        }
    }

}

module.exports = {
    PruBot: PruBot
};