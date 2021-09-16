import { Scene, Physics, Math as PMath } from 'phaser';
import { MainScene } from '../scenes/main-scene';

export class Player extends Physics.Arcade.Sprite {

  public scene: MainScene;

  public readonly JUMP_VELOCITY = 300;

  public body: Physics.Arcade.Body;

  constructor(scene: Scene) {
    super(scene, 0, 0, 'player');

    const { centerX, height } = this.scene.cameras.main;

    this.setPosition(centerX, height - this.displayHeight / 2);
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.body.setBounce(0.3, 0.3);

    // this.scene.anims.create({
    //   key: 'jump',
    //   frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
    //   frameRate: 10,
    //   repeat: -1
    // });
  }

  public update(time: number, delta: number) {
    const onTheGround = this.body.touching.down;
    const isJumpingThreshold = 0.6 * this.JUMP_VELOCITY;
    const canJumpAgain = (this.body.velocity.y >= isJumpingThreshold);

    if (this.scene.keyboard.space.isDown) {
      if (onTheGround || canJumpAgain) {
        this.setVelocityY(-(this.JUMP_VELOCITY));
      }
    }
  }
}
