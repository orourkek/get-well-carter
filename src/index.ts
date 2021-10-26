import Phaser from 'phaser';
import { WebFontLoaderPlugin } from 'phaser3-webfont-loader';
import { MainScene } from './scenes/main-scene';
import { TitleScene } from './scenes/title-scene';
import { BootScene } from './scenes/boot';
import { GameOver } from './scenes/game-over';
import { GolfScene } from './scenes/golf-scene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 600,
  backgroundColor: '#243963',
  render: {
    pixelArt: true,
  },
  plugins: {
    global: [{
      key: 'WebFontLoader',
      plugin: WebFontLoaderPlugin,
      start: true,
    }],
  },
  physics: {
    default: 'arcade',
    arcade: {
      fps: 60,
      // debug: true,
      gravity: {
        y: 600,
      },
    },
  },
  scene: [
    BootScene,
    TitleScene,
    MainScene,
    GolfScene,
    GameOver,
  ],
};

const game = new Phaser.Game(gameConfig);
