import { GameObjects, Scene } from 'phaser';
import cloudsImg from '../assets/img/clouds.png';
import playerImg from '../assets/img/player.png';
import bedroomImg from '../assets/img/bedroom.png';
import playerGolfingImg from '../assets/img/player-golfing.png';
import backgroundImg from '../assets/img/sky.png';
import vehiclesImg from '../assets/img/vehicles.png';
import applauseAudio from '../assets/audio/crowd-applause.wav';
import golfHitAudio from '../assets/audio/golf-hit.wav';
import loseAudio from '../assets/audio/lose.mp3';
import backgroundAudio from '../assets/audio/happy-8bit-pixel-adventure.wav';
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

    this.load.webfont(
      'Press Start 2P',
      'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'
    );

    this.load.webfont(
      'VT323',
      'https://fonts.googleapis.com/css2?family=VT323&display=swap'
    );

    this.load.image('background', backgroundImg);
    this.load.image('bedroom', bedroomImg);

    this.load.spritesheet('player', playerImg, {
      frameWidth: 48,
      frameHeight: 32,
    });
    this.load.spritesheet('player-golfing', playerGolfingImg, {
      frameWidth: 24,
      frameHeight: 32,
    });
    this.load.spritesheet('vehicles', vehiclesImg, {
      frameWidth: 72,
      frameHeight: 26,
    });
    this.load.spritesheet('clouds', cloudsImg, {
      frameWidth: 64,
      frameHeight: 32,
    });

    this.load.audio('lose', loseAudio);
    this.load.audio('golfHit', golfHitAudio);
    this.load.audio('applause', applauseAudio);
    this.load.audio('backgroundMusic', backgroundAudio);
  }
}
