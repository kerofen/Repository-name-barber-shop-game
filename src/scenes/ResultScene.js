import { LevelManager } from '../LevelManager.js';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
    this.retryButton = null;
    this.resultData = null;
  }

  init(data) {
    this.resultData = data;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Create background
    const background = this.add.image(width / 2, height / 2, 'background');
    const bgTexture = this.textures.get('background');
    const scaleX = width / bgTexture.getSourceImage().width;
    const scaleY = height / bgTexture.getSourceImage().height;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale);

    // Add semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    // Get game data
    const gameData = LevelManager.loadGameData();

    if (this.resultData && this.resultData.cleared) {
      // Game cleared
      this.showClearResult(width, height, gameData);
    } else {
      // Game over
      this.showGameOverResult(width, height, gameData);
    }

    // Create retry button
    this.retryButton = this.add.image(width / 2, height * 0.9, 'retry_button');
    this.retryButton.setInteractive({ useHandCursor: true });
    
    // Scale retry button
    const retryTexture = this.textures.get('retry_button');
    const retryScale = Math.min((width * 0.4) / retryTexture.getSourceImage().width, 80 / retryTexture.getSourceImage().height);
    this.retryButton.setScale(retryScale);

    // Button interactions
    this.retryButton.on('pointerdown', this.restartGame, this);
    this.retryButton.on('pointerover', () => {
      this.retryButton.setScale(retryScale * 1.1);
    });
    this.retryButton.on('pointerout', () => {
      this.retryButton.setScale(retryScale);
    });

    // Handle keyboard input
    this.input.keyboard.on('keydown-ENTER', this.restartGame, this);
    this.input.keyboard.on('keydown-SPACE', this.restartGame, this);
    this.input.keyboard.on('keydown-R', this.restartGame, this);
  }

  showClearResult(width, height, gameData) {
    // Show clear image
    const clearImage = this.add.image(width / 2, height * 0.25, 'kerofen_clear');
    const clearTexture = this.textures.get('kerofen_clear');
    const clearScale = Math.min((width * 0.6) / clearTexture.getSourceImage().width, (height * 0.3) / clearTexture.getSourceImage().height);
    clearImage.setScale(clearScale);

    // Clear message
    const clearText = this.add.text(width / 2, height * 0.45, '髪ふさふさ素敵～！', {
      fontSize: `${Math.floor(width * 0.06)}px`,
      color: '#2ecc71',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      align: 'center'
    });
    clearText.setOrigin(0.5, 0.5);

    // Game stats
    this.showGameStats(width, height, gameData, true);
  }

  showGameOverResult(width, height, gameData) {
    // Show game over image
    const gameOverImage = this.add.image(width / 2, height * 0.25, 'kerofen_lose');
    const gameOverTexture = this.textures.get('kerofen_lose');
    const gameOverScale = Math.min((width * 0.6) / gameOverTexture.getSourceImage().width, (height * 0.3) / gameOverTexture.getSourceImage().height);
    gameOverImage.setScale(gameOverScale);

    // Game over message
    const gameOverText = this.add.text(width / 2, height * 0.45, '俺の髪どこ行った！？', {
      fontSize: `${Math.floor(width * 0.05)}px`,
      color: '#e74c3c',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      align: 'center'
    });
    gameOverText.setOrigin(0.5, 0.5);

    // Game stats
    this.showGameStats(width, height, gameData, false);
  }

  showGameStats(width, height, gameData, cleared) {
    const currentSurvival = this.resultData ? this.resultData.survivalTime : 0;
    
    // Create stats container
    const statsY = height * 0.55;
    const lineHeight = Math.floor(width * 0.05);
    
    // Current record
    const recordText = this.add.text(width / 2, statsY, `記録：${currentSurvival}秒生存`, {
      fontSize: `${Math.floor(width * 0.045)}px`,
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    });
    recordText.setOrigin(0.5, 0.5);

    // Max record
    const maxRecordText = this.add.text(width / 2, statsY + lineHeight, `最高記録：${gameData.maxSurvivalTime}秒`, {
      fontSize: `${Math.floor(width * 0.04)}px`,
      color: '#f39c12',
      fontFamily: 'Arial',
      align: 'center'
    });
    maxRecordText.setOrigin(0.5, 0.5);

    // Total attempts
    const attemptsText = this.add.text(width / 2, statsY + lineHeight * 2, `挑戦回数：${gameData.totalAttempts}回`, {
      fontSize: `${Math.floor(width * 0.04)}px`,
      color: '#3498db',
      fontFamily: 'Arial',
      align: 'center'
    });
    attemptsText.setOrigin(0.5, 0.5);

    // Clear count
    const clearText = this.add.text(width / 2, statsY + lineHeight * 3, `クリア回数：${gameData.clearCount}回`, {
      fontSize: `${Math.floor(width * 0.04)}px`,
      color: '#2ecc71',
      fontFamily: 'Arial',
      align: 'center'
    });
    clearText.setOrigin(0.5, 0.5);

    // Success rate
    const successRate = gameData.totalAttempts > 0 ? ((gameData.clearCount / gameData.totalAttempts) * 100).toFixed(1) : '0.0';
    const successText = this.add.text(width / 2, statsY + lineHeight * 4, `成功率：${successRate}%`, {
      fontSize: `${Math.floor(width * 0.04)}px`,
      color: '#9b59b6',
      fontFamily: 'Arial',
      align: 'center'
    });
    successText.setOrigin(0.5, 0.5);

    // New record notification
    if (currentSurvival > 0 && currentSurvival === gameData.maxSurvivalTime && currentSurvival > 0) {
      const newRecordText = this.add.text(width / 2, statsY + lineHeight * 5.5, '🎉 新記録！ 🎉', {
        fontSize: `${Math.floor(width * 0.05)}px`,
        color: '#f1c40f',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        align: 'center'
      });
      newRecordText.setOrigin(0.5, 0.5);

      // Add sparkle animation
      this.tweens.add({
        targets: newRecordText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  restartGame() {
    // Play button click sound
    this.sound.play('button_click', { volume: 0.3 });
    
    // Return to title screen
    this.scene.start('TitleScene');
  }
}
