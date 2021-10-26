import { Physics, GameObjects, Scene } from 'phaser';

export class Ground extends GameObjects.Rectangle {
  constructor(scene: Scene, elevation = 0) {
    super(
      scene,
      scene.physics.world.bounds.centerX,
      Math.round(scene.physics.world.bounds.height - elevation),
      scene.physics.world.bounds.width,
      Math.max(10, Math.round(elevation)),
      0x1a1b1c,
      1.0,
    );

    this.scene = scene;

    this.setOrigin(0.5, 0);
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    (this.body as Physics.Arcade.Body).setAllowGravity(false);
    (this.body as Physics.Arcade.Body).setImmovable(true);
  }
}
