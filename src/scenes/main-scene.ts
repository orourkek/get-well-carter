import {
  Math as PMath,
  Input, Scene,
  GameObjects,
  Physics,
  Sound,
} from 'phaser';
import { DebugHUD } from '../objects/debug-hud';
import { CouchPlayer } from '../objects/player-couch';
import { Ground } from '../objects/ground';
import { Vehicle } from '../objects/vehicle';
import { Cloud } from '../objects/cloud';
import { checkOverlap } from '../util/overlap';
import { DialogBox } from '../objects/dialog-box';

export class MainScene extends Scene {

  readonly GROUND_HEIGHT = 150;
  readonly WORLD_WIDTH = 8000;
  readonly WORLD_HEIGHT = 600;
  readonly INTRO_TRIGGER_POSITION = 800;
  readonly GOLF_TRIGGER_POSITION = 7200;

  readonly DIALOG = {
    intro: [
      'Hey. You.\nYou\'re finally awake.',
      'Just kidding...\nHello, Carter.',
      'Do you want to play a game?',
      'Do you want to know who got you that gift card?',
      'Keep playing and you\'ll find out......',
    ],
    gameIntro: [
      'You wake up in a room filled with vaguely familiar things.',
      'Suddenly the thought hits you:\nBetter get moving!',
    ],
    gameRules: [
      'Traffic!\nGood thing this couch can jump!',
      'Press [space] repeatedly to jump vehicles' +
      '\nand be careful to avoid clouds!',
    ],
  };

  public playerPosition = 0;
  public hasShownRules = false;

  public keyboard: {
    left: Input.Keyboard.Key;
    right: Input.Keyboard.Key;
  };

  public ground: Ground;
  public player: CouchPlayer;
  public firstVehicle: Vehicle;
  public vehicles: GameObjects.Group;
  public clouds: GameObjects.Group;

  public dialogBox: DialogBox;

  public bg: GameObjects.TileSprite;
  public bedroomBg: GameObjects.Image;

  private debugHUD: DebugHUD;

  private backgroundMusic: Sound.BaseSound;

  constructor() {
    super('MainScene');
    (window as any).scene = this;
  }

  preload() {
    this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  }

  create(data?: any) {
    const bounds = this.physics.world.bounds;

    this.keyboard = {
      left: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.D),
    };

    this.bg = this.add.tileSprite(
      bounds.left,
      bounds.bottom,
      bounds.width + this.cameras.main.width * 2,
      1024,
      'background'
    );
    this.bg.setScrollFactor(0);
    this.bg.setScale(3);

    this.bedroomBg = this.add.image(
      bounds.left,
      bounds.top,
      'bedroom'
    );
    this.bedroomBg.setScale(3);
    this.bedroomBg.setOrigin(0, 0);

    this.ground = new Ground(this, this.GROUND_HEIGHT);

    this.player = new CouchPlayer(this, {
      x: (bounds.left + 180),
      y: (bounds.bottom - this.GROUND_HEIGHT),
    });

    this.firstVehicle = new Vehicle(
      this,
      this.INTRO_TRIGGER_POSITION + 200,
      (this.ground.body as Physics.Arcade.Body).top,
    );
    this.vehicles = this.makeVehicles();
    this.clouds = this.makeClouds();

    this.dialogBox = new DialogBox(this);

    this.debugHUD = new DebugHUD(this);

    this.physics.add.collider(this.player, this.ground);
    this.physics.add.overlap(
      this.player,
      this.clouds,
      (player: CouchPlayer, obj: Cloud) => {
        if (checkOverlap(player, obj)) {
          this.gameOver('lose', 'You hit a cloud!');
        }
      }
    );
    this.physics.add.overlap(
      this.player,
      this.vehicles,
      (player: CouchPlayer, obj: Vehicle) => {
        if (checkOverlap(player, obj)) {
          this.gameOver('lose', 'You hit a vehicle!');
        }
      }
    );
    this.physics.add.collider(this.vehicles, this.ground);

    this.backgroundMusic = this.sound.add('backgroundMusic', {
      loop: true,
      volume: 0.5,
    });

    const hOffset = -(Math.round(this.cameras.main.centerX - this.player.x));
    const vOffset = -(Math.round(this.cameras.main.centerY - this.player.y));

