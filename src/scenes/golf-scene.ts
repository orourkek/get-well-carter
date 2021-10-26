import { Scene, GameObjects, Scenes, Physics } from 'phaser';
import { fromEvent } from 'rxjs';
import {
  filter,
  throttleTime,
  takeUntil,
  tap,
  mergeMap,
} from 'rxjs/operators';
import { GolfPlayer } from '../objects/player-golf';
import { Ground } from '../objects/ground';
import { DialogBox } from '../objects/dialog-box';

function randomQuips(quips: string[]) {
  return () => quips[Math.floor(Math.random() * quips.length)];
}

const randomLoseQuip = randomQuips([
  '3/10',
  'Wow. That was really embarassing.',
  'Come on Carter, you can do better.\nLittle rusty?',
  'I guess you won\'t figure out who got you that gift card',
  'So close!\n\nBut were you though?',
  'I thought someone said you played golf?',
  'Wow I guess you really do have a bad back.',
  'Caroline would be disappointed.\nYou should think about giving up.',
  'Do you even have any friends?',
  'Geez we\'re going to be here all night',
  'Maybe you should just bury yourself in that sand trap',
  'You’re kinda like Rapunzel except instead of letting down your hair,' +
    'you let down everyone in your life',
  'You are a pizza burn on the roof of the world’s mouth.',
  'Your mother may have told you that you could be anything you wanted, ' +
    'but a complete failure wasn’t what she meant.',
  'Were you born this stupid or did you take lessons?',
  'I thought of you today.\n\nIt reminded me to take out the trash.',
  'There are some remarkably bad golf players in this world. ' +
    'Thanks for helping me understand that.',
  'Your ass must be pretty jealous of the shit your golf swing has turned into',
  'I want you to be the pallbearer at my funeral so you can let me down ' +
    'one last time.',
]);

export class GolfScene extends Scene {

  readonly GROUND_HEIGHT = 150;
  readonly WORLD_WIDTH = 4000;
  readonly WORLD_HEIGHT = 600;
  readonly SWING_CHARGE_MAX = 10;
  readonly CHARGE_METER_WIDTH = 200;
  readonly CHARGE_METER_HEIGHT = 8;

  public ground: Ground;
  public player: GolfPlayer;
  public ball: GameObjects.Ellipse; // & { body: Physics.Arcade.Body };
  public hole: GameObjects.Rectangle;
  public sandtrap: GameObjects.Rectangle;

  public chargeMeter: GameObjects.Rectangle;

  private swingCharge: number = 0;
  private swingChargeTimer: NodeJS.Timer;
  private swingAngle: number = 0;

  public dialogBox: DialogBox;

  public bg: GameObjects.TileSprite;

  public isCharging = false;
  public isSwinging = false;

  constructor() {
    super('GolfScene');
    (window as any).golfScene = this;
  }

  preload() {
    this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
  }

