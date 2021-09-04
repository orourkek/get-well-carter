import { GameObjects, Scene } from 'phaser';
import { MainScene } from '../scenes/main-scene';

export class DebugHUD extends GameObjects.Container {

  public scene: MainScene;

  private enabled: boolean;
  private text: GameObjects.Text;

  public constructor(scene: Scene, enabled = false) {
    super(scene, 16, 16);

    this.setEnabled(enabled);

    this.scene.input.keyboard.on('keydown-BACKTICK', () => {
      this.setEnabled(!this.enabled);
    });

    this.text = this.scene.add.text(0, 0, '', {
      fontSize: '16px',
      padding: { x: 8, y: 4 },
      backgroundColor: '#000000AA',
      color: '#ffffff',
    });

    this.add(this.text);
    this.setScrollFactor(0);
    this.setDepth(1000);

    scene.add.existing(this);
  }

  public setEnabled(val = true) {
    this.enabled = val;
    this.setVisible(val);
  }

  public update(time: number, delta: number) {
    if (!this.enabled) {
      return;
    }
  }
}
