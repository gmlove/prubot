const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const busboy = require('connect-busboy');
const fs = require('fs');
const PruBot = require('./prubot').PruBot;
const { OCRService } = require('./ocr');

class Application {
    constructor(port, bot) {
        this.port = port;
        this.app = express();
        this.server = null;
        this.bot = bot;
    }

    start() {
        this.app.use(busboy({
            highWaterMark: 10 * 1024 * 1024,
            limits: {
                fileSize: 20 * 1024 * 1024
            }
        }));
        this.app.use(bodyParser.json({limit: '10mb', type: 'application/json'}));
        this.app.use(bodyParser.urlencoded({limit: '10mb'}));
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

        this.app.post('/fileupload', (req, res) => {
            if (req.busboy) {
                req.busboy.on('file', function (fieldname, file, filename) {
                    let savedFileName = uuid.v4();
                    console.log(`Uploading: ${filename} to ${savedFileName}`);
                    let fstream = fs.createWriteStream('/tmp/' + savedFileName);
                    file.pipe(fstream);
                    fstream.on('close', function () {
                        res.json({fileId: savedFileName});
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
    let bot = new PruBot(process.env.APIAI_ACCESS_TOKEN || '53ded8d59c684f69b381638d7e4ef7f0', 'en', ocrService);
    new Application(3000, bot).start();
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