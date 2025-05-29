class AssetManager {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.queuedAssets = [];
        this.successCount = 0;
        this.errorCount = 0;
    }

    queueDownloadImage(key, path) {
        this.queuedAssets.push({ key, path, type: 'image' });
    }

    queueDownloadSound(key, path) {
        this.queuedAssets.push({ key, path, type: 'sound' });
    }

    downloadAll(callback) {
        if (this.queuedAssets.length === 0) {
            callback();
            return;
        }

        let assetsLoaded = 0;
        const totalAssets = this.queuedAssets.length;

        this.queuedAssets.forEach(asset => {
            if (asset.type === 'image') {
                const img = new Image();
                img.src = asset.path;
                img.onload = () => {
                    this.images[asset.key] = img;
                    this.successCount++;
                    assetsLoaded++;
                    if (assetsLoaded === totalAssets) {
                        callback();
                    }
                };
                img.onerror = () => {
                    this.errorCount++;
                    console.error(`Error loading image ${asset.key} at ${asset.path}`);
                    assetsLoaded++;
                    if (assetsLoaded === totalAssets) {
                        callback();
                    }
                };
            } else if (asset.type === 'sound') {
                const audio = new Audio();
                audio.src = asset.path;
                audio.oncanplaythrough = () => {
                    this.sounds[asset.key] = audio;
                    this.successCount++;
                    assetsLoaded++;
                    if (assetsLoaded === totalAssets) {
                        callback();
                    }
                };
                audio.onerror = () => {
                    this.errorCount++;
                    console.error(`Error loading sound ${asset.key} at ${asset.path}`);
                    assetsLoaded++;
                    if (assetsLoaded === totalAssets) {
                        callback();
                    }
                };
            }
        });
    }

    getImage(key) {
        return this.images[key];
    }

    getSound(key) {
        return this.sounds[key];
    }
}

// Export if using modules
// export { AssetManager };
