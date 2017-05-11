import * as PIXI from "pixi.js";
import OmokResource from "./OmokResource";

export default class OmokStone {
    constructor(color) {

        this.graphics = new PIXI.Container();

        this.resources = new OmokResource();

    }
}