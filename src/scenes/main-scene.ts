import { Input, Scene } from 'phaser';
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

  private debugHUD: DebugHUD;

  constructor() {
    super('MainScene');
    (window as any).scene = this;
  }

  preload() {}

  create() {
    const { centerX, centerY } = this.cameras.main;
    this.add.image(centerX, centerY, 'logo');

    this.keyboard = {
      space: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE),
      left: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Input.Keyboard.KeyCodes.D),
    };

    this.ground = new Ground(this);
    this.player = new Player(this);
    this.debugHUD = new DebugHUD(this);
    this.physics.add.collider(this.player, this.ground);
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  update(time: number, delta: number) {
    this.debugHUD.update(time, delta);
    this.player.update(time, delta);
  }

  public gameOver(status: 'win' | 'lose', message = '') {
    this.scene.launch('GameOver', {
      status,
      message,
    }).bringToTop('GameOver');
    this.scene.pause();
  }
}
