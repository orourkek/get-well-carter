import { GameObjects, Scene } from 'phaser';
import { DebugHUD } from '../objects/debug-hud';

export class MainScene extends Scene {

  public keyboard: {
    [k: string]: Phaser.Input.Keyboard.Key;
  };

  private debugHUD: DebugHUD;

  constructor() {
    super('MainScene');
    (window as any).scene = this;
  }

  preload() {}

  create() {
    const { centerX, centerY } = this.cameras.main;
    this.add.image(centerX, centerY, 'logo');
    this.debugHUD = new DebugHUD(this);
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  update(time: number, delta: number) {
    this.debugHUD.update(time, delta);
  }

  public gameOver(status: 'win' | 'lose', message = '') {
    this.scene.launch('GameOver', {
      status,
      message,
    }).bringToTop('GameOver');
    this.scene.pause();
  }
}
