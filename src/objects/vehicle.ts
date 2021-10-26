import { Math as PMath, Physics, Scene } from 'phaser';
import { MainScene } from '../scenes/main-scene';

export class Vehicle extends Physics.Arcade.Sprite {

  public scene: MainScene;

  constructor(scene: MainScene, x: number, y: number) {
    super(scene, x, y, 'vehicles');
    this.scene = scene;

    this.setScale(3);
    this.setOrigin(0.5, 1);
    this.setFrame(PMath.Between(0, 9));

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    // this.setVelocityX(PMath.Between(-100, 100));
  }
}
