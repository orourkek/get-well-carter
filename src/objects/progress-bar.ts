import { Scene, Display, GameObjects } from 'phaser';

interface Options {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  padding?: number;
  textColor?: Display.Color;
  barColor?: Display.Color;
  barBgColor?: Display.Color;
  barLabel?: string;
  secondaryLabel?: string;
}

export class ProgressBar extends GameObjects.Group {

  public static readonly defaultOptions: Options = {
    x: 400,
    y: 300,
    width: 600,
    height: 80,
    padding: 8,
    textColor: Display.Color.HexStringToColor('#000000'),
    barColor: Display.Color.HexStringToColor('#00FFFF'),
    barBgColor: Display.Color.HexStringToColor('#008080'),
    barLabel: 'Loading...',
  };

  private options: Options;
  private graphics: GameObjects.Graphics;
  private barLabel: GameObjects.Text;

  constructor(scene: Scene, opts: Options = {}) {
    super(scene);

    this.options = {
      ...ProgressBar.defaultOptions,
      ...opts,
    };

    this.graphics = this.scene.add.graphics();

    // Progress bar "box"
    this.graphics.fillStyle(this.options.barBgColor.color, 1);
    this.graphics.fillRect(
      (this.options.x - this.options.width / 2) - this.options.padding,
      (this.options.y - this.options.height / 2) - this.options.padding,
      this.options.width + (this.options.padding * 2),
      this.options.height + (this.options.padding * 2)
    );

    // Progress bar
    this.graphics.fillStyle(this.options.barColor.color, 1);

    this.barLabel = this.scene.make.text({
      x: this.options.x,
      y: this.options.y,
      text: this.options.barLabel,
      style: {
        font: '24px monospace',
        color: this.options.textColor.rgba,
      }
    }).setOrigin(0.5, 0.5);

    this.add(this.graphics);
    this.add(this.barLabel);
  }

  public setBarLabel(str: string) {
    this.barLabel.setText(str);
  }

  public setProgress(pct: number) {
    this.graphics.fillRect(
      (this.options.x - this.options.width / 2),
      (this.options.y - this.options.height / 2),
      this.options.width * pct,
      this.options.height
    );
  }
}
