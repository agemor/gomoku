import * as PIXI from "pixi.js";
import io from "socket.io-client";
import OmokResource from "./OmokResource";
import OmokCanvas from "./OmokCanvas";
import OmokBoard from "./OmokBoard";
import OmokStone from "./OmokStone";
import OmokAlgorithm from "./OmokAlgorithm";
import OmokRoom from "./OmokRoom";
import OmokPlayer from "./OmokPlayer";

export default class OmokGame {

    constructor() {
        this.initialize();
    }

    /**
     * 초기화
     */
    initialize() {

        // 오목 코어
        this.canvas = new OmokCanvas(30 * 20, 30 * 20);
        this.resources = new OmokResource();
        this.algorithm = new OmokAlgorithm();

        // 서버 상태 정보
        this.connected = false;
        this.recentErrorMessage = "";

        // 유저 인증 정보
        this.player = null;

        // 방 입장 정보
        this.room = null;

        // 그래픽 로드
        this.resources.load(() => {

            this.board = new OmokBoard(30);

            this.canvas.addElement(this.board);

            for (let i in this.loadHandlers) {
                this.loadHandlers[i]();
            }
        });

        // 이벤트 리스너 등록
        this.canvas.onMouseMove((event) => {
            this.onMouseMove(event);
        });
        this.canvas.onMouseClick((event) => {
            this.onMouseClick(event);
        });

        // 네트워크 이벤트 핸들러
        this.serverConnectionHandlers = [];
        this.serverDisconnectionHandlers = [];
        this.serverErrorHandlers = [];
        this.serverMessageHandlers = [];
        this.loadHandlers = [];
        this.stonePlacementHandlers = [];
        this.playerDisconnectedHandlers = [];
        this.playerReconnectedHandlers = [];
        this.gameOverHandlers = [];
    }

    /**
     * 게임 서버에 접속한다.
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

        this.socket.on("stone placed", (placementData) => {

            this.updateBoard(placementData);

            for (let i in this.stonePlacementHandlers) {
                this.stonePlacementHandlers[i](placementData);
            }
        });

        this.socket.on("player disconnected", (nickname) => {

           if (this.room != null) this.room.paused = true;

            for (let i in this.playerDisconnectedHandlers) {
                this.playerDisconnectedHandlers[i](nickname);
            }
        });

        this.socket.on("player reconnected", (nickname) => {

            if (this.room != null) this.room.paused = false;

            for (let i in this.playerReconnectedHandlers) {
                this.playerReconnectedHandlers[i](nickname);
            }
        });

        this.socket.on("game over", (gameData) => {

            this.gameOver(gameData);

            for (let i in this.gameOverHandlers) {
                this.gameOverHandlers[i](gameData);
            }
        });

        this.socket.on("hi client", () => {console.log("server said hi")})
    }

    /**
     * 게임 방에 입장한다.
     * 
     * @param {string} roomId 
     * @param {string} roomKey 
     * @param {string} playerId 
     * @param {string} playerKey
     * @param {function} callback 
     */
    joinRoom(roomId, roomKey, playerId, playerKey, callback) {

        if (!this.connected) return;

        this.room = new OmokRoom(roomId, roomKey);
        this.player = new OmokPlayer(playerId, playerKey);

        this.socket.emit("join room", roomId, roomKey, playerId, playerKey);

        this.socket.on("room joined",  (gameData) => {

            this.player.stoneColor = gameData.stoneColor;

            this.room.playerNicknames = gameData.nicknames;
            this.room.playerStoneColors = gameData.stoneColors;
            this.room.turn = gameData.turn;

            // 재접속일 경우 게임판 복구
            if (gameData.board != null) {
                this.board.recoverStones(gameData.board);
            }

            callback(true);
        });

        this.socket.on("cannot join room", (error) => {

            this.room = null;
            this.recentErrorMessage = error.message;

            callback(false);
        });
    }

