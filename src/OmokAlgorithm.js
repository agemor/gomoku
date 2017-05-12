export default class OmokAlgorithm {
    constructor() {
    }

    analyze() {

    }

    /**
     * 다섯개가 연달아 있는지 체크
     */
    checkVictory(x, y, board) {

        // 돌 연산자
        let at = (sx, sy) => board.placement[sy * board.boardSize + sx];
        let inbound = (sx, sy) => (sx >= 0 && sy >= 0 && sx < board.boardSize && sy < board.boardSize);

        // 기준 돌
        let criterion = at(x, y);

        // 흩어짐 체크
        let check = function (a, b, c, d) {
            let i = 0, j = 0;
            while (at(x + a * i, y + b * i) == criterion && inbound(x + a * i, y + b * i)) { i++; }
            while (at(x + c * j, y + d * j) == criterion && inbound(x + c * j, y + d * j)) { j++; }
            return i + j == 6;
        }

        // 가로, 세로, 대각선 검사
        return check(-1, 0, 1, 0) || check(0, -1, 0, 1) || check(-1, -1, 1, 1) || check(1, -1, -1, 1);
    }

    checkTripleTriple() {

    }

    checkQuadQuad() {

    }
}