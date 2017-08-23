import * as PIXI from "pixi.js";
import OmokResource from "./OmokResource";

export default class OmokStone {

    constructor(stoneColor, hinting = false) {

        // 돌 색깔
        this.stoneColor = stoneColor;

        this.hinting = hinting;

        this.stoneSize = 30;

        // 그래픽 인터페이스
        this.graphics = new PIXI.Container();

        this.resources = new OmokResource();

        this.drawStone();
    }

    drawStone() {
        let stoneTexture = this.resources.get(this.stoneColor == OmokStone.BLACK ? "OMOK_STONE_BLACK" : "OMOK_STONE_WHITE").texture;
        let stoneSprite = new PIXI.Sprite(stoneTexture);
        stoneSprite.width = stoneSprite.height = this.stoneSize;
        stoneSprite.anchor.set(0.5, 0.5);

        if (this.hinting) {
            stoneSprite.alpha = 0.4;
        }

        this.graphics.addChild(stoneSprite);
    }
}

OmokStone.BLACK = "black";
OmokStone.WHITE = "white";
OmokStone.complement = function(color) {
    return color == OmokStone.BLACK ? OmokStone.WHITE : OmokStone.BLACK;
}