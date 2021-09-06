import { Physics, GameObjects, Scene } from 'phaser';

export class Ground extends GameObjects.Rectangle {

  public body: Physics.Arcade.Body;

  public static height = 10;

  constructor(scene: Scene) {
    super(
      scene,
      scene.physics.world.bounds.centerX,
      scene.physics.world.bounds.height,
      scene.physics.world.bounds.width,
      Ground.height,
      0x000,
      0.6
    );

    this.setOrigin(0.5, 0);
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
  }
}
