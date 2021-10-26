import { Animations, GameObjects, Physics } from 'phaser';
import { GolfScene } from '../scenes/golf-scene';

export class GolfPlayer extends Physics.Arcade.Sprite {

  public scene: GolfScene;

  constructor(scene: GolfScene, startingPosition: { x: number, y: number }) {
    super(scene, 0, 0, 'player-golfing');
    this.scene = scene;
    this.setScale(3);
    this.setPosition(
      startingPosition.x + (this.displayWidth / 2),
      startingPosition.y - (this.displayHeight / 2),
    );
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    (this.body as Physics.Arcade.Body).setBounce(0.3, 0.3);
    this.setFrame(0);

    this.scene.anims.create({
      key: 'swing',
      frames: this.anims.generateFrameNumbers('player-golfing', { frames: [
        0, 0, 0,
        1, 1, 1, 1,
        2,
        3,
        4, 4, 4, 4, 4, 4,
      ]}),
      frameRate: 10,
      // repeat: -1,
    });
  }

  update(time: number, delta: number) {}

  swing() {
    return new Promise<void>((resolve, reject) => {
      let found = false;
      this.on(Animations.Events.ANIMATION_UPDATE, (e, frame) => {
        if (frame.textureFrame === 2 && !found) {
          found = true;
          resolve();
        }
      });
      this.anims.play('swing');
    });
  }

  resetSwing() {
    this.setFrame(0);
    this.anims.stop();
  }
}