    this.cameras.main.startFollow(this.player, true, 0.5, 0, hOffset, vOffset);

    const fadeCameraIn = () => new Promise<void>((resolve, reject) => {
      this.cameras.main.fadeIn(1000, 0, 0, 0, (camera, progress) => {
        if (progress === 1) {
          resolve();
        }
      });
    })

    const gameStartSequence = async() => {
      if (data?.isRestart) {
        this.player.enableJumping();
      } else {
        await this.showDialog(this.DIALOG.intro, 0x1a1b1c);

        await fadeCameraIn();

        await this.showDialog(this.DIALOG.gameIntro);
      }

      setTimeout(() => {
        this.bedroomBg.setScrollFactor(1, 0);
        this.player.setVelocityX(200);
        this.vehicles.children.each((vehicle: Vehicle) => {
          vehicle.setVelocityX(PMath.Between(20, 190));
        });
        this.clouds.children.each((cloud: Cloud) => {
          cloud.setVelocityX(PMath.Between(-175, 0));
        });
        if (!data?.isRestart) {
          this.backgroundMusic.play();
        }
      }, 500);
    };

    gameStartSequence();
  }

  update(time: number, delta: number) {
    this.debugHUD.update(time, delta);
    this.player.update(time, delta);

    const deltaX = this.player.body.deltaX();
    const deltaY = this.player.body.deltaY();
    const threshold = 0.1;

    if (Math.abs(deltaX) >= threshold) {
      this.bg.tilePositionX += deltaX * 0.1;
    }

    if (Math.abs(deltaY) >= threshold) {
      this.bg.tilePositionY += deltaY * 0.025;
    }

    this.playerPosition = Math.round(this.player.body.position.x - 180);

    if (!this.hasShownRules) {
      if (this.playerPosition > this.INTRO_TRIGGER_POSITION) {
        this.hasShownRules = true;
        this.pauseGame();
        this.showDialog(this.DIALOG.gameRules).then(() => {
          this.resumeGame();
          this.player.enableJumping();
        });
      }
    }

    if (this.playerPosition > this.GOLF_TRIGGER_POSITION) {
      this.playGolf();
    }
  }

  playGolf() {
    this.pauseGame();
    this.scene.start('GolfScene');
  }

  private pauseGame() {
    this.player.setVelocity(0);
    this.vehicles.children.each((vehicle: Vehicle) => vehicle.setVelocity(0));
    this.clouds.children.each((cloud: Cloud) => cloud.setVelocity(0));
  }

  private resumeGame() {
    this.player.setVelocity(250);
    this.vehicles.children.each((vehicle: Vehicle) => {
      vehicle.setVelocityX(PMath.Between(20, 190));
    });
    this.clouds.children.each((cloud: Cloud) => {
      cloud.setVelocityX(PMath.Between(-175, 0));
    });
  }

  private async showDialog(messages: string[], overlayBg?: number) {
    return new Promise<void>((resolve, reject) => {
      this.dialogBox.runDialog(messages, resolve, {
        overlayBg
      });
    });
  }

  private gameOver(status: 'win' | 'lose', message = '') {
    this.scene.launch('GameOver', {
      status,
      message,
      originScene: 'MainScene',
    });
    this.scene.bringToTop('GameOver');
    this.scene.pause();
  }

  private makeVehicles(): GameObjects.Group {
    const world = this.physics.world.bounds;
    const spacing = 200;
    const minX = this.INTRO_TRIGGER_POSITION + 400;
    const y = (this.ground.body as Physics.Arcade.Body).top;
    const group = this.add.group();

    for (let x = minX; x <= world.right; x += spacing) {
      const vehicle = new Vehicle(this, x, y);
      group.add(vehicle);
    }

    this.add.existing(group);

    return group;
  }

  private makeClouds(): GameObjects.Group {
    const world = this.physics.world.bounds;
    const xBuffer = 1000;
    const spacing = 500;
    const group = this.add.group();

    for (let x = world.left + xBuffer; x <= world.right; x += spacing) {
      const y = PMath.Between(world.top + 50, world.centerY - 150);
      group.add(new Cloud(this, x, y));
    }

    this.add.existing(group);

    return group;
  }
}
