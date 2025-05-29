class Player extends GameObject {
    constructor(x, y, imageKey, assetManager, config) {
        // Assuming player asset is 64x64, adjust if necessary
        const PLAYER_WIDTH = 64;
        const PLAYER_HEIGHT = 64;
        super(x, y, PLAYER_WIDTH, PLAYER_HEIGHT, imageKey, assetManager);
        
        this.speed = config.PLAYER_SPEED;
        this.bulletCooldown = config.BULLET_COOLDOWN; // seconds
        this.timeSinceLastShot = 0; // seconds
        
        this.moveLeft = false;
        this.moveRight = false;
        this.wantsToShoot = false;
        this.visible = true; // Player is visible by default
        this.hasActiveBullet = false; // Player starts without an active bullet
    }

    draw(ctx) {
        if (!this.visible) {
            return;
        }
        // Call the parent's draw method
        super.draw(ctx);
    }

    handleInput(keysPressed) {
        this.moveLeft = keysPressed['ArrowLeft'] || keysPressed['a'];
        this.moveRight = keysPressed['ArrowRight'] || keysPressed['d'];
        this.wantsToShoot = keysPressed[' '] || keysPressed['ArrowUp']; // Space or UpArrow to shoot
    }

    update(deltaTime, canvasWidth) {
        // Update time since last shot
        this.timeSinceLastShot += deltaTime;

        // Movement
        if (this.moveLeft && this.x > 0) {
            this.x -= this.speed * deltaTime * 60; // Assuming 60 FPS for speed scaling
        }
        if (this.moveRight && this.x < canvasWidth - this.width) {
            this.x += this.speed * deltaTime * 60; // Assuming 60 FPS for speed scaling
        }

        // Boundary checks (redundant if handled above, but good for safety)
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > canvasWidth - this.width) {
            this.x = canvasWidth - this.width;
        }
    }

    canShoot() {
        return this.wantsToShoot && this.timeSinceLastShot >= this.bulletCooldown && !this.hasActiveBullet;
    }

    resetShoot() {
        // this.wantsToShoot = false; // Keep wantsToShoot true if key is held, game logic decides when to act
        this.timeSinceLastShot = 0;
        // Note: hasActiveBullet is managed by game.js
    }

    setActiveBullet(status) {
        this.hasActiveBullet = status;
    }
}

// Export if using modules
// export { Player };