    /**
     * 게임 방을 관전한다.
     * 
     * @param {string} roomId 
     * @param {function} callback 
     */
    observeRoom(roomId, callback) {

        if (!this.connected || this.room != null) return;

        this.room = new OmokRoom(roomId, "");

        this.socket.emit("observe room", roomId);

        this.socket.on("room observed",  (gameData) => {

            this.observerMode = true;

            this.room.playerNicknames = gameData.nicknames;
            this.room.playerStoneColors = gameData.stoneColors;
            this.room.turn = gameData.turn;

            this.board.recoverStones(gameData.board);

            callback(true);
        });

        this.socket.on("cannot observe room", (error) => {

            this.observerMode = false;
            this.room = null;
            this.recentErrorMessage = error.message;

            callback(false);
        });

    }

    /**
     * 판에 돌을 놓는다.
     * 
     * @param {array} coord 
     * @param {function} callback 
     */
    placeStone(coord, callback) {

        // 게임이 끝났을 경우 무시
        if (this.room.gameOver || this.player == null) return;

        // 자신의 턴이 아닐 경우 무시
        if (this.room.turn != this.player.stoneColor) return;

        // 정지일 경우 무시
        if (this.room.paused) return;

        // 금수인지 미리 체크
        let isValid = this.algorithm.checkValidity(coord.x, coord.y, this.player.stoneColor, this.board);

        if (!isValid) {

            alert("이 자리는 금수입니다.");
        } 
        
        else {

            this.board.placeStone(this.player.stoneColor, coord.x, coord.y);

            this.socket.emit("place stone", this.room.id, this.room.key, this.player.id, this.player.key, this.toStringCoordinate(coord));
            this.socket.on("cannot place stone", (error) => {

                this.room.turn = this.player.stoneColor;

                this.recentErrorMessage = error.message;
                console.log(error.message);
                callback(false);
            });

            // 턴 넘기기
            this.room.turn = OmokStone.complement(this.player.stoneColor);
        }
    }

    updateBoard(placementData) {

        // 게임이 끝났을 경우 무시
        if (this.room.gameOver) return;

        // 자신이 둔 수는 무시
        if (!this.observerMode && placementData.stoneColor == this.player.stoneColor) return;

        let coord = this.fromStringCoordinate(placementData.coord);
        
        this.board.placeStone(placementData.stoneColor, coord.x, coord.y);

        this.room.turn = OmokStone.complement(placementData.stoneColor);
    }

    gameOver(gameData) {
        this.room.gameOver = true;
    }

    onLoad(handler) {
        this.loadHandlers.push(handler);
    }

    onStonePlaced(handler) {
        this.stonePlacementHandlers.push(handler);
    }

    onPlayerDisconnected(handler) {
        this.playerDisconnectedHandlers.push(handler);
    }

    onPlayerReconnected(handler) {
        this.playerReconnectedHandlers.push(handler);
    }

    onGameOver(handler) {
        this.gameOverHandlers.push(handler);
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

    onMouseMove(event) {

        if (!this.board || !this.connected || this.player == null || this.room == null) return;

        let gridPosition = this.board.getGridPosition(event.x, event.y);

        if (gridPosition.out) {
             this.board.displaceHintStone(this.player.stoneColor);
        }
        
        else {
            this.board.placeHintStone(this.player.stoneColor, gridPosition.x, gridPosition.y);
        }
    }

    onMouseClick(event) {

        this.socket.emit("hi server");

       if (!this.connected || this.player == null || this.room == null) return;

        let gridPosition = this.board.getGridPosition(event.x, event.y);

        this.placeStone(gridPosition);
    }
    
    toStringCoordinate(coord) {
        return String.fromCharCode(coord.x + 97) + String(coord.y + 1);
    }

    fromStringCoordinate(coord) {
        return {x: coord.charCodeAt(0) - 97, y: Number(coord.slice(1)) - 1};
    }

    getDOMElement() {
        return this.canvas.renderer.view;
    }
}