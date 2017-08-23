import io from "socket.io-client";

export default class OmokLobby {

    constructor() {

        // 서버 상태 정보
        this.connected = false;
        this.recentErrorMessage = "";

        // 유저 인증 정보
        this.loggined = false;
        this.playerId = null;
        this.playerKey = null;

        // 방 입장 정보
        this.matchFound = false;
        this.roomId = null;
        this.roomKey = null;

        // 이벤트 핸들러
        this.serverConnectionHandlers = [];
        this.serverDisconnectionHandlers = [];
        this.serverErrorHandlers = [];
        this.serverMessageHandlers = [];
    }

    /**
     * 로비 서버에 접속한다.
     * 
     * @param {string} host 
     */
    connectServer(host) {

        this.socket = io.connect(host);

        this.socket.on("connect", () => {

            this.connected = true;

            for (let i in this.serverConnectionHandlers) {
                this.serverConnectionHandlers[i](this.socket.connected);
            }
        });

        this.socket.on("disconnect", () => {

            this.connected = false;

            for (let i in this.serverDisconnectionHandlers) {
                this.serverDisconnectionHandlers[i]();
            }
        });

        this.socket.on("connect_error", (error) => {

            this.connected = false;

            for (let i in this.serverErrorHandlers) {
                this.serverErrorHandlers[i](error);
            }
        });

        this.socket.on("server message", (data) => {

            for (let i in this.serverMessageHandlers) {
                this.serverMessageHandlers[i](data.message);
            }
        });
    }

    /**
     * 로그인을 시도한다. 성공할 경우 인증 데이터를 받을 수 있다.
     * 
     * @param {string} nickname 
     * @param {function} callback 
     */
    login(nickname, callback) {

        if (!this.connected) return;

        this.socket.emit("login", nickname);

        this.socket.on("login success", (playerId, playerKey) => {

            this.loggined = true;
            this.playerId = playerId;
            this.playerKey = playerKey;

            callback(true);
        });

        this.socket.on("cannot login", (error) => {

            this.loggined = false;
            this.recentErrorMessage = error.message;

            callback(false);
        });
    }

    /**
     * 플레이 가능한 상대방을 찾는다.
     * 
     * @param {string} callback 
     */
    findMatch(callback) {

        if (!this.loggined) return;

        this.socket.emit("find match", this.playerId, this.playerKey);

        this.socket.on("match found",  (roomId, roomKey) => {

            this.matchFound = true;
            this.roomId = roomId;
            this.roomKey = roomKey;

            callback(true);
        });

        this.socket.on("cannot find match", (error) => {

            this.matchFound = false;
            this.recentErrorMessage = error.message;

            callback(false);
        });
    }

    /**
     * 게임 방으로 이동한다.
     */
    redirectToRoom() {

        if (this.roomId == null) return;

        let url = "./game.html?roomId=" + this.roomId;
        url += this.roomKey != null ? "&roomKey=" + this.roomKey : "";
        url += this.loggined ? "&playerId=" + this.playerId + "&playerKey=" + this.playerKey : "";

        window.location.assign(url);
    }

    getRandomRoom(callback) {

        if (!this.connected) return;

        this.socket.emit('get random room');

        this.socket.on('random room',  (roomId)=>{

            if (roomId != "") {

                this.roomId = roomId;

                callback(true);
            }

            else {

                this.roomId = null;

                callback(false);
            }
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

    onServerMessage(handler) {
        this.serverMessageHandlers.push(handler);
    }

    getRecentErrorMessage() {
        return this.recentErrorMessage;
    }
}