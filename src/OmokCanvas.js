import * as PIXI from "pixi.js";

export default class OmokCanvas {

    constructor(width, height) {

        // 캔버스 사이즈
        this.width = width;
        this.height = height;

        // 랜더러
        this.renderer = PIXI.autoDetectRenderer(width, height, {
            backgroundColor: 0xFFFF00,
            antialias: false,
            transparent: false,
            resolution: 1,
            autoResize: true,
        });

        // 화면 갱신을 위한 타이머
        this.ticker = new PIXI.ticker.Ticker();
        this.ticker.start();
        this.ticker.add(() => {
            this.update();
        });

        // 스테이지
        this.graphics = new PIXI.Container();
    }

    /**
     * 화면 갱신 시 처리될 명령들
     */
    update() {
        this.renderer.render(this.graphics);
    }

    addElement(element) {
        this.graphics.addChild(element.graphics);
    }

    removeElement(element) {
        this.graphics.removeChild(element.graphics);
    }
}