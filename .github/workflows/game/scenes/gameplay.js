import {WIDTH_CANVAS, PADDING_CANVAS, HEIGHT_CANVAS, FONT_DEFAULT, FONT_TITLE} from "../globals.js";



//WORLD
const LEVEL_WIDTH = 2000;
const LEVEL_HEIGHT = 2000;

// PHYSICS
const RUN_ACCEL = 0.4;
const RUN_DECEL = 0.46;
const MAX_SPEED = 8;
const JUMPSPEED = 20;
const GRAVITY = 0.60;


const DIALOG_COOLDOWN = 250;
let next_dialog = 0;
let gold_outline;
let text_box;
let dialog;
let profile;
let prev_profile;
let created_box = false;


// TILES
const TILE_SIZE = 32;
const EPSILON = 0.00000000001;

const bird = {};

const dude = {
    xvel: 0,
    yvel: 0,
    width: 160,
    height: 240,
	has_bird: '-solo',
	in_cutscene: false,
	current_dialog: 0
};

const cutscenes = {
	intro:
	{
		dialog: 
		[
			{
				speaker: "bird",
				text: "Tweet tweet"
			},
			{
				speaker: "girl",
				text: ". . ."
			},
			{
				speaker: "bird",
				text: "Tweet tweet"
			},
			{
				speaker: "girl",
				text: "Oh, poor birdy. Did you fall?"
			},
			{
				speaker: "bird",
				text: "Tweet tweet"
			},
			{
				speaker: "girl",
				text: "YOU DID?!?! "
			}
			
		],
		completed: false
	},
	end:
	{

	}
}


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
		this.load.spritesheet('idle-solo',
			'assets/sprites/idle-solo.png',
			{frameWidth: 40, frameHeight: 60}
		);
		this.load.spritesheet('run',
			'assets/sprites/run.png',
			{frameWidth: 40, frameHeight: 60}
		);
		this.load.spritesheet('run-solo',
			'assets/sprites/run-solo.png',
			{frameWidth: 40, frameHeight: 60}
		);

		this.load.spritesheet('jump',
			'assets/sprites/jump.png',
			{frameWidth: 40, frameHeight: 60}
		);

		this.load.spritesheet('falling',
			'assets/sprites/falling.png',
			{frameWidth: 40, frameHeight: 60}
		);

		this.load.spritesheet('bird-idle',
			'assets/sprites/bird-idle.png',
			{frameWidth: 16, frameHeight: 16}
		);

		this.load.image('background', 'assets/background.png');
		this.load.image('dirt', 'assets/sprites/dirt.png');
		this.load.image('bird-profile', 'assets/sprites/bird-profile.png')
		this.load.image('girl-profile', 'assets/sprites/girl-profile.png')
	},
	create: function()
	{
		//animations
		this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("idle", {start: 0, end: 7}),
            frameRate: 2,
            repeat: -1
        });

		this.anims.create({
            key: "idle-solo",
            frames: this.anims.generateFrameNumbers("idle-solo", {start: 0, end: 7}),
            frameRate: 2,
            repeat: -1
        });

		this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("run", {start: 0, end: 4}),
            frameRate: 10,
            repeat: -1
        });

		this.anims.create({
            key: "run-solo",
            frames: this.anims.generateFrameNumbers("run-solo", {start: 0, end: 4}),
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
            frames: this.anims.generateFrameNumbers("falling", {start: 0, end: 4}),
            frameRate: 8,
			repeat: -1
        });

		this.anims.create({
            key: "bird-idle",
            frames: this.anims.generateFrameNumbers("bird-idle", {start: 0, end: 4}),
            frameRate: 6,
			repeat: -1
        });

		this.dirt_particles = this.add.particles("dirt").setDepth(2);;
		this.emitter_dirt = this.dirt_particles.createEmitter({
			speed: {min: 10, max: 50},
			angle: {min: 160, max: 340},
			alpha: {start: 1, end: 0},
			scale: 3,
			blendMode: "NORMAL",
			on: false,
			lifespan: 1000,
			gravityY: 20
		});


		this.cursors = this.input.keyboard.addKeys("UP,LEFT,DOWN,RIGHT,N,W,A,S,D,M,ENTER,SPACE");
		this.add.image(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, 'background').setScrollFactor(0).setDepth(-2).setScale(8);

		dude.sprite = this.add.sprite(100, 1980, 'idle'+dude.has_bird).setDisplaySize(160, 240).setOrigin(0.5, 1).setDepth(1);
		bird.sprite = this.add.sprite(1000, 1980, 'bird-idle').setDisplaySize(48, 48).setOrigin(0.5, 1).setDepth(1);
		this.cameras.main.startFollow(dude.sprite);
		this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);
		this.cameras.main.setZoom(1);
		dude.sprite.play("idle"+dude.has_bird);
		bird.sprite.flipX = true;
		bird.sprite.play("bird-idle");
	},
	update()
	{	
		if(dude.in_cutscene && this.cursors.ENTER.isDown && this.time.now > next_dialog)
		{
			dude.current_dialog ++;
			next_dialog = this.time.now + DIALOG_COOLDOWN;
		}
		if(cutscenes.intro.completed === false && dude.sprite.x > 800)
		{
			if(!dude.in_cutscene)
			{
				
				dude.sprite.play("idle"+dude.has_bird);
				dude.in_cutscene = true;
			}
			dude.xvel = 0;
			play_cutscene(cutscenes.intro, this);
		}
		else if (!dude.in_cutscene)
		{
			const left = this.cursors.A.isDown || this.cursors.LEFT.isDown;
			const right = this.cursors.D.isDown || this.cursors.RIGHT.isDown;
			const jump = this.cursors.W.isDown || this.cursors.UP.isDown;
			const down = this.cursors.S.isDown


			if( (!left && !right) || (left && right))
			{
				if (dude.sprite.anims.currentAnim.key !== "idle"+dude.has_bird && !dude.falling)
					dude.sprite.play("idle"+dude.has_bird);
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
					dude.sprite.anims.play("run"+dude.has_bird, true);
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
					dude.sprite.anims.play("run"+dude.has_bird, true);
				if(Math.min(MAX_SPEED, dude.xvel + RUN_ACCEL) > dude.xvel)
					dude.xvel = Math.min(MAX_SPEED, dude.xvel + RUN_ACCEL);
				dude.facing_right = true;
				dude.sprite.flipX = false;
			}
			
			dude.x_old = dude.sprite.x;
			dude.y_old = dude.sprite.y;

			if(dude.falling && dude.xvel <= MAX_SPEED)
				dude.yvel += GRAVITY;


			if(jump && !dude.falling && cutscenes.intro.completed === true)
			{
				dude.yvel = -JUMPSPEED;
				dude.falling = true;
				this.emitter_dirt.explode(20, dude.sprite.x, dude.sprite.y);
				dude.sprite.anims.play("jump", true);
			}

			if(dude.falling && dude.yvel > 0)
			{
				dude.sprite.anims.play("falling", true);
			}

			dude.sprite.x += dude.xvel;
			dude.sprite.y += dude.yvel;

			if(dude.sprite.y < dude.height)
			{
				dude.sprite.y = dude.height;
				dude.yvel = 0;
			}

			//can be removed later
			if(dude.sprite.y > LEVEL_HEIGHT)
			{
				dude.sprite.y = LEVEL_HEIGHT;
				dude.yvel = 0;
				dude.falling = false;
			}

			if(dude.sprite.x < dude.width/2)
			{
				dude.sprite.x = dude.width/2;
				dude.xvel = 0;
			}
		}
	}
});


