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

    this.scene.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 4, end: 5 }),
      frameRate: 10,
      repeat: -1
    });
  }

  public update(time: number, delta: number) {
    if (this.scene.keyboard.left.isDown) {
      this.setVelocityX(-300);
      this.anims.play('left', true);
    } else if (this.scene.keyboard.right.isDown) {
      this.setVelocityX(300);
      this.anims.play('right', true);
    } else {
      if (this.body.velocity.x !== 0) {
        const frame = this.body.velocity.x < 0 ? 2 : 3;
        this.setVelocityX(0);
        this.anims.stop();
        this.setFrame(frame);
      }
    }
  }
}
