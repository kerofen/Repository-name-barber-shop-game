import { screenSize } from "../gameConfig.json";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
    this.titleMusic = null;
    this.startButton = null;
    this.gameLogoWidth = 0;
    this.gameLogoHeight = 0;
  }

  create() {
    // Get screen dimensions
    const { width, height } = this.cameras.main;

    // Create background
    const background = this.add.image(width / 2, height / 2, 'background');
    
    // Scale background to fit screen maintaining aspect ratio
    const bgTexture = this.textures.get('background');
    const bgWidth = bgTexture.getSourceImage().width;
    const bgHeight = bgTexture.getSourceImage().height;
    
    const scaleX = width / bgWidth;
    const scaleY = height / bgHeight;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale);

    // Add game logo
    const gameLogo = this.add.image(width / 2, height * 0.3, 'game_logo');
    
    // Scale logo to fit screen width with some margin
    const logoTexture = this.textures.get('game_logo');
    this.gameLogoWidth = logoTexture.getSourceImage().width;
    this.gameLogoHeight = logoTexture.getSourceImage().height;
    
    const logoScale = Math.min((width * 0.8) / this.gameLogoWidth, (height * 0.3) / this.gameLogoHeight);
    gameLogo.setScale(logoScale);

    // Add start button at bottom
    this.startButton = this.add.image(width / 2, height * 0.85, 'start_button');
    this.startButton.setInteractive({ useHandCursor: true });
    
    // Scale start button
    const buttonTexture = this.textures.get('start_button');
    const buttonWidth = buttonTexture.getSourceImage().width;
    const buttonHeight = buttonTexture.getSourceImage().height;
    const buttonScale = Math.min((width * 0.6) / buttonWidth, 80 / buttonHeight);
    this.startButton.setScale(buttonScale);

    // Button interactions
    this.startButton.on('pointerdown', this.startGame, this);
    this.startButton.on('pointerover', () => {
      this.startButton.setScale(buttonScale * 1.1);
    });
    this.startButton.on('pointerout', () => {
      this.startButton.setScale(buttonScale);
    });

    // Play title BGM
    if (this.sound.get('title_bgm')) {
      this.titleMusic = this.sound.get('title_bgm');
    } else {
      this.titleMusic = this.sound.add('title_bgm', { 
        volume: 0.6, 
        loop: true 
      });
    }
    
    if (!this.titleMusic.isPlaying) {
      this.titleMusic.play();
    }

    // Handle keyboard input
    this.input.keyboard.on('keydown-ENTER', this.startGame, this);
    this.input.keyboard.on('keydown-SPACE', this.startGame, this);

    // Handle screen orientation change
    this.scale.on('resize', this.handleResize, this);

    // Handle scene shutdown
    this.events.on('shutdown', () => {
      if (this.titleMusic && this.titleMusic.isPlaying) {
        this.titleMusic.stop();
      }
    });
  }

  startGame() {
    // Play button click sound
    this.sound.play('button_click', { volume: 0.3 });
    
    // Stop title music
    if (this.titleMusic && this.titleMusic.isPlaying) {
      this.titleMusic.stop();
    }
    
    // Start conversation scene
    this.scene.start('ConversationScene');
  }

  handleResize(gameSize) {
    const { width, height } = gameSize;
    
    // Update positions based on new size
    const background = this.children.getByName('background');
    if (background) {
      background.setPosition(width / 2, height / 2);
    }
    
    if (this.startButton) {
      this.startButton.setPosition(width / 2, height * 0.85);
    }
  }

}
