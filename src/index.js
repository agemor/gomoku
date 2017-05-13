import OmokGame from "./OmokGame";

let game = new OmokGame();

let gameContainer = document.getElementById("game");
gameContainer.appendChild(game.getDOMElement());
