class Enemy extends GameObject {
    constructor(x, y, initialImageKey, assetManager, config, speedX, speedYDrop) {
        // Use SPRITE_DIMENSIONS from config
        super(x, y, config.SPRITE_DIMENSIONS.ENEMY_WIDTH, config.SPRITE_DIMENSIONS.ENEMY_HEIGHT, initialImageKey, assetManager);
        
        this.speedX = speedX;
        this.speedYDrop = speedYDrop; // This is the amount to drop when hitting the edge
        this.config = config; 
        
        this.imageKeys = ['enemyOcto1', 'enemyOcto2']; // Animation frames
        this.currentFrameIndex = this.imageKeys.indexOf(initialImageKey) !== -1 ? this.imageKeys.indexOf(initialImageKey) : 0;
        this.imageKey = this.imageKeys[this.currentFrameIndex]; // Set current imageKey
        this.image = this.assetManager.getImage(this.imageKey); // Explicitly set initial image

        this.animationTimer = 0;
        this.animationInterval = 0.5; // seconds

        this.initialX = x; // Store initial X for respawn
        this.initialY = y; // Store initial Y for respawn
    }

    update(deltaTime, canvasWidth) {
        // Animation
        this.animationTimer += deltaTime;
        if (this.animationTimer >= this.animationInterval) {
            this.animationTimer = 0;
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.imageKeys.length;
            this.imageKey = this.imageKeys[this.currentFrameIndex];
            this.image = this.assetManager.getImage(this.imageKey);
        }

        this.x += this.speedX * deltaTime * 60; // Assuming 60 FPS for speed scaling

        // Check for collision with canvas edges
        if (this.x + this.width >= canvasWidth || this.x <= 0) {
            this.speedX *= -1; // Reverse direction
            this.y += this.speedYDrop; // Move down
            // Ensure enemy does not go out of bounds after direction change
            if (this.x <= 0) this.x = 0;
            if (this.x + this.width >= canvasWidth) this.x = canvasWidth - this.width;
        }
    }

    reset() {
        // Reset to a new random position at the top, or its initial position
        this.y = Math.random() * this.config.ENEMY_SPAWN_Y_MAX;
        this.x = Math.random() * (this.config.CANVAS_WIDTH - this.width);
        // Or, to reset to its very initial spawn point and image:
        // this.x = this.initialX;
        // this.y = this.initialY;
        // Reset animation frame to default if needed
        // this.currentFrameIndex = 0; 
        // this.imageKey = this.imageKeys[this.currentFrameIndex];
        // this.image = this.assetManager.getImage(this.imageKey);
        this.animationTimer = 0; // Reset animation timer on enemy reset
    }
}

// Export if using modules
// export { Enemy };
