var express = require('express');
var PruBot = require('./prubot').PruBot;

class Application {
    constructor(port, bot) {
        this.port = port;
        this.app = express();
        this.server = null;
        this.bot = bot;
    }

    start() {
        this.app.use(express.json());
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            console.log(res);
            res.status(500).send('Something broke!');
        });

        this.app.post('/message', async (req, res) => {
            console.log('request.body: ', req.body);
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