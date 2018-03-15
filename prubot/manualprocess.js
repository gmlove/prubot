const fetch = require('node-fetch');

class ManualProcess {
    constructor() { }

    async start() {
        let claimNumbers = ['80224363', '80927349', '81842934', '80234700'];
        let policyNumbers = ['000011581234', '000023409900', '000098723409', '000076380723'];
        let amounts = ['150000', '210000', '300000', '42000'];
        let ages = ['35', '67', '51', '40'];
        let idx = Math.floor(Math.random() * 0);
        // let result = await fetch('http://13.251.11.48:8080/Spring4-1/data/initiate/', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         'DOCID': '123', 'KEYFIELD1': 'PolicyNumber', 'KEYVALUE1': policyNumbers[idx],
        //         'KEYFIELD2': 'ClaimNumber', 'KEYVALUE2': 'CL0123', 'CLAIMNO': claimNumbers[idx],
        //         'CustomerID': 'HK10934456', 'CustomerAge': ages[idx], 'ClaimStatus': 'Active',
        //         'ClaimAmount': amounts[idx], 'HKID': 'HK10934456', 'CustomerName': 'Karen'
        //     })
        // });
        // return await result.text();
        return '';
    }
}


module.exports = {
    ManualProcess: ManualProcess
};