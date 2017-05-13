import * as PIXI from "pixi.js";
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
        // 이벤트 리스너 등록
        this.canvas.onMouseMove((event) => {
            this.onMouseMove(event);
        });
        this.canvas.onMouseClick((event) => {
            this.onMouseClick(event);
        });
    }

    onMouseMove(event) {
        let gridPosition = this.board.getGridPosition(event.x, event.y);

        this.board.placeHintStone(true, gridPosition.x, gridPosition.y);
    }

    onMouseClick(event) {

        let gridPosition = this.board.getGridPosition(event.x, event.y);

        let isVictory = this.algorithm.checkVictory(gridPosition.x, gridPosition.y, this.turn ? 1 : 2, this.board);
        let isValid = this.algorithm.checkValidity(gridPosition.x, gridPosition.y, this.turn ? 1 : 2, this.board);

        if (!isValid) {
            alert("금수입니다.");
        } else {
            this.board.placeStone(this.turn, gridPosition.x, gridPosition.y);

            if (isVictory) {
                alert((this.turn ? "흑" : "백") + "의 승리입니다.");
            }
            this.turn = !this.turn;
        }

    }


    getDOMElement() {
        return this.canvas.renderer.view;
    }
}