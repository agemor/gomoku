import * as PIXI from "pixi.js";
import OmokResource from "./OmokResource";
import OmokStone from "./OmokStone";

export default class OmokBoard {
    constructor(gridSize, boardSize = 19) {

        // 그리드 사이즈
        this.gridSize = gridSize;

        // 오목판 사이즈
        this.boardSize = boardSize;

        // 화점 사이즈
        this.flowerDotSize = 4;

        // 그리드 색깔
        this.gridColor = 0x000000;

        // 그래픽 인터페이스
        this.graphics = new PIXI.Container();

        this.resources = new OmokResource();

        // 놓여진 돌들
        this.placedStones = [];
        this.placement = [];
        for (let i = 0; i < boardSize * boardSize; i++) {
            this.placedStones.push(null);
            this.placement.push(0);
        }

        // 포석 힌트
        this.hintStoneBlack = new OmokStone(OmokStone.BLACK, true);
        this.hintStoneWhite = new OmokStone(OmokStone.WHITE, true);

        this.drawBoardTexture();
        this.drawBoardGridLines();
    }

    placeHintStone(stoneColor, x, y) {
        this.displaceHintStone(stoneColor);
        if (stoneColor == OmokStone.BLACK) {
            this.hintStoneBlack.graphics.x = this.gridSize * (x + 1);
            this.hintStoneBlack.graphics.y = this.gridSize * (y + 1);
            this.graphics.addChild(this.hintStoneBlack.graphics);
        } else {
            this.hintStoneWhite.graphics.x = this.gridSize * (x + 1);
            this.hintStoneWhite.graphics.y = this.gridSize * (y + 1);
            this.graphics.addChild(this.hintStoneWhite.graphics);
        } 
    }

    displaceHintStone(stoneColor) {
        if (stoneColor == OmokStone.BLACK) {
            this.graphics.removeChild(this.hintStoneBlack.graphics);
        } else {
            this.graphics.removeChild(this.hintStoneWhite.graphics);
        }
    }

    placeStone(stoneColor, x, y) {
        // 이미 놓여진 돌이 있는지 검사
        if (this.placedStones[x + this.boardSize * y] == null) {
            let stone = new OmokStone(stoneColor);
            stone.graphics.x = this.gridSize * (x + 1);
            stone.graphics.y = this.gridSize * (y + 1);
            this.graphics.addChild(stone.graphics);

            this.placement[x + this.boardSize * y] = (stoneColor == OmokStone.BLACK) ? 1 : 2;
            this.placedStones[x + this.boardSize * y] = stone;
        }
    }

    displaceStone(x, y) {
        if (this.placedStones[x + this.boardSize * y] != null) {
            this.graphics.removeChild(this.placedStones[x + this.boardSize * y].graphics);

            this.placement[x + this.boardSize * y] = 0;
            this.placedStones[x + this.boardSize * y] = null;
        }
    }

    getGridPosition(x, y, offsetX = 0, offsetY = 0) {
        let gridX = Math.round((x - this.gridSize) / this.gridSize);
        let gridY = Math.round((y - this.gridSize) / this.gridSize);

        let isOut = n => n < 0 || n >= this.boardSize;
        let checkBoundary = n => n < 0 ? 0 : (n >= this.boardSize ? this.boardSize - 1 : n);

        let out = isOut(gridX) || isOut(gridY);
        gridX = checkBoundary(gridX);
        gridY = checkBoundary(gridY);

        return { x: gridX, y: gridY, out: out };
    }

    drawBoardTexture() {
        var boardTexture = this.resources.get("OMOK_BOARD_TEXTURE").texture;
        var boardSpriteSize = (this.boardSize + 1) * this.gridSize
        var boardSprite = new PIXI.extras.TilingSprite(boardTexture, boardSpriteSize, boardSpriteSize);
        this.graphics.addChild(boardSprite);
    }

    drawBoardGridLines() {
        var gridLines = new PIXI.Graphics();
        gridLines.lineStyle(1, this.gridColor, 1);

        // 가로줄
        for (var y = 0; y < this.boardSize; y++) {
            gridLines.moveTo(this.gridSize, (y + 1) * this.gridSize);
            gridLines.lineTo(this.gridSize * this.boardSize, (y + 1) * this.gridSize);
        }

        // 세로줄
        for (var x = 0; x < this.boardSize; x++) {
            gridLines.moveTo((x + 1) * this.gridSize, this.gridSize);
            gridLines.lineTo((x + 1) * this.gridSize, this.gridSize * this.boardSize);
        }

        // 화점
        let centrify = n => ((n) * Math.floor(this.boardSize / 3) + Math.ceil(this.boardSize / 6)) * this.gridSize;
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