function play_cutscene(cutscene, scene)
{	
	if (dude.current_dialog >= cutscene.dialog.length)
	{
		cutscene.completed = true;
		if(cutscenes.intro.completed === true)
		{
			dude.has_bird = '';
			bird.sprite.destroy();
		}
		dude.in_cutscene = false;
		dude.current_dialog = 0;
		gold_outline.destroy();
		text_box.destroy();
		dialog.setText("");
		profile.destroy();
		prev_profile = undefined;
		created_box = false;
	}
	else
	{
		dude.in_cutscene = true;
		if (created_box === false)
		{
			gold_outline = scene.add.graphics().fillStyle(0x07567a, 1).fillRect(-10, 0, WIDTH_CANVAS- 780, 220).setPosition(400, 90).setScrollFactor(0).setDepth(4);
			text_box = scene.add.graphics().fillStyle(0xd8e3e8, 1).fillRect(0, 0, WIDTH_CANVAS- 800, 200).setPosition(400, 100).setScrollFactor(0).setDepth(4);
			dialog = scene.add.text(WIDTH_CANVAS/2, 190,"", {fontFamily: FONT_DEFAULT,fontSize: "36px", fill: "black"}).setOrigin(0.5).setScrollFactor(0).setDepth(4);
			profile = scene.add.image(WIDTH_CANVAS/2- 550, 150, cutscene.dialog[dude.current_dialog].speaker+'-profile').setScrollFactor(0).setDepth(4).setScale(15).setOrigin(0.5).setScrollFactor(0);
			prev_profile = cutscene.dialog[dude.current_dialog].speaker;
			created_box = true;
		}

		if(cutscene.dialog[dude.current_dialog].speaker !== prev_profile)
		{
			profile.destroy();
			prev_profile = cutscene.dialog[dude.current_dialog].speaker;
			if(cutscene.dialog[dude.current_dialog].speaker == 'bird')
			{
				profile = scene.add.image(WIDTH_CANVAS/2- 550, 150, cutscene.dialog[dude.current_dialog].speaker+'-profile').setScrollFactor(0).setDepth(4).setScale(15).setOrigin(0.5).setScrollFactor(0);
			}
			else
			{
				profile = scene.add.image(WIDTH_CANVAS/2- 550, 220, cutscene.dialog[dude.current_dialog].speaker+'-profile').setScrollFactor(0).setDepth(4).setScale(5).setOrigin(0.5).setScrollFactor(0);
			}
		}
		dialog.setText(cutscene.dialog[dude.current_dialog].text);
	}


	
}