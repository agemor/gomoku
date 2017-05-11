import * as PIXI from "pixi.js";
import OmokCanvas from "./OmokCanvas";
import OmokBoard from "./OmokBoard";

export default class OmokGame {
    constructor() {
        this.canvas = new OmokCanvas(800, 800);
        this.board = new OmokBoard();

        this.canvas.addElement(this.board);
    }

    getDOMElement() {
        return this.canvas.renderer.view;
    }
}