import * as PIXI from "pixi.js";
import io from "socket.io-client";
import OmokResource from "./OmokResource";
import OmokCanvas from "./OmokCanvas";
import OmokBoard from "./OmokBoard";
import OmokStone from "./OmokStone";
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

            for (let i in this.loadHandler) {
                this.loadHandler[i]();
            }
        });
        this.turn = true;

        // 게임 관련 변수
        this.roomId = "";
        this.roomToken = "";
        this.observerMode = false;
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
        this.turnChangeHandlers = [];
        this.gameEndHandlers = [];
        this.loadHandler = [];
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

            this.gameStarted = true;
            this.observerMode = true;

            // 보드 세팅
            this.board.recoverStones(gameData.board);

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

            for (let i in this.turnChangeHandlers) {
                this.turnChangeHandlers[i]({myTurn: this.myTurn, stoneColor: OmokStone.BLACK});
            }
        });

        this.serverConnection.on('play move failed', (errorData)=>{
            for (let i in this.gameErrorHandlers) {
                this.gameErrorHandlers[i](errorData);
            }
        });

        this.serverConnection.on('stone placed', (gameData)=>{

            if (gameData.stoneColor == this.stoneColor && !this.observerMode) {
                return;
            }

            let coord = this.fromStringCoordinate(gameData.move);
            this.board.placeStone(gameData.stoneColor, coord.x, coord.y);
            this.myTurn = true;

            for (let i in this.turnChangeHandlers) {
                this.turnChangeHandlers[i]({myTurn: true, previousPlacement: gameData.move,
                    stoneColor: gameData.stoneColor == OmokStone.BLACK ? OmokStone.WHITE : OmokStone.BLACK});
            }

            if (gameData.gameEnd) {
                for (let i in this.gameEndHandlers) {
                    this.gameEndHandlers[i]({victory: false});
                }
                this.gameStarted = false;
            }
        });
    }

    onLoad(handler) {
        this.loadHandler.push(handler);
    }

    onTurnChanged(handler) {
        this.turnChangeHandlers.push(handler);
    }

    onGameEnd(handler) {
        this.gameEndHandlers.push(handler);
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

        if (!this.board) {
            return;
        }

        let gridPosition = this.board.getGridPosition(event.x, event.y);
        if (gridPosition.out) {
             this.board.displaceHintStone(this.stoneColor);
        } else {
            this.board.placeHintStone(this.stoneColor, gridPosition.x, gridPosition.y);
        }
    }

    onMouseClick(event) {

        if (!(this.gameStarted && this.myTurn && !this.observerMode)) {
            return;
        }

        let gridPosition = this.board.getGridPosition(event.x, event.y);

        let isVictory = this.algorithm.checkVictory(gridPosition.x, gridPosition.y, this.stoneColor, this.board);
        let isValid = this.algorithm.checkValidity(gridPosition.x, gridPosition.y, this.stoneColor, this.board);

        if (!isValid) {
            alert("이 자리는 금수입니다.");
        } else {
            this.board.placeStone(this.stoneColor, gridPosition.x, gridPosition.y);

            this.serverConnection.emit("play move", this.gameToken, this.roomId, this.toStringCoordinate(gridPosition))
            this.myTurn = false;
            for (let i in this.turnChangeHandlers) {
                this.turnChangeHandlers[i]({myTurn: false});
            }
            if (isVictory) {
                for (let i in this.gameEndHandlers) {
                    this.gameEndHandlers[i]({victory: true});
                }
                this.gameStarted = false;
            }
        }
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