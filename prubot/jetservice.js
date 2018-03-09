const fetch = require('node-fetch');
const _ = require('underscore');

const REQ_TEMPLATE = {
    'request': {
        'chatbotQuestion': 'Am I eligible for the procedure',
        'currentClaim': {
            'claimID': '1000001',
            'policyID': '__TO_FILL__',
            'type': 'Medical',
            'deathclaimIndicator': null,
            'disabilityIndicator': null,
            'criticalIllnessIndicator': null,
            'medicalClaimsIndicator': null,
            'accidentIndicator': null,
            'medicalWastageScore': 10517320,
            'hospitalizationNecessaryScore': 0.0,
            'preExistingConditiionScore': 10517320,
            'policyNonDIsclosureScore': 10517320,
            'billedAmountValue': '__TO_FILL__',
            'billAmountCurrency': 'HKD',
            'submissionDate': '2016-08-16T12:42:28.000+0000',
            'approvedDate': '2016-08-16T12:42:28.000+0000',
            'claimRedFlagCategoryList': [
                ''
            ],
            'benefitCodes': [
                null
            ],
            'claimEvents': [
                {
                    'eventStartDate': '2016-08-16T12:42:28.000+0000',
                    'eventEndDate': '2016-08-16T12:42:28.000+0000',
                    'eventType': '01',
                    'eventId': '123XYZ',
                    'diagnosisList': [
                        {
                            'code': '455.6', // can get this value from ocr to the mapped category value?
                            'type': null,
                            'description': null,
                            'firstDetectionDate': '2016-08-16T12:42:28.000+0000',
                            'maxClaimPeriodinDays': 0,
                            'diagnosisJETEligibilityStatus': null
                        }
                    ],
                    'medicalCenter': {
                        'code': '115',
                        'name': null,
                        'geographicArea': null,
                        'medicalCenterType': null
                    },
                    'treatments': []
                }
            ],
            'unstructuredDataFlag': null,
            'policyAndBenefitElibigilityStatus': null,
            'benefitTypeList': [
                {
                    'benefitCode': 3,
                    'benefitType': null,
                    'benefitDate': '2016-08-16T12:42:28.000+0000'
                }
            ],
            'claimHospitalInDate': '2016-08-16T12:42:28.000+0000',
            'claimHospitalOutDate': '2016-08-16T12:42:28.000+0000'
        },
        'policy': '__TO_FILL__',
        'previousClaims': [],
        'evalStatus': null,
        'decision': null
    },
    '__DecisionID__': '123456789abcXYZ'
};

class JetDecision {
    constructor(data) {
        this.data = data;
    }

    get botAnswer() {
        return this.data.response.chatbotAnswer;
    }

    get eligible() {
        return this.data.response.claimJETStatus == 'JET Accept';
    }
}

class JetService {
    constructor (userService) {
        this.userService = userService;
    }

    async decisionResult(hkID, selectedPolicyId, billInfo) {
        let request = JSON.parse(JSON.stringify(REQ_TEMPLATE));
        await this._fillPolicyInfo(hkID, selectedPolicyId, request);
        this._fillBillInfo(billInfo, request);
        console.log(request);
        let result = await fetch('http://54.179.151.37/DecisionService/rest/v1/PHKLClaimProcessingRuleApp/ClaimProcessingRuleService', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });
        const decision = await result.json();
        return new JetDecision(decision);
    }

    async _fillPolicyInfo(hkID, selectedPolicyId, request) {
        let profile = await this.userService.queryProfile(hkID);
        let policy = profile.policy(selectedPolicyId);
        request.request.currentClaim.policyID = policy.policyID;
        request.request.policy = [ policy ];
    }

    _fillBillInfo(billInfo, request) {
        request.request.currentClaim.billedAmountValue = billInfo.billAmount;
    }
}

module.exports = {
    JetService: JetService
};
