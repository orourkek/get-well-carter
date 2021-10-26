import { Scene, Display, GameObjects } from 'phaser';
import { palette } from '../colors';

export class TitleScene extends Scene {

  private title: GameObjects.Text;

  constructor(){
    super('TitleScene');
  }

  create() {
    const { width, height, centerX, centerY } = this.cameras.main;

    this.add.rectangle(
      0,
      0,
      width,
      height,
      Display.Color.HexStringToColor('#d1d3d6').color,
    ).setOrigin(0, 0);

    const color1 = Display.Color.HexStringToColor('#0e5b51');
    const color2 = Display.Color.HexStringToColor('#418199');

    this.title = this.add.text(centerX, centerY, 'Get Well Carter')
      .setFontFamily('"Press Start 2P"')
      .setAlign('center')
      .setFontSize(64)
      .setWordWrapWidth(width - 64)
      .setOrigin(0.5, 0.5)
      .setLineSpacing(16)
      .setColor(color1.rgba)
      .setShadow(8, 8, '#333435');

    const tween = this.tweens.addCounter({
      from: 0,
      to: 100,
      yoyo: true,
      loop: -1,
      duration: 2000,
      onUpdate: () => {
        const color = Display.Color.Interpolate.ColorWithColor(
          color1,
          color2,
          50,
          tween.getValue()
        );
        this.title.setColor(Display.Color.ObjectToColor(color).rgba);
      }
    });

    this.add.text(centerX, height - 64, 'PRESS ANY KEY TO START')
      .setFontFamily('"Press Start 2P"')
      .setFontSize(18)
      .setOrigin(0.5, 0.5)
      .setColor('#727882');

    this.input.keyboard.once('keydown', this.startGame, this);
  }

  startGame() {
    this.scene.stop('TitleScene');
    this.scene.start('MainScene');
  }
}
