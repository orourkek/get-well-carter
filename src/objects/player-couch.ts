import { GameObjects, Physics } from 'phaser';
import { MainScene } from '../scenes/main-scene';
import { fromEvent } from 'rxjs';
import { filter, throttleTime } from 'rxjs/operators';

export class CouchPlayer extends Physics.Arcade.Sprite {

  public scene: MainScene;

  public readonly JUMP_VELOCITY = 200;
  public readonly DOUBLE_JUMP_MIN_VELOCITY = 25;

  constructor(scene: MainScene, startingPosition: { x: number, y: number }) {
    super(scene, 0, 0, 'player');
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
      key: 'couch-jump',
      frames: this.anims.generateFrameNumbers('player', { frames: [
        0,
        1,
        2,
        1,
        0,
      ]}),
      frameRate: 10,
    });
  }

  public enableJumping() {
    const jumpKeypress$ = fromEvent<KeyboardEvent>(document, 'keypress').pipe(
      filter(() => !this.scene.scene.isPaused()),
      filter((event) => event.key === ' '),
      filter((event) => !event.repeat),
      filter(() => this.canJump()),
      throttleTime(100),
    );

    const subscription = jumpKeypress$.subscribe(this.jump.bind(this));

    this.once(GameObjects.Events.DESTROY, () => subscription.unsubscribe());
  }

  public jump() {
    // When falling, `this.body.velocity.y` will be large (e.g. 150+)
    this.setVelocityY(-(this.JUMP_VELOCITY));
    this.anims.play('couch-jump');
  }

  public update(time: number, delta: number) {}

  private canJump(): boolean {
    if (this.body.touching.down) {
      return true;
    }

    if (this.body.velocity.y > this.DOUBLE_JUMP_MIN_VELOCITY) {
      return true;
    }

    return false;
  }
}
