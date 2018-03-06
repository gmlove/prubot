var express = require('express');

class Application {
    constructor(port) {
        this.port = port;
        this.app = express();
        this.server = null;
    }

    start() {
        this.app.use(express.json());
        this.app.use(function (err, req, res, next) {
            console.error(err.stack);
            console.log(res);
            res.status(500).send('Something broke!');
        });

        this.app.post('/message', function (req, res) {
            console.log('request.body: ', req.body);
            res.json({text: 'Hello world!'});
        });

        this.server = this.app.listen(this.port, function () {
            console.log(`App listening on port ${this.port}!`);
        });

    }

    stop() {
        this.server.close();
    }
}


if (require.main === module) {
    new Application(3000).start();
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