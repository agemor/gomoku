import OmokGame from "./OmokGame";
import OmokStone from "./OmokStone";

let host = "http://52.231.31.17:7343/";

// DOM 객체 레퍼런스
let messageText = document.getElementById("messageText");
let statusText = document.getElementById("statusText");

// URL 파싱 유틸리티
let getUrlParams = () => {
    let params = {};
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,(m,key,value) => params[key] = value);
    return params;
}

// 메시지 표시 유틸리티
let messageHistory = [];

let addMessage = (text) => {

    if (messageHistory.length > 1) messageHistory.shift();
    messageHistory.push(text);

    messageText.innerHTML = messageHistory.join("<br/>");
}

// 상태 표시 유틸리티
let setStatus = (text) => {

    stopCountdown();

    statusText.textContent = text;
}

// 카운트다운 유틸리티
let previousCountdown;

let showCountdown = (nickname, timeLeft) => {

    stopCountdown();

    previousCountdown = setInterval(() => {

        statusText.textContent = nickname + "님 차례입니다. (" + (timeLeft--) + "초 남음)";

        if (timeLeft <= 0) {
            stopCountdown();
        }

    }, 1000);
}

let stopCountdown = () => {

    if (previousCountdown != null) {

        clearInterval(previousCountdown);

        previousCountdown = null;
    }
}

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

    let toKorean = (stoneColor) => (stoneColor == OmokStone.BLACK ? "흑" : "백");

    // 시작 메시지 보여주기
    let addWelcomeMessage = () => {

        let welcomeMessage = game.room.playerNicknames[0] + "(" + toKorean(game.room.playerStoneColors[0]) + ")";
        welcomeMessage += "님과 ";
        welcomeMessage += game.room.playerNicknames[1] + "(" + toKorean(game.room.playerStoneColors[1]) + ")";
        welcomeMessage += "님의 승부가 시작되었습니다.";

        addMessage(welcomeMessage);
    }

    if (roomKey != null && playerId != null && playerKey != null) {

        // 게임방에 플레이어로 입장
        game.joinRoom(roomId, roomKey, playerId, playerKey, (joinSuccess) => {

            if (!joinSuccess) {
                setStatus("방에 입장할 수 없습니다. (" + game.recentErrorMessage + ")");
                return;
            }

            addWelcomeMessage();
            showCountdown(game.room.getPlayerNicknameByStoneColor(game.room.turn), 30);
        });
    }

    else {

        // 게임방에 관전자로 입장
        game.observeRoom(roomId, (observeSuccess) => {

            if (!observeSuccess) {
                setStatus("방을 관전할 수 없습니다.");
                return;
            }

            addWelcomeMessage();            
            showCountdown(game.room.getPlayerNicknameByStoneColor(game.room.turn), 30);
        });
    }

    game.onStonePlaced((placementData) => {
        addMessage(game.room.getPlayerNicknameByStoneColor(placementData.stoneColor) + "님이 " + placementData.coord.toUpperCase() + "에 두었습니다.");
        showCountdown(game.room.getPlayerNicknameByStoneColor(game.room.turn), 30);
    });

    game.onPlayerDisconnected((nickname) => {
        addMessage(nickname + "님과의 연결이 끊어졌습니다. 15초 간 기다립니다.");
    });

    game.onPlayerReconnected((nickname) => {
        addMessage(nickname + "님이 다시 접속하였습니다. 게임을 재개합니다.");
    });

    game.onGameOver((gameData) => {

        stopCountdown();

        let message = (game.room.getPlayerNicknameByStoneColor(gameData.win) + "님이 승리하였습니다!");
        message += " <a href='./'>돌아가기</a>";
        statusText.innerHTML = message;
    });
   
    setStatus("게임 불러오는 중...");
});

let gameContainer = document.getElementById("game");
gameContainer.appendChild(game.getDOMElement());