  create(data?: any) {
    const bounds = this.physics.world.bounds;

    if (data?.isRestart) {
      this.isCharging = false;
      this.isSwinging = false;
    }

    this.bg = this.add.tileSprite(
      bounds.left,
      bounds.bottom,
      bounds.width + this.cameras.main.width * 2,
      1024,
      'background'
    );
    this.bg.setScale(3);
    this.bg.setOrigin(0.5, 1);

    this.dialogBox = new DialogBox(this);

    this.ground = new Ground(this, this.GROUND_HEIGHT);
    this.ground.setFillStyle(0x165936, 1);

    this.player = new GolfPlayer(this, {
      x: (bounds.left + 40),
      y: (bounds.bottom - this.GROUND_HEIGHT),
    });

    const { x: clubX, y: groundY } = this.player.getBottomCenter();

    this.ball = this.add.ellipse(
      clubX + 10,
      groundY,
      6,
      6,
      0xd1d3d6,
      1
    );

    this.physics.add.existing(this.ball);

    (this.ball.body as Physics.Arcade.Body).setBounce(0.6, 0.5);
    (this.ball.body as Physics.Arcade.Body).setDragX(80);

    this.chargeMeter = this.add.rectangle(
      clubX + 20,
      groundY,
      0,
      this.CHARGE_METER_HEIGHT,
      0xffff00,
      1,
    ).setOrigin(0, 0.5);

    this.hole = this.add.rectangle(1400, groundY, 20, 24, 0xadb3bc, 1);
    this.hole.setOrigin(0.5, 0);
    this.physics.add.existing(this.hole, true);

    this.physics.add.overlap(
      this.ball,
      this.hole,
      (...args) => {
        if (this.ball.body.velocity.x > 150) {
          // This ball is coming in TOO HOT — it gets bounced
          (this.ball.body as Physics.Arcade.Body).setVelocityY(
            Math.round(this.ball.body.velocity.x) * 1.8
          );
          return;
        }
        this.gameOver('win');
        this.game.events.emit('carter-is-well');
      },
      // This function filters which events get passed to the above callback
      (ball, hole) => {
        const dist = Math.abs(hole.body.center.x - ball.body.center.x);
        return (dist <= 4);
      },
    );

    this.sandtrap = this.add.rectangle(444, groundY, 220, 44, 0xba8a3d, 1);
    this.sandtrap.setOrigin(0, 0);
    this.physics.add.existing(this.sandtrap, true);

    this.physics.add.overlap(
      this.ball,
      this.sandtrap,
      (...args) => {
        this.gameOver('lose');
      },
      (ball, sandtrap) => ball.body.left >= sandtrap.body.left + 10,
    );

    this.physics.add.collider(this.ball, this.ground);
    this.physics.add.collider(this.player, this.ground);

    const fadeCameraIn = () => new Promise<void>((resolve, reject) => {
      this.cameras.main.fadeIn(1000, 0, 0, 0, (camera, progress) => {
        if (progress === 1) {
          resolve();
        }
      });
    });

    // Part of the camera cutscene to introduce the game mechanics
    const cameraCutsceneYoyo = () => new Promise<void>((resolve) => {
      this.tweens.add({
        targets: [this.cameras.main],
        ease: 'Sine.easeInOut',
        duration: 3000,
        delay: 0,
        zoom: { from: 1, to: 0.5 },
        scrollX: { from: 0, to: 400 },
        scrollY: { from: 0, to: -300 },
        yoyo: true,
        onComplete: resolve,
      });
    });

    const gameStartSequence = async () => {
      if (!data?.isRestart) {
        await this.showDialog([
          'You made it!\nBut you\'ve been here before...',
        ], 0x165936, 0x333435);

        await fadeCameraIn();

        await this.showDialog([
          'You\'re back on the golf course.\nCareful with that back of yours!',
          'Get a hole-in-one to win\nand be completely healed!',
        ], undefined, 0x333435);

        await cameraCutsceneYoyo();

        this.bg.setScrollFactor(0);

        await this.showDialog([
          'Click + hold to charge, release to take the shot.' +
          ' Press [r] to reset and try again.',
        ], undefined, 0x333435);
      }

      // Start listening for game input events
      const subscriptions = this.setupSubscriptions();
      this.events.on(Scenes.Events.DESTROY, () => {
        subscriptions.forEach((s) => s.unsubscribe());
      });
    };

    gameStartSequence();
  }

  update(time: number, delta: number) {
    this.player.update(time, delta);

    const tooFarX = (this.ground.body as Physics.Arcade.Body).right + 50;
    const minX = (this.ground.body as Physics.Arcade.Body).left - 50;
    const ballVelocityX = this.ball.body.velocity.x;
    const ballVelocityY = this.ball.body.velocity.y;

    if (this.ball.x > tooFarX || this.ball.x < minX) {
      return this.gameOver('lose');
    }

    if (this.ball.x > 100 && ballVelocityX < 1 && ballVelocityY < 1) {
      return this.gameOver('lose');
    }

    const camera = this.cameras.main;
    const world = this.physics.world;
    const triggerPoint = Math.round(world.bounds.left + (camera.width / 2));

    if (this.ball.x > triggerPoint && camera.width > 0) {
      const oldScrollX = this.cameras.main.scrollX;
      const newScrollX = Math.round(this.ball.x - (camera.width / 2));
      this.cameras.main.scrollX = newScrollX;
      this.bg.tilePositionX += (newScrollX - oldScrollX) * 0.2;
    } else {
      // this.cameras.main.scrollX = 0;
    }

    if (this.ball.y < (camera.height / 2) && camera.height > 0) {
      const oldScrollY = this.cameras.main.scrollY;
      const newScrollY = Math.round(this.ball.y - (camera.height / 2));
      this.cameras.main.scrollY = newScrollY;
      this.bg.tilePositionY += (newScrollY - oldScrollY) * 0.2;
    } else {
      // this.cameras.main.scrollY = 0;
    }
  }

