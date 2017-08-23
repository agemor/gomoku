import OmokGame from "./OmokGame";

let host = "http://192.168.0.19:5555";

// DOM 객체 레퍼런스
let statusText = document.getElementById("statusText");

let setStatus = (text) => statusText.textContent = text;

// 게임 객체 생성
let game = new OmokGame();

// 게임 접속 정보 읽어오기
let urlParams = getUrlParams();
let roomId = urlParams["roomId"];
let roomKey = urlParams["roomKey"];
let playerId = urlParams["playerId"];
let playerKey = urlParams["playerKey"];

if (roomId == undefined) {

    // 초기 페이지로 이동
    window.location.assign("./");
}

game.onLoad(() => {

    game.connectServer(host);
    setStatus("서버 접속 중...");
})

game.onServerClosed((error) => {
    setStatus("서버가 닫혀 있습니다.");
});

game.onServerConnected(() => {


    game.join




    //



    game.joinGame(roomId, roomToken);

    game.onJoinError((errorData)=>{
        statusText.textContent = "게임을 불러오지 못했습니다. (" + errorData.message + ")";
    });

    game.onGameReady((gameData)=>{
        statusText.textContent = "게임을 시작합니다.";
    });

    game.onTurnChanged((gameData)=>{
        if (game.observerMode) {

        } else {
            if (gameData.myTurn) {
                statusText.textContent = "";
                if (gameData.previousPlacement != null) {
                    statusText.textContent = "상대방이 " + gameData.previousPlacement + "에 두었습니다. ";
                }
                statusText.textContent += "당신의 차례입니다.";
            } else {
                statusText.textContent = "상대방의 차례입니다.";
            }
        }
    });

    game.onGameEnd((gameData)=>{
        if (gameData.victory) {
            statusText.textContent = "당신이 승리하였습니다!";
        } else {
            statusText.textContent = "상대방이 승리하였습니다!";
        }
    });

    game.onGameError((errorData)=>{
        statusText.textContent = "게임 오류가 발생하였습니다. (" + errorData.message + ")";
    });
    statusText.textContent = "게임 불러오는 중...";
});

let gameContainer = document.getElementById("game");
gameContainer.appendChild(game.getDOMElement());


function getUrlParams() {
    let params = {};
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,(m,key,value) => params[key] = value);
    return params;
}