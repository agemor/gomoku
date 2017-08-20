import * as PIXI from "pixi.js";
import io from "socket.io-client";
import OmokResource from "./OmokResource";
import OmokCanvas from "./OmokCanvas";
import OmokBoard from "./OmokBoard";
import OmokAlgorithm from "./OmokAlgorithm";

export default class OmokGame {

    constructor() {
        this.initialize();
    }

    initialize() {
        this.canvas = new OmokCanvas(30 * 20, 30 * 20);
        this.resources = new OmokResource();
        this.algorithm = new OmokAlgorithm();

        this.resources.load(() => {
            this.board = new OmokBoard(30);
            this.canvas.addElement(this.board);
        });
        this.turn = true;

        // 게임 관련 변수
        this.roomId = "";
        this.roomToken = "";
        this.gameStarted = false;
        this.myTurn = false;
        this.stoneColor = "";
        this.gameToken = "";

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
        this.joinErrorHandlers = [];
        this.gameReadyHandlers = [];
        this.gameErrorHandlers = [];
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

    joinGame(roomId, token) {

        this.roomId = roomId;
        this.roomToken = token;

        // 게임 플레이어
        if (token != undefined && String(token).length > 1) {
            this.serverConnection.emit('join', roomId, token);
        }
        
        // 게임 옵저버
        else {
            this.serverConnection.emit('join', roomId);
        }

        this.serverConnection.on('join failed', (errorData)=>{
            for (let i in this.joinErrorHandlers) {
                this.joinErrorHandlers[i](errorData);
            }
        });

        this.serverConnection.on('game joined as observer', (gameData)=>{

            for (let i in this.gameReadyHandlers) {
                this.gameReadyHandlers[i](gameData);
            }
        });

        this.serverConnection.on('game ready', (gameData)=>{

            this.gameToken = gameData.gameToken;
            this.stoneColor = gameData.stoneColor;

            // 게임 시작
            this.gameStarted = true;
            if (this.stoneColor == "black") {
                this.myTurn = true;
            } else {
                this.myTurn = false;
            }

            for (let i in this.gameReadyHandlers) {
                this.gameReadyHandlers[i](gameData);
            }
        });

        this.serverConnection.on('play move failed', (errorData)=>{
            for (let i in this.gameErrorHandlers) {
                this.gameErrorHandlers[i](errorData);
            }
        });

        this.serverConnection.on('stone placed', (gameData)=>{

            
            if (gameData.stoneColor == this.stoneColor) {
                return;
            }

            let coord = this.fromStringCoordinate(gameData.move);
            this.board.placeStone(gameData.stoneColor == "white", coord.x, coord.y);
            this.myTurn = true;
            if (gameData.gameEnd) {
                alert("패배하였습니다.");
            }
        });
    }

    onJoinError(handler) {
        this.joinErrorHandlers.push(handler);
    }

    onGameReady(handler) {
        this.gameReadyHandlers.push(handler);
    }

    onGameError(handler) {
        this.gameErrorHandlers.push(handler);
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

    onMouseMove(event) {
        let gridPosition = this.board.getGridPosition(event.x, event.y);
        this.board.placeHintStone(this.stoneColor == "white", gridPosition.x, gridPosition.y);
    }

    onMouseClick(event) {

        if (!(this.gameStarted && this.myTurn)) {
            return;
        }

        let gridPosition = this.board.getGridPosition(event.x, event.y);

        let isVictory = this.algorithm.checkVictory(gridPosition.x, gridPosition.y, this.stoneColor == "black" ? 1 : 2, this.board);
        let isValid = this.algorithm.checkValidity(gridPosition.x, gridPosition.y, this.stoneColor == "black" ? 1 : 2, this.board);

        if (!isValid) {
            alert("이 자리는 금수입니다.");
        } else {
            this.board.placeStone(this.stoneColor == "white", gridPosition.x, gridPosition.y);

            this.serverConnection.emit("play move", this.gameToken, this.roomId, this.toStringCoordinate(gridPosition))
            this.myTurn = false;
            if (isVictory) {
                alert("승리하였습니다.");
            }
        }
    }
    
    toStringCoordinate(coord) {
        return String.fromCharCode(coord.x + 97) + String(coord.y);
    }

    fromStringCoordinate(coord) {
        return {x: coord.charCodeAt(0) - 97, y: Number(coord.slice(1))};
    }

    getDOMElement() {
        return this.canvas.renderer.view;
    }
}