class GameObject {
    constructor(x, y, width, height, imageKey, assetManager) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.imageKey = imageKey; // Store the key
        this.assetManager = assetManager; // Store the assetManager instance
        this.image = this.assetManager.getImage(this.imageKey); // Get the image
    }

    draw(ctx) {
        if (this.image) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback or error logging if image isn't loaded
            // console.warn(`Image not found for key: ${this.imageKey}. Drawing placeholder.`);
            // ctx.fillStyle = 'red';
            // ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update(deltaTime) {
        // Basic placeholder - specific game objects will override this
    }
}

// Export if using modules
// export { GameObject };
