export class ConversationScene extends Phaser.Scene {
  constructor() {
    super('ConversationScene');
    this.conversationMusic = null;
    this.nextButton = null;
    this.speechBubble = null;
    this.dialogText = null;
    this.currentDialogIndex = 0;
    this.barberCharacter = null;
    this.kerofenCharacter = null;
    
    // Dialog sequence
    this.dialogs = [
      { speaker: 'barber', text: '本日はどのように？' },
      { speaker: 'kerofen', text: '短く、おまかせで' },
      { speaker: 'barber', text: 'はいよっ' }
    ];
  }

  create() {
    const { width, height } = this.cameras.main;

    // Create background
    const background = this.add.image(width / 2, height / 2, 'background');
    const bgTexture = this.textures.get('background');
    const bgWidth = bgTexture.getSourceImage().width;
    const bgHeight = bgTexture.getSourceImage().height;
    const scaleX = width / bgWidth;
    const scaleY = height / bgHeight;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale);

    // Add characters
    this.barberCharacter = this.add.image(width * 0.25, height * 0.6, 'barber_character');
    this.kerofenCharacter = this.add.image(width * 0.75, height * 0.6, 'kerofen_character');

    // Scale characters
    const barberTexture = this.textures.get('barber_character');
    const barberScale = Math.min((width * 0.3) / barberTexture.getSourceImage().width, (height * 0.4) / barberTexture.getSourceImage().height);
    this.barberCharacter.setScale(barberScale);

    const kerofenTexture = this.textures.get('kerofen_character');
    const kerofenScale = Math.min((width * 0.3) / kerofenTexture.getSourceImage().width, (height * 0.4) / kerofenTexture.getSourceImage().height);
    this.kerofenCharacter.setScale(kerofenScale);

    // Create speech bubble (will be updated dynamically)
    this.speechBubble = this.add.image(width / 2, height * 0.25, 'speech_bubble_horizontal');

    // Create dialog text
    this.dialogText = this.add.text(width / 2, height * 0.25, '', {
      fontSize: `${Math.floor(width * 0.032)}px`,
      color: '#2c3e50',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: width * 0.5 }
    });
    this.dialogText.setOrigin(0.5, 0.5);

    // Create next button
    this.nextButton = this.add.image(width * 0.9, height * 0.9, 'next_button');
    this.nextButton.setInteractive({ useHandCursor: true });
    
    // Scale next button
    const nextTexture = this.textures.get('next_button');
    const nextScale = Math.min(60 / nextTexture.getSourceImage().width, 60 / nextTexture.getSourceImage().height);
    this.nextButton.setScale(nextScale);

    // Button interactions
    this.nextButton.on('pointerdown', this.nextDialog, this);
    this.nextButton.on('pointerover', () => {
      this.nextButton.setScale(nextScale * 1.1);
    });
    this.nextButton.on('pointerout', () => {
      this.nextButton.setScale(nextScale);
    });

    // Play conversation BGM
    if (this.sound.get('conversation_bgm')) {
      this.conversationMusic = this.sound.get('conversation_bgm');
    } else {
      this.conversationMusic = this.sound.add('conversation_bgm', { 
        volume: 0.6, 
        loop: true 
      });
    }
    
    if (!this.conversationMusic.isPlaying) {
      this.conversationMusic.play();
    }

    // Handle keyboard input
    this.input.keyboard.on('keydown-ENTER', this.nextDialog, this);
    this.input.keyboard.on('keydown-SPACE', this.nextDialog, this);

    // Start first dialog
    this.showDialog();

    // Handle screen tap/click
    this.input.on('pointerdown', this.nextDialog, this);

    // Handle scene shutdown
    this.events.on('shutdown', () => {
      if (this.conversationMusic && this.conversationMusic.isPlaying) {
        this.conversationMusic.stop();
      }
    });
  }

  showDialog() {
    if (this.currentDialogIndex >= this.dialogs.length) {
      this.endConversation();
      return;
    }

    const currentDialog = this.dialogs[this.currentDialogIndex];
    const { width, height } = this.cameras.main;
    
    // Highlight current speaker
    this.barberCharacter.setTint(currentDialog.speaker === 'barber' ? 0xffffff : 0x999999);
    this.kerofenCharacter.setTint(currentDialog.speaker === 'kerofen' ? 0xffffff : 0x999999);

    // Update speech bubble texture and position based on speaker
    if (currentDialog.speaker === 'barber') {
      // Use left-pointing bubble for barber (left side character)
      this.speechBubble.setTexture('speech_bubble_horizontal');
      this.speechBubble.setPosition(width * 0.38, height * 0.4);
      this.speechBubble.setFlipX(false);
      
      const bubbleTexture = this.textures.get('speech_bubble_horizontal');
      const bubbleScale = Math.min((width * 0.5) / bubbleTexture.getSourceImage().width, (height * 0.15) / bubbleTexture.getSourceImage().height);
      this.speechBubble.setScale(bubbleScale);
    } else {
      // Use same bubble asset but horizontally flipped for kerofen (right side character)
      this.speechBubble.setTexture('speech_bubble_horizontal');
      this.speechBubble.setPosition(width * 0.62, height * 0.4);
      this.speechBubble.setFlipX(true);
      
      const bubbleTexture = this.textures.get('speech_bubble_horizontal');
      const bubbleScale = Math.min((width * 0.5) / bubbleTexture.getSourceImage().width, (height * 0.15) / bubbleTexture.getSourceImage().height);
      this.speechBubble.setScale(bubbleScale);
    }

    // Update dialog text
    this.dialogText.setText(currentDialog.text);
    this.dialogText.setPosition(this.speechBubble.x, this.speechBubble.y);
  }

  nextDialog() {
    // Play button click sound
    this.sound.play('button_click', { volume: 0.3 });

    this.currentDialogIndex++;
    this.showDialog();
  }

  endConversation() {
    // Stop conversation music
    if (this.conversationMusic && this.conversationMusic.isPlaying) {
      this.conversationMusic.stop();
    }
    
    // Start game scene
    this.scene.start('GameScene');
  }

}
