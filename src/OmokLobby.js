import io from "socket.io-client";

export default class OmokLobby {

    constructor() {
        this.serverConnectionHandlers = [];
        this.serverDisconnectionHandlers = [];
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
        this.serverConnection.on('status', function (data) {
            console.log(data);
            socket.emit('my other event', { my: 'data' });
        });

    }

    onServerConnected(handler) {
        this.serverConnectionHandlers.push(handler);
    }

    onServerDisconnected(handler) {
        this.serverDisconnectionHandlers.push(handler);
    }

    joinGame() {

    }

    onRequest()
}