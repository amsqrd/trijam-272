class Game extends Phaser.Scene {
    mouse;
    cats;
    walls;
    graphics;
    squeakAudio;
    impactAudio;
    explosionAudio;

    preload () {
        // Load assets
        this.load.audio('background-audio', 'assets/background.wav');
        this.load.audio('impact-audio', 'assets/impact.wav');
        this.load.audio('squeak-audio', 'assets/squeak.wav');
        this.load.audio('kaboom', 'assets/explosion1.mp3');
        this.load.spritesheet('mouse', 'assets/player.png', {
            frameWidth: 46,
            frameHeight: 50
        });
        this.load.spritesheet('explosion', 'assets/boom3.png', {
            frameWidth: 128,
            frameHeight: 128
        });
    }

    create () {
        // Setup background audio on repeat
        let backgroundAudio = this.sound.add('background-audio');
        backgroundAudio.play({
            loop: true,
            volumn: 0.5
        });

        this.squeakAudio = this.sound.add('squeak-audio');
        this.impactAudio = this.sound.add('impact-audio');
        this.explosionAudio = this.sound.add('kaboom');

        // Change background color
        this.cameras.main.setBackgroundColor(0xEEEEEE);

        // Create graphics
        this.graphics = this.add.graphics({ lineStyle: { width: 10, color: 0x615EFC }});

        // Setup mouse sprite 
        this.mouse = this.physics.add.sprite(100, 450, 'mouse');
        this.mouse.setBounce(0.2);
        this.mouse.setCollideWorldBounds(true);
        this.mouse.body.onOverlap = true;

        // Setup mouse sprite animation states
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('mouse', { start: 0, end: 0 }),
            frameRate: 20
        });

        // Setup cat sprites
        this.cats = this.add.group();
        for(let x = 0; x < 9; x++) {
            let cat = this.physics.add.sprite(100, 450, 'mouse');
            cat.enableBody = true;
            cat.body.collideWorldBounds = true;
            cat.setPosition(200 + x * 50, 50);

            this.physics.moveToObject(cat, this.mouse, 200);
            this.cats.add(cat);
        }

        this.walls = this.physics.add.staticGroup();
        this.physics.add.collider(this.mouse, this.walls);
        this.physics.add.collider(this.cats, this.walls);
        this.physics.add.collider(this.mouse, this.cats, (cat, mouse) => {
            this.destroyMouse();
        });
        this.physics.add.collider(this.cats, this.cats);

        this.physics.add.overlap(this.walls, this.cats, (cat) => {
            this.destroyCat(cat);
        });

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
            this.walls.add(line);
        });
    }

    update () {
        const cursors = this.input.keyboard.createCursorKeys();

        if(cursors.right.isDown) {
            this.mouse?.setFlipX(false);
            this.mouse?.setVelocityX(160);
            this.mouse?.anims.play('idle');
        } else if (cursors.left.isDown) { 
            this.mouse?.setFlipX(true);
            this.mouse?.setVelocityX(-160);
            this.mouse?.anims.play('idle');
        } else if (cursors.up.isDown || cursors.space.isDown) {
            this.mouse?.setVelocityY(-100);
            this.mouse?.anims.play('idle');
        } else {
            this.mouse?.setVelocityX(0);
            this.mouse?.anims.play('idle');
        }
    }

    /**
     * Destory cat and replace an explosion in it's previous place
     * @param {*} cat 
     */
    destroyCat(cat) {
        const x = cat.body.x;
        const y = cat.body.y;
        cat.destroy();

        let explosion = this.physics.add.sprite(128, 128, 'explosion');

        // Setup explosion sprite animation state
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 64 }),
            frameRate: 64
        });

        explosion.setPosition(x, y);
        explosion.on('animationcomplete', () => {
            explosion.destroy();
        });
        explosion.play('explode');
        this.explosionAudio.play({
            volumn: 0.5
        });
    }

    destroyMouse() {
        this.squeakAudio.play();

        this.scene.restart();
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