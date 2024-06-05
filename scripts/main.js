class Game extends Phaser.Scene {
    mouse;
    cats;
    walls = [];
    graphics;
    squeakAudio;
    impactAudio;

    preload () {
        // Load assets
        this.load.audio('background-audio', 'assets/background.wav');
        this.load.audio('impact-audio', 'assets/impact.wav');
        this.load.audio('squeak-audio', 'assets/squeak.wav');
        this.load.spritesheet('mouse', 'assets/player.png', {
            frameWidth: 46,
            frameHeight: 50
        });
    }

    create () {
        // Setup background audio on repeat
        let backgroundAudio = this.sound.add('background-audio');
        backgroundAudio.play({
            loop: true,
            volumn: 2
        });

        this.squeakAudio = this.sound.add('squeak-audio');
        this.impactAudio = this.sound.add('impact-audio');

        // Change background color
        this.cameras.main.setBackgroundColor(0xEEEEEE);

        // Create graphics
        this.graphics = this.add.graphics({ lineStyle: { width: 10, color: 0x615EFC }});

        // Setup mouse sprite 
        this.mouse = this.physics.add.sprite(100, 450, 'mouse');
        this.mouse.setBounce(0.2);
        this.mouse.setCollideWorldBounds(true);
        // this.mouse.setIgnoreGravity(true);
        this.mouse.body.onOverlap = true;

        // Setup player sprite animation states
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('mouse', { start: 0, end: 0 }),
            frameRate: 20
        });

        this.physics.add.collider(this.mouse);

        // Mouse event
        this.input.mouse.disableContextMenu();
        this.input.on('pointerdown', (pointer) => {
            let line;
            this.impactAudio.play();
            
            if (pointer.rightButtonDown()) {
                // create vertical line
                line = this.add.rectangle(pointer.x, pointer.y, 10, 1200, 0x615EFC);
            } else if (pointer.leftButtonDown()) {
                // create horizontal line
                line = this.add.rectangle(pointer.x, pointer.y, 1600, 10, 0x615EFC);
            }

            //Phaser.Geom.Line.CenterOn(line, pointer.x, pointer.y);
            this.walls.push(line);
            this.physics.add.existing(line);

            this.physics.add.collider(this.mouse, line);
            this.redraw();
        });
    }

    update () {
        const cursors = this.input.keyboard.createCursorKeys();

        if(cursors.right.isDown) {
            this.mouse.setFlipX(false);
            this.mouse.setVelocityX(160);
            this.mouse.anims.play('idle');
        } else if (cursors.left.isDown) { 
            this.mouse.setFlipX(true);
            this.mouse.setVelocityX(-160);
            this.mouse.anims.play('idle');
        } else if (cursors.up.isDown || cursors.space.isDown) {
            this.mouse.setVelocityY(-100);
            this.mouse.anims.play('idle');
        } else {
            this.mouse.setVelocityX(0);
            this.mouse.anims.play('idle');
        }

        // for(let wall of this.walls) {
        //     //const length = Phaser.Geom.Line.Length(wall);

        //     if(length < 1600) {
                
        //         //Phaser.Geom.Line.Extend(wall, 10, 10);
        //     }
        // }

        //this.redraw();
    }

    redraw () {
        this.graphics.clear();

        for(let wall of this.walls) {
            this.graphics.strokeLineShape(wall);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    scene: [Game],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    }
};

const game = new Phaser.Game(config);