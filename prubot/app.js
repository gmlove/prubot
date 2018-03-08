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

    async queryProfile(hkID) {
        const result = await fetch(`http://server7.imorum.com:3001/user/${hkID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const answer = await result.json();
        console.log(answer);
        return answer;
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
            res.status(200).send({ amount: '5000 HKD' });
        });

        this.app.get('/userprofile/:hkID', async (req, res) => {
            res.status(200).send(await this.queryProfile(req.params.hkID));
        });

        /**
         * Try using body
         * {
	     *    "hkID": "C823494",
	     *    "amount": 1500
         * }
         * 
         */
        this.app.post('/queryjet/', async (req, res) => {
            const profile = await this.queryProfile(req.body.hkID);
            let jsonRequest = {
                "request": {
                    "chatbotQuestion": "Am I eligible for the procedure",
                    "currentClaim": {
                        "claimID": "1000001",
                        "policyID": profile.result.data.profile.policies[0].policyID,
                        "type": "Medical",
                        "deathclaimIndicator": null,
                        "disabilityIndicator": null,
                        "criticalIllnessIndicator": null,
                        "medicalClaimsIndicator": null,
                        "accidentIndicator": null,
                        "medicalWastageScore": 10517320,
                        "hospitalizationNecessaryScore": 0.0,
                        "preExistingConditiionScore": 10517320,
                        "policyNonDIsclosureScore": 10517320,
                        "billedAmountValue": req.body.amount,
                        "billAmountCurrency": "HKD",
                        "submissionDate": "2016-08-16T12:42:28.000+0000",
                        "approvedDate": "2016-08-16T12:42:28.000+0000",
                        "claimRedFlagCategoryList": [
                            ""
                        ],
                        "benefitCodes": [
                            null
                        ],
                        "claimEvents": [
                            {
                                "eventStartDate": "2016-08-16T12:42:28.000+0000",
                                "eventEndDate": "2016-08-16T12:42:28.000+0000",
                                "eventType": "01",
                                "eventId": "123XYZ",
                                "diagnosisList": [
                                    {
                                        "code": "455.6", // can get this value from ocr to the mapped category value?
                                        "type": null,
                                        "description": null,
                                        "firstDetectionDate": "2016-08-16T12:42:28.000+0000",
                                        "maxClaimPeriodinDays": 0,
                                        "diagnosisJETEligibilityStatus": null
                                    }
                                ],
                                "medicalCenter": {
                                    "code": "115",
                                    "name": null,
                                    "geographicArea": null,
                                    "medicalCenterType": null
                                },
                                "treatments": []
                            }
                        ],
                        "unstructuredDataFlag": null,
                        "policyAndBenefitElibigilityStatus": null,
                        "benefitTypeList": [
                            {
                                "benefitCode": 3,
                                "benefitType": null,
                                "benefitDate": "2016-08-16T12:42:28.000+0000"
                            }
                        ],
                        "claimHospitalInDate": "2016-08-16T12:42:28.000+0000",
                        "claimHospitalOutDate": "2016-08-16T12:42:28.000+0000"
                    },
                    "policy": [
                        profile.result.data.profile.policies[0]
                    ],
                    "previousClaims": [],
                    "evalStatus": null,
                    "decision": null
                },
                "__DecisionID__": "123456789abcXYZ"
            }
            const result = await fetch(`http://54.179.151.37/DecisionService/rest/v1/PHKLClaimProcessingRuleApp/ClaimProcessingRuleService`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonRequest)
            });
            const answer = await result.json();
            res.status(200).send(answer);
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