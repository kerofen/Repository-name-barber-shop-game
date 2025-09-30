/**
 * Level Manager - Manages game scenes and data for Kerofen game
 */
export class LevelManager {
  // Scene order list for kerofen game
  static LEVEL_ORDER = [
    "TitleScene",
    "ConversationScene", 
    "GameScene",
    "ResultScene"
  ];

  // Get the key of the next scene
  static getNextLevelScene(currentSceneKey) {
    const currentIndex = LevelManager.LEVEL_ORDER.indexOf(currentSceneKey);
    
    // If it's the last scene or current scene not found, return null
    if (currentIndex === -1 || currentIndex >= LevelManager.LEVEL_ORDER.length - 1) {
      return null;
    }
    
    return LevelManager.LEVEL_ORDER[currentIndex + 1];
  }

  // Check if it's the last scene
  static isLastLevel(currentSceneKey) {
    const currentIndex = LevelManager.LEVEL_ORDER.indexOf(currentSceneKey);
    return currentIndex === LevelManager.LEVEL_ORDER.length - 1;
  }

  // Get the key of the first scene
  static getFirstLevelScene() {
    return LevelManager.LEVEL_ORDER.length > 0 ? LevelManager.LEVEL_ORDER[0] : null;
  }

  // Game data management with localStorage
  static saveGameData(data) {
    try {
      localStorage.setItem('kerofen-game-data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save game data:', error);
    }
  }

  static loadGameData() {
    try {
      const saved = localStorage.getItem('kerofen-game-data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load game data:', error);
    }
    
    // Return default values
    return {
      maxSurvivalTime: 0,
      totalAttempts: 0,
      clearCount: 0
    };
  }

  static updateGameData(survivalTime, cleared) {
    const data = this.loadGameData();
    data.totalAttempts++;
    if (survivalTime > data.maxSurvivalTime) {
      data.maxSurvivalTime = survivalTime;
    }
    if (cleared) {
      data.clearCount++;
    }
    this.saveGameData(data);
  }
}
