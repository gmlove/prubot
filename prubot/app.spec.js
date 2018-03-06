const Application = require('./app').Application;
const expect = require('chai').expect;
const fetch = require('node-fetch');

describe('post chat message', () => {
    var app;

    before(() => {
        var port = Math.floor(Math.random() * 1000) + 12000;
        app = new Application(port);
        app.start();
    });

    after(() => {
        app.stop();
    });

    it('should get an answer from bot service', async () => {
        const res = await fetch(`http://localhost:${app.port}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message : 'test'
            })
        });
        const answer = await res.json();
        expect(answer.text).to.not.be.empty;
        expect(res.status).to.eq(200);
    });

});