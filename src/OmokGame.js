import * as PIXI from "pixi.js";
import OmokResource from "./OmokResource";
import OmokCanvas from "./OmokCanvas";
import OmokBoard from "./OmokBoard";

export default class OmokGame {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.canvas = new OmokCanvas(800, 800);
        this.resources = new OmokResource();

        this.resources.load(() => {
            this.board = new OmokBoard(35);
            this.canvas.addElement(this.board);

            this.board.placeStone(true, 3, 3);
        });

        // 이벤트 리스너 등록
        this.canvas.onMouseMove((event) => {
            this.onMouseMove(event);
        });
        this.canvas.onMouseClick((event) => {
            this.onMouseClick(event);
        })

    }

    onMouseMove(event) {

    }

    onMouseClick(event) {
        console.log(event)

        let gridSize = this.board.gridSize;
        let boardSize = this.board.boardSize;

        let gridX = Math.round(event.x / gridSize) - 1;
        let gridY = Math.round(event.y / gridSize) - 1;

        let checkBoundary = n => n < 0 ? 0 : (n > boardSize ? boardSize : n);

        gridX = checkBoundary(gridX);
        gridY = checkBoundary(gridY);

        this.board.placeStone(true, gridX, gridY);
    }

   
    getDOMElement() {
        return this.canvas.renderer.view;
    }
}