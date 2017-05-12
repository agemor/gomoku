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
        
    }

    getDOMElement() {
        return this.canvas.renderer.view;
    }
}