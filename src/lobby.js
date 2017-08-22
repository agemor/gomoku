import KoreanNameGenerator from "korean-name-generator";
import OmokLobby from "./OmokLobby";

let host = "http://192.168.0.19:5555";

// DOM 객체 레퍼런스
let statusText = document.getElementById("statusText");
let nicknameInputText = document.getElementById("nicknameInputText");
let startButton = document.getElementById("startButton");
let observeButton = document.getElementById("observeButton");

let setStatus = (text) => statusText.textContent = text;

// 이벤트 리스너 할당
startButton.addEventListener("click", onStartClicked);
observeButton.addEventListener("click", onObserveClicked);

// 로비 객체 생성
let lobby = new OmokLobby();

lobby.connectServer(host);
setStatus("서버 접속 중...");

lobby.onServerClosed((error)=>{
    setStatus("아쉽게도 지금은 서버가 닫혀 있습니다.");
});

lobby.onServerConnected(()=>{
    connected = true;
    setStatus("지금 바로 게임을 시작해 보세요!");
});

// 대기 상태
let waiting = false;

let toggleWaiting = (waitingOn) => {

    waiting = waitingOn;

    if (waitingOn) {

        nicknameInputText.disabled = true;
        startButton.disabled = true;
        observeButton.setAttribute('disabled', true);
        
    } else {

        nicknameInputText.disabled = false;
        startButton.disabled = false;
        observeButton.removeAttribute("disabled");
    }
}

// 게임 시작 버튼이 눌렸을 때
function onStartClicked() {

    if (lobby.connected && !waiting) {

        toggleWaiting(true);

        // 닉네임이 입력되지 않았다면 자동 생성
        if (nicknameInputText.value.length < 1) {
            nicknameInputText.value = KoreanNameGenerator.generate(Math.random() > 0.5);
        }

        // 닉네임 정제
        let nickname = nicknameInputText.value.substring(0, 10);

        // 로그인
        lobby.login(nickname, (loginSuccess) => {

            if (!loginSuccess) {
                
                toggleWaiting(false);
                setStatus(lobby.getRecentErrorMessage());

                return;
            }

            // 대전할 상대방 탐색
            lobby.findMatch((findSuccess) => {

                if (!findSuccess) {
                    
                    toggleWaiting(false);
                    setStatus(lobby.getRecentErrorMessage());

                    return;
                }

                // 상대방 발견
                lobby.redirectToRoom();
            });
        });

        setStatus("대전할 상대방 찾는 중...");
    }
}

// 관전 버튼이 눌렸을 때
function onObserveClicked() {

    if (lobby.connected && !waiting) {

        toggleWaiting(true);

        // 랜덤한 방 선택
        lobby.getRandomRoom((getSuccess) => {

            if (!getSuccess) {
                
                toggleWaiting(false);
                setStatus("현재 관전 가능한 방이 없습니다.");

                return;
            }

            lobby.redirectToRoom();
        });

        setStatus("대전 중인 방 찾는 중...");
    }
}