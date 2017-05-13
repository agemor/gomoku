import * as PIXI from "pixi.js";

export default class OmokCanvas {

    constructor(width, height) {

        // 캔버스 사이즈
        this.width = width;
        this.height = height;
        this.ratio = width / height;

        this.displayWidth = width;
        this.displayHeight = height;

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
        this.graphics.interactive = true;

        // 이벤트 핸들러 리스트
        this.mouseMoveHandlers = [];
        this.mouseClickHandlers = [];

        // 이벤트 리스너 등록
        this.graphics.on("mousemove", (event) => {
            for (let i in this.mouseMoveHandlers) {
                this.mouseMoveHandlers[i](this.globalToLocal(event.data.originalEvent.clientX, event.data.originalEvent.clientY));
            }
        })
        this.graphics.on("click", (event) => {
            for (let i in this.mouseClickHandlers) {
                this.mouseClickHandlers[i](this.globalToLocal(event.data.originalEvent.clientX, event.data.originalEvent.clientY));
            }
        })
    }

    globalToLocal(x, y) {
        let scrollX = document.body.scrollLeft;
        let scrollY = document.body.scrollTop;
        let offset = this._cumulativeOffset(this.renderer.view);
        let localX = this.width * (x - offset.left + scrollX) / this.displayWidth;
        let localY = this.height * (y - offset.top + scrollY) / this.displayHeight;
        return { x: localX, y: localY };
    }

    _cumulativeOffset(element) {
        let top = 0, left = 0;
        do {
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);

        return {
            top: top,
            left: left
        };
    };

    onMouseMove(eventHandler) {
        this.mouseMoveHandlers.push(eventHandler);
    }

    onMouseClick(eventHandler) {
        this.mouseClickHandlers.push(eventHandler);
    }

    /**
     * 화면 갱신 시 처리될 명령들
     */
    update() {

        let parentElement = this.renderer.view.parentElement;

        if (this.pivotWidth != parentElement.clientWidth && parentElement != undefined) {
            this.pivotWidth = parentElement.clientWidth;
            this.resizeRendererView(this.pivotWidth, this.pivotWidth);
        }

        this.renderer.render(this.graphics);
    }

    addElement(element) {
        this.graphics.addChild(element.graphics);
    }

    removeElement(element) {
        this.graphics.removeChild(element.graphics);
    }

    resizeRendererView(width, height) {

        var viewWidth, viewHeight;

        if (width / height >= this.ratio) {
            viewWidth = height * this.ratio;
            viewHeight = height;
        } else {
            viewWidth = width;
            viewHeight = width / this.ratio;
        }
        this.displayWidth = viewWidth// * 0.9;
        this.displayHeight = viewHeight// * 0.9;
        this.renderer.view.style.width = this.displayWidth + 'px';
        this.renderer.view.style.height = this.displayHeight + 'px';
    }

}