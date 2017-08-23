export default class OmokRoom {

    constructor(id, key) {

        // 인증 데이터
        this.id = id;
        this.key = key;

        // 게임 데이터
        this.playerNicknames = [];
        this.playerStoneColors = [];
        this.turn = "";
        this.gameOver = false;
    }
}
