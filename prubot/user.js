const fetch = require('node-fetch');

class User {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}


class UserProfile {
    constructor(data) {
        this.data = data;
    }

    get policyId() {
        return this.data.result.data.profile.policies[0].policyID;
    }

    get policies() {
        return this.data.result.data.profile.policies;
    }

    policy(policyID) {
        return this.policies.filter((policy) => policy.policyID === policyID)[0];
    }
}

class UserService {

    constructor() {
        this.users = [
            new User('1231', 'Bob'),
            new User('1232', 'Mike'),
            new User('1233', 'Stephanie')
        ];
    }

    getUser(id) {
        return this.users.filter(user => user.id === id)[0];
    }

    async queryProfile(hkID) {
        const result = await fetch(`http://server7.imorum.com:3001/user/${hkID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const profileData = await result.json();
        console.log(`queryProfile ${hkID}: `, JSON.stringify(profileData));
        return new UserProfile(profileData);
    }

}


module.exports = {
    User: User,
    UserService: UserService
};
