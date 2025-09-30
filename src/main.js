import Phaser from "phaser";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { screenSize, debugConfig, renderConfig } from "./gameConfig.json";
import { Preloader } from "./scenes/Preloader.js";
import { TitleScene } from "./scenes/TitleScene.js";
import { ConversationScene } from "./scenes/ConversationScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { ResultScene } from "./scenes/ResultScene.js";

const config = {
  type: Phaser.AUTO,
  width: screenSize.width.value,
  height: screenSize.height.value,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      fps: 120,
      debug: debugConfig.debug.value,
      debugShowBody: debugConfig.debug.value,
      debugShowStaticBody: debugConfig.debug.value,
      debugShowVelocity: debugConfig.debug.value,
    },
  },
  pixelArt: renderConfig.pixelArt.value,
  plugins: {
    scene: [{
      key: 'rexUI',
      plugin: RexUIPlugin,
      mapping: 'rexUI'
    }]
  },
};

const game = new Phaser.Game(config);

// Add scenes in the following order: Preloader, Game scenes
game.scene.add("Preloader", Preloader, true);
game.scene.add("TitleScene", TitleScene);
game.scene.add("ConversationScene", ConversationScene);
game.scene.add("GameScene", GameScene);
game.scene.add("ResultScene", ResultScene);
