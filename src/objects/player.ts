import { Scene, Physics, Input, Math as PMath } from 'phaser';
import { MainScene } from '../scenes/main-scene';

export class Player extends Physics.Arcade.Sprite {

  public scene: MainScene;

  public readonly JUMP_VELOCITY = 200;

  public body: Physics.Arcade.Body;

  constructor(scene: Scene) {
    super(scene, 0, 0, 'player');

    const { centerX, height } = this.scene.cameras.main;

    this.setPosition(centerX, height - this.displayHeight / 2);
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.body.setBounce(0.3, 0.3);

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
    const onTheGround = this.body.touching.down;

    if (this.scene.keyboard.space.isDown && this.body.touching.down) {
      this.setVelocityY(-(this.JUMP_VELOCITY));
    }
  }

  public faceLeft() {
    this.setFrame(2);
  }

  public faceRight() {
    this.setFrame(3);
  }
}
