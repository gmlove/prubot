const expect = require('chai').expect;
const { ChatRoomService } = require('./chatroom');

describe('chat room service', () => {
    let chatRoom;

    before(() => {
        chatRoom = new ChatRoomService();
    });

    after(() => {
    });

    it('should send message and get history from chat room', () => {
        let roomId = chatRoom.create();
        chatRoom.message(roomId, 1);
        chatRoom.message(roomId, 2);
        chatRoom.message(roomId, 3);
        expect(chatRoom.history(roomId, 1)).to.deep.eq([3]);
        expect(chatRoom.history(roomId, 4)).to.deep.eq([3, 2, 1]);
    });
});
