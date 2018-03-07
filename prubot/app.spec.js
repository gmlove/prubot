const Application = require('./app').Application;
const expect = require('chai').expect;
const fetch = require('node-fetch');
const fs = require('fs');

describe('post chat message', () => {
    var app;

    before(() => {
        var port = Math.floor(Math.random() * 1000) + 12000;
        const PruBot = require('./prubot').PruBot;
        let ocrService = { recognize: async () => 'CREDIT CARD\n7253 3256 7895 1245\n5422.' };
        let bot = new PruBot(process.env.APIAI_ACCESS_TOKEN || 'b339df6ba3d144028e53cd6a8a3f4e50', 'en', ocrService);
        app = new Application(port, bot);
        app.start();
    });

    after(() => {
        app.stop();
    });

    it('should get an answer for text from bot service', async () => {
        const res = await fetch(`http://localhost:${app.port}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text : 'hello',
                userId: '123'
            })
        });
        const answer = await res.json();
        expect(answer.text).to.not.be.empty;
        console.log(answer);
        expect(res.status).to.eq(200);
        expect(answer.text).to.not.be.empty;
        expect(answer.userId).to.eq('123');
    });

    it('should get an answer for image from bot service', async () => {
        const res = await fetch(`http://localhost:${app.port}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: '123',
                image: fs.readFileSync('./resource_test/credit-card.b64', 'utf8')
            })
        });
        const answer = await res.json();
        expect(answer.text).to.not.be.empty;
        console.log(answer);
        expect(res.status).to.eq(200);
        expect(answer.text).to.not.be.empty;
        expect(answer.userId).to.eq('123');
    });

});