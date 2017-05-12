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

    /**
     * 쌍삼 체크
     */
    checkDoubleThree(x, y, board) {

        // 돌 연산자
        let at = (sx, sy) => board.placement[sy * board.boardSize + sx];
        let inbound = (sx, sy) => (sx >= 0 && sy >= 0 && sx < board.boardSize && sy < board.boardSize);

        // 기준 돌
        let criterion = at(x, y);
        let opponent = criterion == 1 ? 2 : 1;

        // 한쪽 방향으로 열림성 검사
        let traverse = function (a, b) {
            let i = 0;
            let count = 0;
            let stuck = true;
            while (true) {
                if (!inbound(x + a * (i + 1), y + b * (i + 1))) break;
                if (at(x + a * (i + 1), y + b * (i + 1)) == opponent) break;
                if (at(x + a * i, y + b * i) == criterion) count++;
                if (at(x + a * (i + 1), y + b * (i + 1)) == 0 && at(x + a * i, y + b * i) == 0) {
                    stuck = false;
                    break;
                }
                i++;
            }
            return { length: i, count: count, stuck: stuck };
        }

        // 열린3 검사
        let checkOpenThree = function (a, b, c, d) {

            let p = traverse(a, b);
            let q = traverse(c, d);
            let lsum = p.length + q.length;
            let csum = p.count + q.count;

            if (at(x + a * p.length, y + b * p.length) == 0
                && at(x + c * q.length, y + d * q.length) == 0) {

                // 또 각 빈칸이 금수점인지 체크. 금수점이면 false return.
                if (lsum == 4 && csum == 4) return true;
                if (lsum == 5 && csum == 4 && !(p.stuck && q.stuck)) return true;
                return false;
            } else {
                return false;
            }
        }
        
        return (checkOpenThree(-1, 0, 1, 0) + checkOpenThree(0, -1, 0, 1)
            + checkOpenThree(-1, -1, 1, 1) + checkOpenThree(1, -1, -1, 1)) > 1
        /**
         * 열린4: 양쪽 모두가 막히지 않은 4
         * 열린3: 하나 두면 열린 4가 만들어 지는 것
         *     - 네 칸의 범위에서 같은 색깔 3개가 있어야 함.
         *     - 하나 둬서 4를 만들 수 있어야 함.
         * 쌍삼: 열린 3이 두개 만들어 지는 것
         */

        /**
         * 1. 모든 열린 3을 찾는다.
         *    
         *    1. 가로세로대각선 탐색한다.
         *    2. 만약 
         *    총 6칸 탐색. 4칸은 3조건 만족하는지, 2칸은 무엇이 둘러싸고 있는지.
         *    ***
         *    ** *
         *   @ * **
         *    기준점 기준으로 좌우 산개. 한 방향당
         * 
         * 2. 열린 3이 두개 이상인가?
         * 3. 각각 열린 3을 4로 만들 수 있는 부분이 또 금수점인가?
         */

        // 가로
        /** 
        let hl = 0, hr = 0;
        let hs = [];
        let hlfirmend = false, hrfirmend = false;
        while (true) {

            // 바운드를 벗어났거나, 반대 돌이거나 : '완전 닫힘'이므로 검색 종료
            if (!inbound(x - (hl + 1), y)) {
                hlfirmend = true;
                break;
            }
            if (at(x - (hl + 1), y) == opponent) {
                hlfirmend = true;
                break;
            }
            // 연속 빈칸이면: '완전 열림' 이므로 검색 종료
            if (at(x - (hl + 1), y) == 0 && at(x - hl, y) == 0) break;
            hl++;
        }

        while (true) {
            // 바운드를 벗어났거나, 반대 돌이거나 : '완전 닫힘'이므로 검색 종료
            if (!inbound(x + (hr + 1), y)) {
                hlfirmend = true;
                break;
            }
            if (at(x + (hr + 1), y) == opponent) {
                hlfirmend = true;
                break;
            }
            // 연속 빈칸이면: '완전 열림' 이므로 검색 종료
            if (at(x + (hr + 1), y) == 0 && at(x + hr, y) == 0) break;
            hr++;
        }

        // 양쪽 가장자리가 빈칸
        if (at(x - hl, y) == 0 && at(x + hr, y) == 0) {

            // 또 각 빈칸이 금수점인지 체크. 금수점이면 false return.

            // 열린 3의 조건: 시작과 끝이 빈칸이어야 하고, 길이가 1 + 1 + 3~4 = 5혹은 6이어야 함
            // 단 양쪽 모두 가장자리가 바운더리/상대방막 인 경우 6만 해당.
            return hlfirmend && hrfirmend ? (hl + hr == 6) : (5 <= hl + hr || hl + hr <= 6);
            /*
                        if (hlfirmend && hrfirmend) {
                            return hl + hr == 6;
                        } else {
                            return  5 <= hl + hr || hl + hr <= 6;
                        }
                        */

    }




    checkDoubleFour() {

    }
}