class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configuration (now using global config variables directly, including new text/font config)
        this.config = {
            CANVAS_WIDTH, CANVAS_HEIGHT, ASSET_PATHS, PLAYER_SPEED, BULLET_SPEED,
            BULLET_COOLDOWN, WIN_SCORE, INITIAL_ENEMY_COUNT, ENEMY_SPAWN_Y_MAX,
            ENEMY_BASE_SPEED_X, ENEMY_BASE_SPEED_Y_DROP, DIFFICULTY_LEVELS, SPRITE_DIMENSIONS,
            TEXT_COLOR_SCORE, TEXT_COLOR_GAMEOVER, TEXT_COLOR_WIN, TEXT_COLOR_LOADING, TEXT_COLOR_DEFAULT, FONT_DEFAULT,
            TEXT_COLOR_TITLE, FONT_TITLE, TEXT_START_INSTRUCTION // Added new config for start screen
        };

        this.assetManager = new AssetManager();
        this.currentDifficultyLevel = 0;
        this.currentEnemyTargetCount = this.config.DIFFICULTY_LEVELS[0].targetCount;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        
        this.score = 0;
        this.gameState = 'LOADING'; // LOADING, PLAYING, PAUSED, GAME_OVER, YOU_WIN
        this.keysPressed = {};
        this.lastTime = 0; // For deltaTime calculation

        this.backgroundMusic = null;
        this.shootSound = null;
        this.enemyHitSound = null; // Renamed from enemyDieSound
        this.playerExplosionSound = null; // Renamed from playerDieSound
        this.levelUpSound = null;
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    init() {
        // Setup keyboard listeners
        window.addEventListener('keydown', (e) => this.keysPressed[e.key] = true);
        window.addEventListener('keyup', (e) => this.keysPressed[e.key] = false);
        // Add click listener for starting the game
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));


        // Queue assets
        this.assetManager.queueDownloadImage('player', this.config.ASSET_PATHS.PLAYER);
        this.assetManager.queueDownloadImage('enemyOcto1', this.config.ASSET_PATHS.ENEMY_OCTO1);
        this.assetManager.queueDownloadImage('enemyOcto2', this.config.ASSET_PATHS.ENEMY_OCTO2); // If you have variations
        this.assetManager.queueDownloadImage('bullet', this.config.ASSET_PATHS.BULLET);
        if (this.config.ASSET_PATHS.BACKGROUND_IMAGE) {
            this.assetManager.queueDownloadImage('background', this.config.ASSET_PATHS.BACKGROUND_IMAGE);
        }

        this.assetManager.queueDownloadSound('shoot', this.config.ASSET_PATHS.SOUND_SHOOT);
        this.assetManager.queueDownloadSound('enemyHit', this.config.ASSET_PATHS.SOUND_ENEMY_HIT);
        this.assetManager.queueDownloadSound('playerExplosion', this.config.ASSET_PATHS.SOUND_PLAYER_EXPLOSION);
        this.assetManager.queueDownloadSound('levelUp', this.config.ASSET_PATHS.SOUND_LEVEL_UP);
        this.assetManager.queueDownloadSound('backgroundMusic', this.config.ASSET_PATHS.SOUND_BACKGROUND);
        
        this.assetManager.downloadAll(() => this.resetGame()); // Changed to resetGame for replayability
    }

    resetGame() { // New method to reset game state for starting or restarting
        this.score = 0;
        this.currentDifficultyLevel = 0;
        this.currentEnemyTargetCount = this.config.DIFFICULTY_LEVELS[0].targetCount;
        
        // Retrieve sounds
        this.shootSound = this.assetManager.getSound('shoot');
        this.enemyHitSound = this.assetManager.getSound('enemyHit');
        this.playerExplosionSound = this.assetManager.getSound('playerExplosion');
        this.levelUpSound = this.assetManager.getSound('levelUp');
        this.backgroundMusic = this.assetManager.getSound('backgroundMusic');

        // Create Player
        const playerX = (this.config.CANVAS_WIDTH / 2) - (this.config.SPRITE_DIMENSIONS.PLAYER_WIDTH / 2);
        const playerY = this.config.CANVAS_HEIGHT - this.config.SPRITE_DIMENSIONS.PLAYER_HEIGHT - 20; // Near bottom
        if (this.player) {
            this.player.x = playerX;
            this.player.y = playerY;
            this.player.visible = true;
            this.player.timeSinceLastShot = 0; // Reset cooldown
        } else {
            this.player = new Player(playerX, playerY, 'player', this.assetManager, this.config);
        }

        // Create/Reset Enemies
        this.enemies = [];
        this.spawnEnemiesForLevel();


        // Background music is NOT started here. It will start when transitioning from START_SCREEN to PLAYING.

        this.gameState = 'START_SCREEN'; // Initial state after loading
        
        // Ensure game loop starts if it hasn't (e.g., first time)
        if (!this.lastTime) { 
            this.lastTime = performance.now();
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
    }

    beginPlaying() {
        this.gameState = 'PLAYING';
        // Start background music
        if (this.backgroundMusic) {
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = 0.3;
            this.backgroundMusic.play().catch(e => console.warn("Background music play failed:", e));
        }
        // Reset keys to prevent immediate actions if a key was held
        this.keysPressed = {}; 
    }
    
    spawnEnemiesForLevel() {
        const levelConf = this.config.DIFFICULTY_LEVELS[this.currentDifficultyLevel];
        const enemiesToSpawn = levelConf.targetCount - this.enemies.length;

        for (let i = 0; i < enemiesToSpawn; i++) {
            const enemyX = Math.random() * (this.config.CANVAS_WIDTH - this.config.SPRITE_DIMENSIONS.ENEMY_WIDTH);
            const enemyY = Math.random() * this.config.ENEMY_SPAWN_Y_MAX + 30; // Random Y near top
            // Default to 'enemyOcto1' for initial frame, animation is handled in Enemy class
            const initialEnemyImageKey = 'enemyOcto1'; 
            
            this.enemies.push(new Enemy(
                enemyX, enemyY, initialEnemyImageKey, this.assetManager, this.config,
                levelConf.speedX, levelConf.speedYDrop
            ));
        }
        this.currentEnemyTargetCount = levelConf.targetCount;
    }


    gameLoop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp; // Ensure lastTime is set
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Handle input based on game state
        if (this.gameState === 'START_SCREEN') {
            this.handleStartScreenInput();
        } else if (this.gameState === 'PLAYING') {
            this.updateGamePlay(deltaTime);
        }
        
        this.draw();

        // Continue game loop unless explicitly stopped or in a final state that doesn't need updates
        if (this.gameState !== 'GAME_OVER' && this.gameState !== 'YOU_WIN') {
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        } else if (this.gameState === 'GAME_OVER' || this.gameState === 'YOU_WIN') {
             // Allow restarting after a delay or on input for GAME_OVER/YOU_WIN
             // For now, just stops continuous updates for these states.
             // To enable restart: check for Enter key here and call this.resetGame()
        }
    }

    handleStartScreenInput() {
        if (this.keysPressed['Enter']) {
            this.keysPressed['Enter'] = false; // Consume the key press
            this.beginPlaying();
        }
        // Click handling is done in handleCanvasClick
    }
    
    handleCanvasClick() {
        if (this.gameState === 'START_SCREEN') {
            this.beginPlaying();
        }
        // Potentially add restart logic for GAME_OVER/YOU_WIN here too
        // else if (this.gameState === 'GAME_OVER' || this.gameState === 'YOU_WIN') {
        //    this.resetGame(); // This would re-initialize to START_SCREEN
        // }
    }

    updateGamePlay(deltaTime) { // Renamed from update to be specific
        // Player input and shooting
        if (this.player.visible) { // Player can only act if visible
            this.player.handleInput(this.keysPressed);
            if (this.player.canShoot()) {
                const bulletX = this.player.x + this.player.width / 2 - (this.config.SPRITE_DIMENSIONS.BULLET_WIDTH / 2);
                const bulletY = this.player.y;
                this.bullets.push(new Bullet(bulletX, bulletY, 'bullet', this.assetManager, this.config));
                this.player.resetShoot(); // Resets timeSinceLastShot
                if (this.player) this.player.setActiveBullet(true); // Player has an active bullet
                if (this.shootSound) this.shootSound.play().catch(e => console.warn("Shoot sound play failed:", e));
            }
            this.player.update(deltaTime, this.config.CANVAS_WIDTH);
        }

        // Update enemies
        this.enemies.forEach(enemy => enemy.update(deltaTime, this.config.CANVAS_WIDTH));

        // Update bullets
        // Iterate backwards for safe removal
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime);
            if (bullet.y + bullet.height <= 0) { // Bullet is off-screen (top)
                this.bullets.splice(i, 1);
                if (this.player) this.player.setActiveBullet(false); // Player can shoot again
            }
        }

        // Collision detection
        this.handleCollisions();

        // Check game conditions
        this.checkGameStatus();
        
        // Difficulty progression
        this.checkDifficultyLevel();
    }

    handleCollisions() {
        // Bullet-Enemy collision
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.bullets[i] && this.enemies[j] && this.checkCollision(this.bullets[i], this.enemies[j])) {
                    this.bullets.splice(i, 1);
                    // this.enemies.splice(j, 1); // Instead of removing, reset the enemy
                    this.enemies[j].reset(); // Reset enemy to a new position
                    this.score += 1; // Score increments by 1
                    if (this.player) this.player.setActiveBullet(false); // Player can shoot again
                    this.bullets.splice(i, 1); // Remove the bullet that hit
                    if (this.enemyHitSound) this.enemyHitSound.play().catch(e => console.warn("Enemy hit sound play failed:", e));
                    break; // Bullet can only hit one enemy, and then it's removed
                }
            }
        }

        // Enemy-Player collision
        if (this.player.visible) {
            for (const enemy of this.enemies) {
                if (this.checkCollision(this.player, enemy)) {
                    this.gameOver();
                    return; // Exit after game over
                }
                // Check if enemy reached bottom (player's row)
                if (enemy.y + enemy.height >= this.config.CANVAS_HEIGHT - this.player.height) {
                     this.gameOver();
                     return; // Exit after game over
                }
            }
        }
    }

    checkGameStatus() {
        if (this.score >= this.config.WIN_SCORE && this.gameState === 'PLAYING') {
            this.gameState = 'YOU_WIN';
            if (this.backgroundMusic) this.backgroundMusic.stop ? this.backgroundMusic.stop() : this.backgroundMusic.pause();
            // Optionally play a victory sound
            // if (this.levelUpSound) this.levelUpSound.play(); // Or a dedicated win sound
        }
        // Game over by enemies reaching bottom is handled in handleCollisions
    }
    
    gameOver() {
        if (this.gameState === 'GAME_OVER') return; // Prevent multiple triggers

        this.gameState = 'GAME_OVER';
        this.player.visible = false;
        if (this.playerExplosionSound) this.playerExplosionSound.play().catch(e => console.warn("Player explosion sound play failed:", e));
        if (this.backgroundMusic) {
            if (this.backgroundMusic.stop) this.backgroundMusic.stop();
            else this.backgroundMusic.pause(); // For HTMLAudioElement
            this.backgroundMusic.currentTime = 0; // Reset music
        }
    }

    checkDifficultyLevel() {
        const nextLevelIndex = this.currentDifficultyLevel + 1;
        if (nextLevelIndex < this.config.DIFFICULTY_LEVELS.length) {
            const nextLevel = this.config.DIFFICULTY_LEVELS[nextLevelIndex];
            if (this.score >= nextLevel.scoreMilestone) {
                this.currentDifficultyLevel = nextLevelIndex;
                this.currentEnemyTargetCount = nextLevel.targetCount;
                if (this.levelUpSound) this.levelUpSound.play().catch(e => console.warn("Level up sound play failed:", e));
                
                // Update enemy speeds for existing and new enemies (or rely on new ones spawning with new speed)
                // For simplicity, new enemies will use the new speed from spawnEnemiesForLevel
                this.spawnEnemiesForLevel(); // Spawn more enemies if needed for the new level
            }
        }
         // If all enemies are cleared for the current level, and it's not a win yet, spawn more
        if (this.enemies.length === 0 && this.gameState === 'PLAYING' && this.score < this.config.WIN_SCORE) {
            this.spawnEnemiesForLevel();
        }
    }
    
    // startGame method is renamed/refactored into resetGame and parts of init.

    draw() {
        // Clear canvas or draw background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.config.CANVAS_WIDTH, this.config.CANVAS_HEIGHT);
        const bgImage = this.assetManager.getImage('background');
        if (bgImage) {
            this.ctx.drawImage(bgImage, 0, 0, this.config.CANVAS_WIDTH, this.config.CANVAS_HEIGHT);
        }

        if (this.gameState === 'LOADING') {
            this.drawMessage('Loading Assets...', this.config.TEXT_COLOR_LOADING);
            return;
        }

        if (this.gameState === 'START_SCREEN') {
            this.ctx.font = this.config.FONT_TITLE;
            this.drawMessage('SPACE ASSAULT', this.config.TEXT_COLOR_TITLE, this.config.FONT_TITLE.split(' ')[0]); // Get size from font string

            this.ctx.font = `24px ${this.config.FONT_DEFAULT}`; // Smaller font for instruction
            this.ctx.fillStyle = this.config.TEXT_COLOR_DEFAULT;
            this.ctx.fillText(this.config.TEXT_START_INSTRUCTION, this.config.CANVAS_WIDTH / 2, this.config.CANVAS_HEIGHT / 2 + 60);
            return; // Nothing else to draw on start screen
        }

        // Gameplay drawing (PLAYING, PAUSED, etc.)
        if (this.player && this.player.visible) {
             this.player.draw(this.ctx);
        }
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.bullets.forEach(bullet => bullet.draw(this.ctx));

        this.drawScore();

        if (this.gameState === 'GAME_OVER') {
            this.drawMessage('GAME OVER', this.config.TEXT_COLOR_GAMEOVER);
        } else if (this.gameState === 'YOU_WIN') {
            this.drawMessage('YOU WIN!', this.config.TEXT_COLOR_WIN);
        }
    }

    drawScore() {
        this.ctx.fillStyle = this.config.TEXT_COLOR_SCORE;
        this.ctx.font = `20px ${this.config.FONT_DEFAULT}`;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);

        this.ctx.fillStyle = this.config.TEXT_COLOR_DEFAULT; // For level text
        this.ctx.font = `20px ${this.config.FONT_DEFAULT}`; // Ensure font is reset if different
        this.ctx.fillText(`Level: ${this.currentDifficultyLevel}`, 10, 60);
    }

    drawMessage(message, color = this.config.TEXT_COLOR_DEFAULT, size = '50px') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${size} ${this.config.FONT_DEFAULT}`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message, this.config.CANVAS_WIDTH / 2, this.config.CANVAS_HEIGHT / 2);
    }
}

// Global instance of the game
let gameInstance;

window.onload = () => {
    gameInstance = new Game();
    gameInstance.init();
};

// Export if using modules
// export { Game };
