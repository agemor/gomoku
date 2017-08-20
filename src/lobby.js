import OmokLobby from "./OmokLobby";

// DOM 객체 레퍼런스
let statusText = document.getElementById("statusText");
let nicknameInputText = document.getElementById("nicknameInputText");
let startButton = document.getElementById("startButton");
let observeButton = document.getElementById("observeButton");

// 이벤트 리스너 할당
startButton.addEventListener("click", onStartClicked);
observeButton.addEventListener("click", onObserveClicked);

// 로비 객체 생성
let lobby = new OmokLobby();

// 서버 접속 시도
let connected = false;
let searching = false;
lobby.connectServer("http://192.168.0.19:5555");
statusText.textContent = "서버 접속 중...";

lobby.onServerClosed((error)=>{
    statusText.textContent = "아쉽게도 지금은 서버가 닫혀 있습니다.";
    startButton.disabled = true;
    observeButton.disabled = true;
});

lobby.onServerConnected(()=>{
    connected = true;
    statusText.textContent = "지금 바로 게임을 시작해 보세요!";
});


function onStartClicked() {
    if (connected && !searching) {

        // 상대방 탐색
        lobby.findOpponent((roomId, roomToken)=>{

            // 게임 시작
            window.location.assign("./game.html?id=" + roomId + "&token=" + roomToken);
        });

        statusText.textContent = "대전할 상대방 찾는 중...";

        nicknameInputText.disabled = true;
        startButton.disabled = true;
        observeButton.setAttribute('disabled', true);
        searching = true;
    }
}

function onObserveClicked() {
    if (connected && !searching) {
        // 랜덤한 방 id 요청
        lobby.getRandomRoom((roomId)=>{
            if (roomId == null) {
                statusText.textContent = "현재 게임 중인 방이 없습니다.";
                observeButton.removeAttribute("disabled");
                startButton.disabled = false;
            } else {
                window.location.assign("./game.html?id=" + roomId);
            }
        });
        statusText.textContent = "게임 중인 방 탐색 중...";
        observeButton.setAttribute('disabled', true);
        startButton.disabled = true;
    }
}