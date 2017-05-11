import * as PIXI from "pixi.js";
import OmokResource from "./OmokResource";

export default class OmokBoard {
    constructor(boardSize = 18) {

        // 오목판 사이즈
        this.boardSize = boardSize;

        // 그리드 사이즈
        this.gridSize = 35;

        // 화점 사이즈
        this.flowerDotSize = 4;

        // 그리드 색깔
        this.gridColor = 0x000000;

        // 그래픽 인터페이스
        this.graphics = new PIXI.Container();

        this.resources = new OmokResource();

        this.drawBoardTexture();
        this.drawBoardGridLines();
    }

    drawBoardTexture() {
        var boardTexture = this.resources.get("OMOK_BOARD_TEXTURE").texture;
        var boardSpriteSize = (this.boardSize + 2) * this.gridSize
        var boardSprite = new PIXI.extras.TilingSprite(boardTexture, boardSpriteSize, boardSpriteSize);
        this.graphics.addChild(boardSprite);
    }

    drawBoardGridLines() {
        var gridLines = new PIXI.Graphics();
        gridLines.lineStyle(1, this.gridColor, 1);

        // 가로줄
        for (var y = 0; y <= this.boardSize; y++) {
            gridLines.moveTo(this.gridSize, (y + 1) * this.gridSize);
            gridLines.lineTo(this.gridSize * (this.boardSize + 1), (y + 1) * this.gridSize);
        }

        // 세로줄
        for (var x = 0; x <= this.boardSize; x++) {
            gridLines.moveTo((x + 1) * this.gridSize, this.gridSize);
            gridLines.lineTo((x + 1) * this.gridSize, this.gridSize * (this.boardSize + 1));
        }

        // 화점
        let centrify = n => ((n) * Math.floor(this.boardSize / 3) + 1 + Math.ceil(this.boardSize / 6)) * this.gridSize;
        for (var i = 0; i < 9; i++) {
            var flowerDot = new PIXI.Graphics();
            flowerDot.beginFill(this.gridColor);
            flowerDot.drawCircle(0, 0, this.flowerDotSize);
            flowerDot.endFill();
            flowerDot.x = centrify(i % 3);
            flowerDot.y = centrify(Math.floor(i / 3));
            gridLines.addChild(flowerDot);
        }

        this.graphics.addChild(gridLines);
    }
}