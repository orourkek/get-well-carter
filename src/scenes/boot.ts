import { GameObjects, Scene } from 'phaser';
import logoImg from '../assets/img/phaser-logo.png';
import playerImg from '../assets/img/carter-in-bed.png';
import { ProgressBar } from '../objects/progress-bar';
import { palette } from '../colors';

export class BootScene extends Scene {

  private progressBar: ProgressBar;
  private assetText: GameObjects.Text;

  constructor() {
    super('Boot');
  }

  public preload() {
    const { width, height, centerX, centerY } = this.cameras.main;

    // background
    this.add.rectangle(
      0,
      0,
      width,
      height,
      palette.white.color,
    ).setOrigin(0, 0);

    this.progressBar = new ProgressBar(this, {
      x: centerX,
      y: centerY,
      width: width * (2 / 3),
      height: height / 8,
      padding: 8,
      barColor: palette.blue,
      barBgColor: palette.darkBlue,
      textColor: palette.white,
    });

    this.assetText = this.make.text({
      x: centerX,
      y: centerY + (height / 8),
      text: '',
      style: {
        font: '16px monospace',
        color: palette.dark.rgba,
      }
    }).setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      this.progressBar.setProgress(value);
    });

    this.load.on('fileprogress', (file: any) => {
      this.assetText.setText(`Loading asset: ${file.key}`);
    });

    this.load.on('complete', () => {
      this.progressBar.setBarLabel('Complete!');
      this.assetText.setText('Starting Game...');

      this.time.delayedCall(50, () => {
        this.scene.transition({
          target: 'TitleScene',
          duration: 500,
        });
      });
    });

    this.load.image('logo', logoImg);

    this.load.webfont(
      'Press Start 2P',
      'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'
    );

    this.load.spritesheet('player', playerImg, {
      frameWidth: 64,
      frameHeight: 32,
    });
  }
}
