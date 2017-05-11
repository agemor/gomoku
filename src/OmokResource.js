let instance = null;

export default class OmokResources {
    constructor() {
        if (!instance) {
            instance = this;
        } else {
            return instance;
        }

        this.resources = [];
        this.resourcesList = [
            ["OMOK_BOARD_TEXTURE", "images/board_texture.jpg"],
            ["OMOK_STONE_BLACK", "images/stone_black.png"],
            ["OMOK_STONE_WHITE", "images/stone_white.png"],
        ];
    }

    /**
     * 리소스를 가져온다.
     */
    get(resourceName) {
        let resourceId = null;
        for (let i = 0; i < this.resourcesList.length; i++) {
            if (this.resourcesList[i][0] == resourceName) {
                resourceId = this.resourcesList[i][1];
            }
        }
        if (resourceId == null) {
            return null;
        }
        return PIXI.loader.resources[resourceId];
    }

    /**
     * 리소스를 로드한다.
     */
    load(onComplete = () => { }) {

        // 대기열에 추가
        for (let i = 0; i < this.resourcesList.length; i++) {
            PIXI.loader.add(this.resourcesList[i][1]);
        }

        PIXI.loader.load(onComplete);
    }
}