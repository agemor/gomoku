import io from "socket.io-client";

export default class OmokLobby {

    constructor() {
        this.serverConnectionHandlers = [];
        this.serverDisconnectionHandlers = [];
        this.serverErrorHandlers = [];
    }

    connectServer(host) {
        this.serverConnection = io.connect(host);
        this.serverConnection.on('connect', () => {
            for (let i in this.serverConnectionHandlers) {
                this.serverConnectionHandlers[i](this.serverConnection.connected);
            }
        });
        this.serverConnection.on('disconnect', () => {
            for (let i in this.serverDisconnectionHandlers) {
                this.serverDisconnectionHandlers[i]();
            }
        })
        this.serverConnection.on('connect_error', (error) => {
            for (let i in this.serverErrorHandlers) {
                this.serverErrorHandlers[i](error);
            }
        })
        this.serverConnection.on('status', function (data) {
            console.log(data);
            socket.emit('my other event', { my: 'data' });
        });
    }

    findOpponent(callback) {
        this.serverConnection.emit('find opponent');
        this.serverConnection.on('room created',  (roomId, roomToken)=>{
            callback(roomId, roomToken);
        });
    }

    getRandomRoom(callback) {
        this.serverConnection.emit('get random room id');
        this.serverConnection.on('random room id',  (roomId)=>{
            callback(roomId);
        });
        this.serverConnection.on('no random room',  ()=>{
            callback(null);
        });
    }

    onServerClosed(handler) {
        this.serverErrorHandlers.push(handler);
    }

    onServerConnected(handler) {
        this.serverConnectionHandlers.push(handler);
    }

    onServerDisconnected(handler) {
        this.serverDisconnectionHandlers.push(handler);
    }
}