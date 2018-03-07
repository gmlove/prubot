
class User {
    constructor(id, name) {
        this.id = id;
        this.name = name;
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
}


module.exports = {
    User: User,
    UserService: UserService
};
