import * as PIXI from "pixi.js";
import OmokResource from "./OmokResource";

export default class OmokStone {

    /**
     * 검은색: false
     * 하얀색: true
     */
    constructor(stoneColor = true) {

        // 돌 색깔
        this.stoneColor = stoneColor;

        this.stoneSize = 30;

        // 그래픽 인터페이스
        this.graphics = new PIXI.Container();

        this.resources = new OmokResource();

        this.drawStone();
    }

    drawStone() {
        let stoneTexture = this.resources.get(this.stoneColor ? "OMOK_STONE_BLACK" : "OMOK_STONE_WHITE").texture;
        let stoneSprite = new PIXI.Sprite(stoneTexture);
        stoneSprite.width = stoneSprite.height = this.stoneSize;
        stoneSprite.anchor.set(0.5, 0.5);
        this.graphics.addChild(stoneSprite);
    }

}