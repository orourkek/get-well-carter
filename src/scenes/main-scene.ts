import { Input, Scene, GameObjects } from 'phaser';
import { DebugHUD } from '../objects/debug-hud';
import { Player } from '../objects/player';
import { Ground } from '../objects/ground';

export class MainScene extends Scene {

  public keyboard: {
    space: Input.Keyboard.Key;
    left: Input.Keyboard.Key;
    right: Input.Keyboard.Key;
  };

  public ground: Ground;
  public player: Player;

  public bg: GameObjects.TileSprite;

  private debugHUD: DebugHUD;

  constructor() {
    super('MainScene');
    (window as any).scene = this;
  }

  preload() {
    this.physics.world.setBounds(0, 0, 16000, 600);
  }

  create() {
    const { centerX, centerY } = this.cameras.main;
    const bounds = this.physics.world.bounds;

    this.keyboard = {
      space: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE),
      left: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.D),
    };

    this.bg = this.add.tileSprite(
      bounds.left,
      bounds.top,
      bounds.width + this.cameras.main.width * 2,
      bounds.height, // + this.cameras.main.height * 2,
      'background'
    );
    this.bg.setScrollFactor(0);
    this.bg.setScale(3);

    this.ground = new Ground(this);
    this.player = new Player(this);
    this.debugHUD = new DebugHUD(this);
    this.physics.add.collider(this.player, this.ground);

    const hOffset = -(this.cameras.main.width / 3);
    const vOffset = (
      (this.cameras.main.height / 3) - (this.player.displayHeight / 3)
    );

    this.cameras.main.startFollow(this.player, true, 0.5, 0, hOffset, vOffset);
    this.cameras.main.fadeIn(300, 0, 0, 0);
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
      this.bg.tilePositionY += deltaY * 0.1;
    }
  }

  public gameOver(status: 'win' | 'lose', message = '') {
    this.scene.launch('GameOver', {
      status,
      message,
    }).bringToTop('GameOver');
    this.scene.pause();
  }
}
