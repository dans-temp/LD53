import {WIDTH_CANVAS, PADDING_CANVAS, HEIGHT_CANVAS, FONT_DEFAULT, FONT_TITLE} from "../globals.js";

const guy = {}

export default new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {key: 'menu'});
	},
	preload: function()
	{
		// TODO
	},
	create: function()
	{		
		const start_game_text = this.add.text(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 - 200, "Tweeter", {fontFamily: FONT_DEFAULT, color: "white", fontSize: "150px"}).setOrigin(0.5).setDepth(2);
		const credit_text = this.add.text(WIDTH_CANVAS/2, HEIGHT_CANVAS/2+ 100, "MADE BY: DAN & KAYLA", {fontFamily: FONT_DEFAULT, color: "white", fontSize: "22px"}).setOrigin(0.5).setDepth(2);
		const start = this.add.text(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 + 200, "HIT SPACE TO START", {fontFamily: FONT_DEFAULT, color: "white", fontSize: "32px"}).setOrigin(0.5).setDepth(2);


		this.cursors = this.input.keyboard.addKeys("ENTER,SPACE");
	},
	update()
	{
		if(this.cursors.ENTER.isDown || this.cursors.SPACE.isDown)
		{
			// this.music.stop();
			this.scene.start("gameplay");
		}
	}
});