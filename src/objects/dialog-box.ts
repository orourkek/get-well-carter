import { Scene, Display, GameObjects, Tweens } from 'phaser';

export class DialogBox extends GameObjects.Group {

  private TEXT_COLOR = '#d1d3d6';
  private BG_COLOR = 0x344b70;
  private BORDER_SIZE = 8;

  private overlay: GameObjects.Rectangle;
  private graphics: GameObjects.Graphics;
  private nextHint: GameObjects.Text;
  private text: GameObjects.Text;
  private messages: string[] = [];
  private currentMessageIndex: number = 0;
  private currentCharacterIndex: number = 0;
  private onComplete?: () => void;

  constructor(scene: Scene, options: { size?: number; } = {}) {
    super(scene);

    const fontSize = options.size ?? 36;
    const padding = fontSize * (2/3);
    const { width, height, centerX, centerY } = this.scene.cameras.main;

    this.graphics = this.scene.add
      .graphics()
      .setDepth(99)
      .setScrollFactor(0, 0);

    this.text = this.scene.add
      .text(centerX, height, '')
      .setFontFamily('"VT323"')
      .setFontSize(fontSize)
      .setWordWrapWidth(width - (padding * 4))
      .setAlign('center')
      .setFixedSize(width, 0)
      .setColor(this.TEXT_COLOR)
      .setShadow(2, 2, 'rgba(0,0,0,0.8)')
      .setPadding(padding, padding)
      .setDepth(100)
      .setScrollFactor(0, 0)
      .setOrigin(0.5, 1);

    this.overlay = this.scene.add.rectangle(
      centerX,
      centerY,
      width,
      height,
      0x000000,
      0,
    ).setDepth(90).setScrollFactor(0, 0);

    this.nextHint = this.scene.add
      .text(width, height, '[space] to continue')
      .setFontFamily('"VT323"')
      .setFontSize(Math.ceil(fontSize * 0.5))
      .setPadding(5)
      .setColor('#ffffff')
      .setShadow(4, 4, '#333435')
      .setDepth(100)
      .setScrollFactor(0, 0)
      .setAlpha(0)
      .setOrigin(1, 1);

    this.scene.tweens.add({
      targets: [this.graphics],
      duration: 200,
      alpha: {
        getStart: () => 0,
        getEnd: () => 1
      }
    });

    this.add(this.text);
    this.add(this.nextHint);
  }

  get currentMessage() {
    return this.messages[this.currentMessageIndex];
  }

  runDialog(messages: string[], onComplete?: () => void, opts: {
    overlayBg?: number;
    dialogBg?: number;
    dialogAlpha?: number;
  } = {}) {
    if (opts.overlayBg) {
      this.overlay.setFillStyle(opts.overlayBg, opts.dialogAlpha ?? 1);
    } else {
      this.overlay.setFillStyle(0x000, 0);
    }
    this.BG_COLOR = opts.dialogBg ?? 0x344b70;
    this.messages = messages;
    this.onComplete = onComplete;
    this.continuePrinting();
  }

  /**
   * Advances the dialog to the next message in the chain, or completes
   */
  private advanceDialog() {
    this.currentMessageIndex++;
    this.nextHint.setAlpha(0);

    if (this.currentMessageIndex < this.messages.length) {
      return this.continuePrinting();
    }

    this.graphics.clear();
    this.overlay.setFillStyle(0x000, 0);
    this.currentCharacterIndex = 0;
    this.currentMessageIndex = 0;
    this.messages = [];
    this.text.text = '';

    if (typeof this.onComplete === 'function') {
      this.onComplete();
    }
  }

  private setDisplayedMessage(message: string) {
    this.text.text = message;

    if (this.text.displayHeight < 90) {
      this.text.setPadding(
        this.text.padding.left,
        this.text.padding.top * 1.5,
      );
    }

    const textBounds = this.text.getBounds();

    this.graphics.clear();

    //////// OUTER FRAME BACKGROUND
    this.graphics.fillStyle(this.BG_COLOR, 1);
    this.graphics.fillRect(
      textBounds.left,
      textBounds.top,
      textBounds.width,
      textBounds.height,
    );

    //////// FRAME BORDER
    this.graphics.fillStyle(0xffffff, 0.15);
    this.graphics.fillRect(
      textBounds.left + this.BORDER_SIZE,
      textBounds.top + this.BORDER_SIZE,
      textBounds.width - (this.BORDER_SIZE * 2),
      textBounds.height - (this.BORDER_SIZE * 2),
    );

    //////// INNER FRAME BACKGROUND
    this.graphics.fillStyle(this.BG_COLOR, 1);
    this.graphics.fillRect(
      textBounds.left + (this.BORDER_SIZE * 2),
      textBounds.top + (this.BORDER_SIZE * 2),
      textBounds.width - (this.BORDER_SIZE * 4),
      textBounds.height - (this.BORDER_SIZE * 4),
    );

    //////// POSITION THE "NEXT" HINT
    this.nextHint.setPosition(
      textBounds.right,
      textBounds.top + (this.nextHint.displayHeight / 2)
    );
  }

  private continuePrinting() {
    const message = this.currentMessage.substring(0, this.currentCharacterIndex + 1);
    const newCharacter = this.currentMessage[this.currentCharacterIndex];

    if ((this.currentCharacterIndex + 1) >= this.currentMessage.length) {
      return this.finishPrinting();
    }

    let timeout = 60;

    if (newCharacter === '\n') {
      timeout = 100;
    } else if ([';', ','].includes(newCharacter)) {
      timeout = 300;
    } else if (['.', '?', '!'].includes(newCharacter)) {
      timeout = 500;
    } else if ([':'].includes(newCharacter)) {
      timeout = 600;
    }

    this.setDisplayedMessage(message);

    this.currentCharacterIndex++;

    setTimeout(this.continuePrinting.bind(this), timeout);
  }

  private finishPrinting() {
    this.setDisplayedMessage(this.currentMessage);
    this.currentCharacterIndex = 0;
    this.scene.input.keyboard.once('keydown-SPACE', this.advanceDialog, this);
    this.scene.tweens.add({
      targets: [this.nextHint],
      ease: 'Sine.easeInOut',
      duration: 100,
      delay: 0,
      alpha: {
        getStart: () => 0,
        getEnd: () => 0.75,
      }
    });
  }
}
