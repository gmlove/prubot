const { ManualProcess } = require('./manualprocess');
const fs = require('fs');
const expect = require('chai').expect;

describe('manual process', () => {
    var manualProcess;

    before(() => {
        manualProcess = new ManualProcess();
    });

    it('start manual process', async () => {
        let result = await manualProcess.start();
        console.log(result);
    });
});
