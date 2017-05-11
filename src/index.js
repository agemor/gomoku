import Pixi from "pixi.js";

//Create the renderer
var renderer = PIXI.autoDetectRenderer(512, 512);

//Add the canvas to the HTML document
document.body.appendChild(renderer.view);

//Create a container object called the `stage`
var stage = new PIXI.Container();

//Tell the `renderer` to `render` the `stage`
renderer.render(stage);