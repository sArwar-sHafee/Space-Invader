class Bullet extends GameObject {
    constructor(x, y, imageKey, assetManager, config) {
        // Assuming bullet asset is 16x32, adjust if necessary
        const BULLET_WIDTH = 16; 
        const BULLET_HEIGHT = 32;
        super(x, y, BULLET_WIDTH, BULLET_HEIGHT, imageKey, assetManager);
        
        this.speedY = -config.BULLET_SPEED; // Negative because bullets go up
        this.config = config;
    }

    update(deltaTime) {
        this.y += this.speedY * deltaTime * 60; // Assuming 60 FPS for speed scaling

        // Bullets are typically removed by the game manager when off-screen
        // or when they hit something.
    }
}

// Export if using modules
// export { Bullet };
