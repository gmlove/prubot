const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const busboy = require('connect-busboy');
const fs = require('fs');
const PruBot = require('./prubot').PruBot;
const { OCRService } = require('./ocr');
const fetch = require('node-fetch');

class Application {
    constructor(port, bots) {
        this.port = port;
        this.app = express();
        this.server = null;
        this.bots = bots;
        this.bot = bots.zh;
    }

    start() {
        this.app.use(busboy({
            highWaterMark: 10 * 1024 * 1024,
            limits: {
                fileSize: 20 * 1024 * 1024
            }
        }));
        this.app.use(bodyParser.json({ limit: '10mb', type: 'application/json' }));
        this.app.use(bodyParser.urlencoded({ limit: '10mb' }));
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            console.log(res);
            res.status(500).send('Something broke!');
        });

        this.app.post('/message', async (req, res) => {
            console.log('request.body.keys: ', Object.keys(req.body));
            let ackMessage = await this.bot.message(req.body);
            console.log('ack: ', JSON.stringify(ackMessage));
            res.json(ackMessage);
        });

        this.app.post('/language', (req, res) => {
            console.log('request.body: ', req.body);
            this.bot = this.bots[req.body.language];
            res.status(200).send('');
        });

        this.app.get('/claim/:userId', (req, res) => {
            res.status(200).send({
                success: this.bot.claimFinished(parseInt(req.params.userId)),
                claimNumber: '80224363',
                policyNumber: '000011581234',
                amount: '150000',
                age: 35
            });
        });

        this.app.get('/chathistory/:userId', async (req, res) => {
            let userId = 1;
            res.json(this.chatRoom.getChatHistory(userId));
        });

        this.app.post('/fileupload', (req, res) => {
            if (req.busboy) {
                req.busboy.on('file', function (fieldname, file, filename) {
                    let savedFileName = uuid.v4();
                    console.log(`Uploading: ${filename} to ${savedFileName}`);
                    let fstream = fs.createWriteStream('/tmp/' + savedFileName);
                    file.pipe(fstream);
                    fstream.on('close', function () {
                        res.json({ fileId: savedFileName });
                    });
                });
                req.pipe(req.busboy);
            } else {
                res.status(400).send('no file found');
            }
        });

        this.server = this.app.listen(this.port, '0.0.0.0', () => {
            console.log(`App listening on port ${this.port}!`);
        });
    }

    stop() {
        this.server.close();
    }
}

if (require.main === module) {
    let ocrService = new OCRService('AIzaSyBCmBskZqIYZAMi3CjB4cNRqJOv3K-sTHQ');
    let bot = new PruBot(process.env.APIAI_ACCESS_TOKEN || 'a032527b1630406cabc35ded607bfba3', 'en', ocrService);
    let botZh = new PruBot(process.env.APIAI_ACCESS_TOKEN || 'a8d3cedea1c14ca0984c63622c391494', 'zh-HK', ocrService);
    new Application(3000, { en: bot, zh: botZh }).start();
    process.on('uncaughtException', (exception) => {
        console.error('uncaughtException: ', exception);
        process.exit(1);
    });
    process.on('unhandledRejection', (rejection) => {
        console.error('unhandledRejection: ', rejection);
        process.exit(1);
    });
}

module.exports = {
    Application: Application
};