import { Math as PMath, Physics, Scene } from 'phaser';
import { MainScene } from '../scenes/main-scene';

export class Cloud extends Physics.Arcade.Sprite {

  public scene: MainScene;

  constructor(scene: MainScene, x: number, y: number) {
    super(scene, x, y, 'clouds');
    this.scene = scene;

    this.setScale(PMath.Between(2, 4));
    this.setOrigin(0.5, 1);
    this.setFrame(PMath.Between(0, 4));

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    (this.body as Physics.Arcade.Body).setAllowGravity(false);
  }
}
