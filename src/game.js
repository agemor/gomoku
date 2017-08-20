import OmokGame from "./OmokGame";

// 상태 표시 텍스트
let statusText = document.getElementById("statusText");

// 게임 생성
let game = new OmokGame();

// 게임 접속 정보
let roomId = getUrlParams()["id"];
let roomToken = getUrlParams()["token"];

if (roomId == undefined) {

    // 초기 페이지로 이동
    window.location.assign("./");
}

// 게임 서버 접속
game.connectServer("http://localhost:5555");
statusText.textContent = "서버 접속 중...";

game.onServerClosed((error)=>{
    statusText.textContent = "서버가 닫혀 있습니다.";
});

game.onServerConnected(()=>{
    game.joinGame(roomId, roomToken);

    game.onJoinError((errorData)=>{
        statusText.textContent = "게임을 불러오지 못했습니다. (" + errorData.message + ")";
    });

    game.onGameReady((gameData)=>{
        statusText.textContent = "게임을 시작합니다.";
    });

    game.onGameError((errorData)=>{
        statusText.textContent = "게임 오류가 발생하였습니다. (" + errorData.message + ")";
    });
    statusText.textContent = "게임 불러오는 중...";
});

statusText.textContent = roomId + "///////" + roomToken;



let gameContainer = document.getElementById("game");
gameContainer.appendChild(game.getDOMElement());


function getUrlParams() {
    let params = {};
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,(m,key,value) => params[key] = value);
    return params;
  }