const express = require('express');
const bodyParser = require('body-parser');
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
        this.app.use(bodyParser.json({limit: '5mb'}));
        this.app.use(bodyParser.urlencoded({limit: '5mb'}));
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

        this.server = this.app.listen(this.port, '0.0.0.0', () => {
            console.log(`App listening on port ${this.port}!`);
        });
    }

    stop() {
        this.server.close();
    }
}


if (require.main === module) {
    let bot = new PruBot(process.env.APIAI_ACCESS_TOKEN || 'b339df6ba3d144028e53cd6a8a3f4e50');
    let ocrService = new OCRService('AIzaSyBCmBskZqIYZAMi3CjB4cNRqJOv3K-sTHQ');
    new Application(3000, bot, ocrService).start();
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