  private setupSubscriptions() {
    const game = document.getElementById('game');
    const move$ = fromEvent<MouseEvent>(game, 'mousemove');
    const down$ = fromEvent<MouseEvent>(game, 'mousedown');
    const up$ = fromEvent<MouseEvent>(game, 'mouseup');

    const swings$ = down$.pipe(
      filter(() => this.isCharging === false),
      filter(() => this.isSwinging === false),
      //////////////// Start of swing
      tap((e) => {
        this.isCharging = true;
        this.resetSwingCharge();
        this.setSwingAngle(e);
        this.chargeSwing();
      }),
      mergeMap(md => move$.pipe(
        throttleTime(50),
        //////////////// Mousemove events while mouse down (swing charging)
        tap(this.setSwingAngle.bind(this)),
        takeUntil(
          up$.pipe(
            //////////////// End of swing charge - execute the swing!
            tap(this.swing.bind(this)),
          )
        ),
      )),
    );

    const reset$ = fromEvent<KeyboardEvent>(document, 'keypress').pipe(
      filter((e) => e.key.toLowerCase() === 'r')
    );

    return [
      swings$.subscribe(),
      reset$.subscribe(this.resetGame.bind(this)),
    ];
  }

  private chargeSwing() {
    if (this.swingCharge >= this.SWING_CHARGE_MAX) {
      return;
    }

    this.swingCharge++;
    this.setChargeMeter(this.swingCharge / this.SWING_CHARGE_MAX);
    this.swingChargeTimer = setTimeout(
      this.chargeSwing.bind(this),
      300
    );
  }

  private setSwingAngle(e: MouseEvent) {
    const ball = this.ball.getCenter();
    const bounds = (e.target as any).getBoundingClientRect();
    const relativeX = (e.clientX - bounds.left - ball.x);
    const relativeY = -(e.clientY - bounds.top - ball.y);
    const angleDeg = Math.round(
      Math.atan2(relativeY, relativeX) * 180 / Math.PI
    );

    this.swingAngle = -(angleDeg);
    this.chargeMeter.setAngle(this.swingAngle);
  }

  private resetSwingCharge() {
    clearTimeout(this.swingChargeTimer);
    this.swingCharge = 0;
    this.setChargeMeter(0);
  }

  private swing(e: MouseEvent) {
    const finalCharge = this.swingCharge;
    const finalAngle = this.swingAngle;

    this.isCharging = false;
    this.isSwinging = true;

    this.resetSwingCharge();

    this.player.swing().then(() => {
      this.sound.play('golfHit');
      this.physics.velocityFromAngle(
        finalAngle,
        90 * finalCharge,
        (this.ball.body as Physics.Arcade.Body).velocity,
      );
      setTimeout(() => {
        const ballVelocity = this.ball.body.velocity;
        if (ballVelocity.x > 300 || ballVelocity.y > 300) {
          this.sound.play('applause', { name: 'version1', duration: 5 });
        }
      }, 500);
    })
  }

  private setChargeMeter(pct: number) {
    pct = Math.max(0, Math.min(1, pct));

    this.chargeMeter.width = this.CHARGE_METER_WIDTH * pct;
  }

  private async showDialog(
    messages: string[],
    overlayBg?: number,
    dialogBg?: number,
  ) {
    return new Promise<void>((resolve, reject) => {
      this.dialogBox.runDialog(messages, resolve, { overlayBg, dialogBg });
    });
  }

  private gameOver(status: 'win' | 'lose', message = '') {
    if (!message && status === 'lose') {
      message = randomLoseQuip();
    }
    this.scene.launch('GameOver', {
      status,
      message,
      originScene: 'GolfScene',
    });
    this.scene.bringToTop('GameOver');
    this.scene.pause();
  }

  public resetGame() {
    this.player.resetSwing();

    const { x: clubX, y: groundY } = this.player.getBottomCenter();

    (this.ball.body as Physics.Arcade.Body).setVelocity(0, 0);
    this.ball.setPosition(clubX + 10, groundY);
    this.isCharging = false;
    this.isSwinging = false;
    this.cameras.main.stopFollow();
    this.cameras.main.scrollX = 0;
    this.cameras.main.scrollY = 0;
  }
}
