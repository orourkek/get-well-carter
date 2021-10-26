import { Scene, GameObjects } from 'phaser';
import { palette } from '../colors';

const enum GameEndStatus {
  Win = 'win',
  Lose = 'lose',
}

export class GameOver extends Scene {

  private status: GameEndStatus;
  private message: string;
  private originScene: string;

  private bgColor: Record<GameEndStatus, number> = {
    [GameEndStatus.Win]: palette.green.color,
    [GameEndStatus.Lose]: palette.red.color,
  };

  private label: Record<GameEndStatus, string> = {
    [GameEndStatus.Win]: 'VICTORY!',
    [GameEndStatus.Lose]: 'GAME OVER',
  };

  constructor() {
    super('GameOver');
  }

  public init(data: any) {
    this.status = data.status || 'lose';
    this.message = data.message || '';
    this.originScene = data?.originScene || 'MainScene';
  }

  public create() {
    const { width, height, centerX, centerY } = this.cameras.main;

    this.add.rectangle(
      0,
      0,
      width,
      height,
      this.bgColor[this.status],
      0.8
    ).setOrigin(0, 0);

    this.add.text(centerX, centerY - 32, this.label[this.status])
      .setFontFamily('"Press Start 2P"')
      .setFontSize(64)
      .setOrigin(0.5, 0.5)
      .setColor(palette.white.rgba)
      .setShadow(8, 8, palette.dark.rgba)
      .setScrollFactor(0, 0);

    if (this.message) {
      this.add.text(centerX, centerY + 64, this.message)
        .setFontFamily('"Press Start 2P"')
        .setFontSize(16)
        .setWordWrapWidth(width - 24)
        .setLineSpacing(8)
        .setAlign('center')
        .setOrigin(0.5, 0)
        .setColor(palette.white.rgba)
        .setScrollFactor(0, 0);
    }

    this.add.text(centerX, height - 64, 'Press [r] to restart')
      .setFontFamily('"Press Start 2P"')
      .setFontSize(24)
      .setOrigin(0.5, 0.5)
      .setColor(palette.white.rgba)
      .setScrollFactor(0, 0);

    this.input.keyboard.once('keydown-R', this.restartGame, this);

    if (this.status === 'lose') {
      this.sound.play('lose');
    }
  }

  restartGame() {
    this.scene.get(this.originScene).scene.restart({ isRestart: true });
    this.scene.stop('GameOver');
  }
}
