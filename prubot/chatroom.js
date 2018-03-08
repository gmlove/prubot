const uuid = require('uuid');

class ChatMessage {
    constructor(id, text, imageId, options, createdAt) {
        this._id = id;
        this.text = text;
        this.imageId = imageId;
        this.createdAt = createdAt;
        this.options = options;
    }
}


class ChatHistory {
    constructor(id) {
        this.id = id;
        this._history = [];
    }

    message(message) {
        this._history.push(message);
    }

    history(count) {
        count = this._history.length < count ? this._history.length : count;
        return this._history.slice(this._history.length - count).reverse();
    }
}


class ChatRoomService {
    constructor(){
        this.chatHistories = new Map();
    }

    create() {
        let roomId = uuid.v4();
        this.chatHistories.set(roomId, new ChatHistory(roomId));
        return roomId;
    }

    message(roomId, message) {
        this.chatHistories.get(roomId).message(message);
    }

    history(roomId, count) {
        return this.chatHistories.get(roomId).history(count);
    }
}


module.exports = {
    ChatRoomService: ChatRoomService,
    ChatHistory: ChatHistory
};
