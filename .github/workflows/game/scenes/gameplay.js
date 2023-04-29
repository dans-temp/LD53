import {WIDTH_CANVAS, PADDING_CANVAS, HEIGHT_CANVAS, FONT_DEFAULT, FONT_TITLE} from "../globals.js";





// PHYSICS
const RUN_ACCEL = 0.1;
const RUN_DECEL = 0.12;
const MAX_SPEED = 2;
const JUMPSPEED = 3.4;
const GRAVITY = 0.15;


// TILES
const TILE_SIZE = 32;
const EPSILON = 0.00000000001;

const dude = {
    xvel: 0,
    yvel: 0,
    width: 40,
    height: 60,
    hp_max: 5,
    hp_current: 5,
};



export default new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {key: 'gameplay'});
	},
	preload: function()
	{
		this.load.spritesheet('idle',
			'assets/sprites/idle.png',
			{frameWidth: 40, frameHeight: 60}
		);
		this.load.spritesheet('run',
			'assets/sprites/run.png',
			{frameWidth: 40, frameHeight: 60}
		);

		this.load.spritesheet('jump',
			'assets/sprites/jump.png',
			{frameWidth: 20, frameHeight: 16}
		);

		this.load.spritesheet('falling',
			'assets/sprites/falling.png',
			{frameWidth: 20, frameHeight: 16}
		);

		this.load.image('dirt', 'assets/sprites/dirt.png');

	},
	create: function()
	{
		//animations
		this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("idle", {start: 0, end: 6}),
            frameRate: 10,
            repeat: -1
        });

		this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("run", {start: 0, end: 4}),
            frameRate: 10,
            repeat: -1
        });

		this.anims.create({
            key: "jump",
            frames: this.anims.generateFrameNumbers("jump", {start: 0, end: 2}),
            frameRate: 8,
			repeat: -1
        });

		this.anims.create({
            key: "falling",
            frames: this.anims.generateFrameNumbers("falling", {start: 0, end: 2}),
            frameRate: 8,
			repeat: -1
        });

		this.dirt_particles = this.add.particles("dirt");
		this.emitter_dirt = this.dirt_particles.createEmitter({
			speed: {min: 5, max: 25},
			angle: {min: 160, max: 340},
			alpha: {start: 1, end: 0},
			scale:0.5,
			blendMode: "NORMAL",
			on: false,
			lifespan: 1000,
			gravityY: 20
		});

		this.cursors = this.input.keyboard.addKeys("UP,LEFT,DOWN,RIGHT,N,W,A,S,D,M,ENTER,SPACE");

		dude.sprite = this.add.sprite(100, 100, 'idle').setDisplaySize(40, 60).setOrigin(0.5, 1).setDepth(4);
		this.cameras.main.startFollow(dude.sprite);
		this.cameras.main.setBounds(0, 0, 2000, 2000);
		this.cameras.main.setZoom(4);
		dude.sprite.play("idle");
	},
	update()
	{		
		const left = this.cursors.A.isDown || this.cursors.LEFT.isDown;
		const right = this.cursors.D.isDown || this.cursors.RIGHT.isDown;
		const jump = this.cursors.W.isDown || this.cursors.UP.isDown;
		const down = this.cursors.S.isDown


		if( (!left && !right) || (left && right))
		{
			if (dude.sprite.anims.currentAnim.key !== "idle" && !dude.falling)
				dude.sprite.play("idle");
			if(dude.xvel > 0)
				dude.xvel = Math.max(0, dude.xvel - RUN_DECEL);
			else
				dude.xvel = Math.min(0, dude.xvel + RUN_DECEL);
		}

		if (left && !right)
		{
			if(dude.xvel > 0 && !dude.falling)
				this.emitter_dirt.emitParticle(1, dude.sprite.x, dude.sprite.y);
			if(!dude.falling)
				dude.sprite.anims.play("run", true);
			if(Math.max(-MAX_SPEED, dude.xvel - RUN_ACCEL) < dude.xvel)
				dude.xvel = Math.max(-MAX_SPEED, dude.xvel - RUN_ACCEL);
			dude.facing_right = false;
			dude.sprite.flipX = true;
		}
		else if(right && !left)
		{
			if(dude.xvel < 0 && !dude.falling)
				this.emitter_dirt.emitParticle(1, dude.sprite.x, dude.sprite.y);
			if(!dude.falling)
				dude.sprite.anims.play("run", true);
			if(Math.min(MAX_SPEED, dude.xvel + RUN_ACCEL) > dude.xvel)
				dude.xvel = Math.min(MAX_SPEED, dude.xvel + RUN_ACCEL);
			dude.facing_right = true;
			dude.sprite.flipX = false;
		}
		
		dude.x_old = dude.sprite.x;
		dude.y_old = dude.sprite.y;

		if(dude.falling && dude.xvel <= MAX_SPEED)
			dude.yvel += GRAVITY;


		if(jump && !dude.falling)
		{
			dude.yvel = -JUMPSPEED;
			dude.falling = true;
			this.emitter_dirt.explode(20, dude.sprite.x, dude.sprite.y);
			dude.sprite.anims.play("jump", true);
		}

		dude.sprite.x += dude.xvel;
		dude.sprite.y += dude.yvel;

		if(dude.sprite.y < dude.height)
		{
			dude.sprite.y = dude.height;
			dude.yvel = 0;
		}

		if(dude.sprite.x < dude.width/2)
		{
			dude.sprite.x = dude.width/2;
			dude.xvel = 0;
		}
	}
});
