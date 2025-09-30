import { gameConfig, attackPatterns } from "../gameConfig.json";

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    
    // Game state
    this.gameMusic = null;
    this.gameStartTime = 0;
    this.currentTime = 0;
    this.gameEnded = false;
    
    // Player
    this.player = null;
    this.playerPosition = 1; // 0, 1, 2 (left, center, right)
    this.playerHP = 100;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = null;
    
    // UI Elements
    this.timerText = null;
    this.hpBarGraphics = null;
    this.hpText = null;
    
    // Game area
    this.gameAreaX = 0;
    this.gameAreaY = 0;
    this.gameAreaWidth = 0;
    this.gameAreaHeight = 0;
    this.laneWidth = 0;
    this.lanePositions = [];
    
    // Attack patterns
    this.scissors1Timer = null;
    this.scissors2Timer = null;
    
    // Enemy groups
    this.scissors1Group = null;
    this.scissors2Group = null;
    
    // Attack rates
    this.currentScissors1Rate = 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Initialize game state
    this.gameStartTime = this.time.now;
    this.currentTime = 0;
    this.gameEnded = false;
    this.playerHP = gameConfig.maxHP.value;
    this.isInvulnerable = false;

    // Create background
    const background = this.add.image(width / 2, height / 2, 'background');
    const bgTexture = this.textures.get('background');
    const scaleX = width / bgTexture.getSourceImage().width;
    const scaleY = height / bgTexture.getSourceImage().height;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale);

    // Setup game area (3 lanes in center)
    this.gameAreaWidth = width * 0.6;
    this.gameAreaHeight = height * 0.6;
    this.gameAreaX = (width - this.gameAreaWidth) / 2;
    this.gameAreaY = height * 0.3;
    this.laneWidth = this.gameAreaWidth / 3;
    
    // Calculate lane positions
    this.lanePositions = [
      this.gameAreaX + this.laneWidth * 0.5,      // Left lane
      this.gameAreaX + this.laneWidth * 1.5,      // Center lane
      this.gameAreaX + this.laneWidth * 2.5       // Right lane
    ];

    // Create player
    this.player = this.add.image(
      this.lanePositions[this.playerPosition], 
      this.gameAreaY + this.gameAreaHeight / 2, 
      'kerofen_100hp'
    );
    
    // Scale player
    const playerTexture = this.textures.get('kerofen_100hp');
    const playerScale = Math.min(this.laneWidth * 0.8 / playerTexture.getSourceImage().width, 150 / playerTexture.getSourceImage().height);
    this.player.setScale(playerScale);

    // Setup UI
    this.createUI();

    // Setup enemy groups
    this.scissors1Group = this.add.group();
    this.scissors2Group = this.add.group();

    // Setup input
    this.setupInput();

    // Play game BGM
    if (this.sound.get('game_bgm')) {
      this.gameMusic = this.sound.get('game_bgm');
    } else {
      this.gameMusic = this.sound.add('game_bgm', { 
        volume: 0.6, 
        loop: true 
      });
    }
    
    if (!this.gameMusic.isPlaying) {
      this.gameMusic.play();
    }

    // Start attack patterns
    this.setupAttackPatterns();

    // Setup physics for collision detection
    this.physics.world.enable([this.player]);
    this.player.body.setSize(
      this.player.width * 0.6, 
      this.player.height * 0.6
    );

    // Handle scene shutdown
    this.events.on('shutdown', () => {
      if (this.gameMusic && this.gameMusic.isPlaying) {
        this.gameMusic.stop();
      }
    });
  }

  createUI() {
    const { width, height } = this.cameras.main;

    // Timer
    this.timerText = this.add.text(width / 2, 50, '60', {
      fontSize: `${Math.floor(width * 0.08)}px`,
      color: '#2c3e50',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.timerText.setOrigin(0.5, 0.5);

    // Create graphics for HP bar
    this.hpBarGraphics = this.add.graphics();
    
    // Create HP text
    this.hpText = this.add.text(width / 2, 110, '', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.hpText.setOrigin(0.5, 0.5);

    // Initial HP bar draw
    this.updateHPBar();
  }

  updateHPBar() {
    if (!this.hpBarGraphics) return;
    
    const { width } = this.cameras.main;
    const maxHP = gameConfig.maxHP.value;
    const currentHP = Math.max(0, Math.min(maxHP, this.playerHP));
    const hpPercentage = currentHP / maxHP;
    
    // HP bar settings
    const barWidth = 250;
    const barHeight = 25;
    const barX = width / 2 - barWidth / 2;
    const barY = 125;
    
    // Clear previous graphics
    this.hpBarGraphics.clear();
    
    // Draw black border (outline)
    this.hpBarGraphics.lineStyle(3, 0x000000, 1);
    this.hpBarGraphics.strokeRect(barX, barY, barWidth, barHeight);
    
    // Draw red background
    this.hpBarGraphics.fillStyle(0xcc0000, 1);
    this.hpBarGraphics.fillRect(barX + 2, barY + 2, barWidth - 4, barHeight - 4);
    
    // Draw green HP fill
    const fillWidth = (barWidth - 4) * hpPercentage;
    this.hpBarGraphics.fillStyle(0x00ff00, 1);
    this.hpBarGraphics.fillRect(barX + 2, barY + 2, fillWidth, barHeight - 4);
    
    // Update HP text
    if (this.hpText) {
      this.hpText.setText(`HP: ${Math.floor(currentHP)}/${maxHP}`);
    }
  }

  setupInput() {
    // Touch/mouse input
    this.input.on('pointerdown', (pointer) => {
      const x = pointer.x;
      const { width } = this.cameras.main;
      
      if (x < width / 3) {
        this.movePlayer(0); // Left
      } else if (x > width * 2 / 3) {
        this.movePlayer(2); // Right
      } else {
        this.movePlayer(1); // Center
      }
    });

    // Keyboard input (for debugging)
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-LEFT', () => this.movePlayer(Math.max(0, this.playerPosition - 1)));
      this.input.keyboard.on('keydown-RIGHT', () => this.movePlayer(Math.min(2, this.playerPosition + 1)));
      this.input.keyboard.on('keydown-UP', () => this.movePlayer(1));
    }
  }

  movePlayer(newPosition) {
    if (newPosition === this.playerPosition || this.gameEnded) return;
    
    this.playerPosition = newPosition;
    
    // Play move sound
    this.sound.play('move_sound', { volume: 0.3 });
    
    // Animate player movement
    this.tweens.add({
      targets: this.player,
      x: this.lanePositions[this.playerPosition],
      duration: 200,
      ease: 'Power2'
    });
  }

  setupAttackPatterns() {
    // Scissors1 - starts immediately with increasing rate
    this.currentScissors1Rate = attackPatterns.scissors1InitialRate.value;
    this.scissors1Timer = this.time.addEvent({
      delay: this.currentScissors1Rate,
      callback: this.spawnScissors1,
      callbackScope: this,
      loop: true
    });

    // Scissors2 - starts at 40 seconds
    this.time.delayedCall(attackPatterns.scissors2StartTime.value * 1000, () => {
      this.scissors2Timer = this.time.addEvent({
        delay: attackPatterns.scissors2Rate.value,
        callback: this.spawnScissors2,
        callbackScope: this,
        loop: true
      });
    });
  }

  spawnScissors1() {
    if (this.gameEnded) return;
    
    const lane = Phaser.Math.Between(0, 2);
    const scissors = this.add.image(this.lanePositions[lane], -50, 'scissors1_enemy');
    
    // Scale scissors
    const scissorsTexture = this.textures.get('scissors1_enemy');
    const scissorsScale = Math.min(this.laneWidth * 0.4 / scissorsTexture.getSourceImage().width, 80 / scissorsTexture.getSourceImage().height);
    scissors.setScale(scissorsScale);
    
    this.scissors1Group.add(scissors);
    this.physics.world.enable(scissors);
    
    // Set collision body
    scissors.body.setSize(
      scissors.width * 0.6, 
      scissors.height * 0.6
    );
    
    // Move scissors down
    this.tweens.add({
      targets: scissors,
      y: this.cameras.main.height + 50,
      duration: 1500,
      onComplete: () => {
        scissors.destroy();
      }
    });

    // Check collision with player
    this.physics.add.overlap(scissors, this.player, () => {
      this.takeDamage(gameConfig.scissorsDamage.value);
      scissors.destroy();
    }, undefined, this);
  }

  spawnScissors2() {
    if (this.gameEnded) return;
    
    const lane = Phaser.Math.Between(0, 2);
    const scissors = this.add.image(this.lanePositions[lane], this.cameras.main.height + 50, 'scissors2_enemy');
    
    // Scale scissors
    const scissorsTexture = this.textures.get('scissors2_enemy');
    const scissorsScale = Math.min(this.laneWidth * 0.4 / scissorsTexture.getSourceImage().width, 80 / scissorsTexture.getSourceImage().height);
    scissors.setScale(scissorsScale);
    
    this.scissors2Group.add(scissors);
    this.physics.world.enable(scissors);
    
    // Set collision body
    scissors.body.setSize(
      scissors.width * 0.6, 
      scissors.height * 0.6
    );
    
    // Move scissors up
    this.tweens.add({
      targets: scissors,
      y: -50,
      duration: 1500,
      onComplete: () => {
        scissors.destroy();
      }
    });

    // Check collision with player
    this.physics.add.overlap(scissors, this.player, () => {
      this.takeDamage(gameConfig.scissorsDamage.value);
      scissors.destroy();
    }, undefined, this);
  }

  takeDamage(damage) {
    if (this.isInvulnerable || this.gameEnded) return;
    
    this.playerHP -= damage;
    console.log(`HP減少: ${damage}ダメージ → 現在HP: ${this.playerHP}`);
    
    this.sound.play('damage_sound', { volume: 0.3 });
    
    // Update player sprite based on HP
    this.updatePlayerSprite();
    
    // Update HP bar display
    this.updateHPBar();
    
    // Start invulnerability
    this.isInvulnerable = true;
    
    // Flash effect
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.player.alpha = 1;
        this.isInvulnerable = false;
      }
    });
    
    // Check game over
    if (this.playerHP <= 0) {
      this.gameOver();
    }
  }

  updatePlayerSprite() {
    let spriteKey = 'kerofen_100hp';
    
    if (this.playerHP <= 50) {
      spriteKey = 'kerofen_50hp';
    }
    
    this.player.setTexture(spriteKey);
  }

  gameOver() {
    this.gameEnded = true;
    
    // Stop all timers
    if (this.scissors1Timer) this.scissors1Timer.destroy();
    if (this.scissors2Timer) this.scissors2Timer.destroy();
    
    // Stop music
    if (this.gameMusic && this.gameMusic.isPlaying) {
      this.gameMusic.stop();
    }
    
    // Play game over sound
    this.sound.play('game_over', { volume: 0.3 });
    
    // Update game data
    const survivalTime = Math.floor(this.currentTime);
    import('../LevelManager.js').then(({ LevelManager }) => {
      LevelManager.updateGameData(survivalTime, false);
    });
    
    // Go to result scene
    this.time.delayedCall(1500, () => {
      this.scene.start('ResultScene', { 
        survivalTime: survivalTime,
        cleared: false 
      });
    });
  }

  gameCleared() {
    this.gameEnded = true;
    
    // Stop all timers
    if (this.scissors1Timer) this.scissors1Timer.destroy();
    if (this.scissors2Timer) this.scissors2Timer.destroy();
    
    // Stop music
    if (this.gameMusic && this.gameMusic.isPlaying) {
      this.gameMusic.stop();
    }
    
    // Play clear sound
    this.sound.play('game_clear', { volume: 0.3 });
    
    // Update game data
    const survivalTime = gameConfig.gameDuration.value;
    import('../LevelManager.js').then(({ LevelManager }) => {
      LevelManager.updateGameData(survivalTime, true);
    });
    
    // Go to result scene
    this.time.delayedCall(2000, () => {
      this.scene.start('ResultScene', { 
        survivalTime: survivalTime,
        cleared: true 
      });
    });
  }

  update() {
    if (this.gameEnded) return;
    
    // Update game timer
    this.currentTime = (this.time.now - this.gameStartTime) / 1000;
    const remainingTime = Math.max(0, gameConfig.gameDuration.value - this.currentTime);
    this.timerText.setText(Math.ceil(remainingTime).toString());
    
    // Check if game completed
    if (remainingTime <= 0) {
      this.gameCleared();
      return;
    }
    
    // Update scissors1 rate (accelerate from 3/sec to 6/sec over 20 seconds)
    if (this.currentTime <= 20) {
      const progress = this.currentTime / 20;
      const newRate = Phaser.Math.Interpolation.Linear([
        attackPatterns.scissors1InitialRate.value,
        attackPatterns.scissors1FinalRate.value
      ], progress);
      
      if (Math.abs(newRate - this.currentScissors1Rate) > 10) {
        this.currentScissors1Rate = newRate;
        if (this.scissors1Timer) {
          this.scissors1Timer.destroy();
          this.scissors1Timer = this.time.addEvent({
            delay: newRate,
            callback: this.spawnScissors1,
            callbackScope: this,
            loop: true
          });
        }
      }
    }
    
    // Update HP bar visual
    this.updateHPBar();
  }

}
