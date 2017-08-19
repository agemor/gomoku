import OmokLobby from "./OmokLobby";

// 상태 표시 텍스트
let statusText = document.getElementById("statusText");

let lobby = new OmokLobby();

lobby.connectServer("http://localhost:5555");

statusText.textContent = "서버 접속 중...";

lobby.onServerClosed((error)=>{
    statusText.textContent = "서버가 닫혀 있습니다.";
});

lobby.onServerConnected(()=>{
    lobby.findOpponent();
    statusText.textContent = "대전할 상대방 기다리는 중...";
});

lobby.onOpponentFound((roomToken, roomId)=>{
    statusText.textContent = "상대방을 찾았습니다!" + roomToken + "///////" + roomId;
    window.location.assign("./game.html?id=" + roomId + "&token=" + roomToken);
})