import { Scene, Physics, Input, Math as PMath } from 'phaser';
import { MainScene } from '../scenes/main-scene';

export class Player extends Physics.Arcade.Sprite {

  public scene: MainScene;

  public body: Physics.Arcade.Body;

  constructor(scene: Scene) {
    super(scene, 0, 0, 'player');

    const { centerX, height } = this.scene.cameras.main;

    this.setPosition(centerX, height - this.displayHeight / 2);
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.body.setBounce(0.5, 0.5);
  }

  public update(time: number, delta: number) {
    // noop for now
  }
}
