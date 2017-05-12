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
        this.canvas = new OmokCanvas(800, 800);
        this.resources = new OmokResource();
        this.algorithm = new OmokAlgorithm();

        this.resources.load(() => {
            this.board = new OmokBoard(35);
            this.canvas.addElement(this.board);

            this.board.placeStone(true, 3, 3);
        });
        this.mm = false;
        // 이벤트 리스너 등록
        this.canvas.onMouseMove((event) => {
            this.onMouseMove(event);
        });
        this.canvas.onMouseClick((event) => {
            this.onMouseClick(event);
        })

    }

    onMouseMove(event) {
        let gridPosition = this.board.getGridPosition(event.x, event.y); 

        this.board.placeHintStone(true, gridPosition.x, gridPosition.y);
    }

    onMouseClick(event) {
        
        let gridPosition = this.board.getGridPosition(event.x, event.y); 

        this.board.placeStone(this.mm, gridPosition.x, gridPosition.y);
        this.mm = !this.mm;

        console.log(this.algorithm.checkValidity(gridPosition.x, gridPosition.y, this.board));
    }


   
    getDOMElement() {
        return this.canvas.renderer.view;
    }
}