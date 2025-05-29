const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const ASSET_PATHS = {
    PLAYER: '../SpaceInvader/ship.png',
    ENEMY_OCTO1: '../SpaceInvader/octo1.png',
    ENEMY_OCTO2: '../SpaceInvader/octo2.png',
    BULLET: '../SpaceInvader/bullet.png',
    BACKGROUND_IMAGE: '../SpaceInvader/1876bg.jpg',
    SOUND_SHOOT: '../SpaceInvader/fire.wav',
    SOUND_ENEMY_HIT: '../SpaceInvader/die.wav', // Using die.wav for enemy hit
    SOUND_PLAYER_EXPLOSION: '../SpaceInvader/burst.wav', // Using burst.wav for player explosion
    SOUND_LEVEL_UP: '../SpaceInvader/bell.wav', // Using bell.wav for level up
    SOUND_BACKGROUND: '../SpaceInvader/bg.wav'
};

const PLAYER_SPEED = 5; // pixels per frame (scaled by deltaTime)
const BULLET_SPEED = 7; // pixels per frame (scaled by deltaTime)
const BULLET_COOLDOWN = 0.5; // seconds
const WIN_SCORE = 100;

const INITIAL_ENEMY_COUNT = 5; // Initial number of enemies
const ENEMY_SPAWN_Y_MAX = 50; // Max Y coordinate for initial enemy spawn (closer to top)
const ENEMY_BASE_SPEED_X = 1; // Initial horizontal speed of enemies
const ENEMY_BASE_SPEED_Y_DROP = 40; // Amount enemies drop when hitting canvas edge

const DIFFICULTY_LEVELS = [
    { scoreMilestone: 0, speedX: 1, targetCount: 5, speedYDrop: 40 }, // Level 0 (Initial)
    { scoreMilestone: 20, speedX: 1.5, targetCount: 7, speedYDrop: 45 }, // Level 1
    { scoreMilestone: 50, speedX: 2, targetCount: 10, speedYDrop: 50 },  // Level 2
    { scoreMilestone: 80, speedX: 2.5, targetCount: 12, speedYDrop: 55 }   // Level 3
];

// Sprite dimensions - confirm these match your actual assets
const SPRITE_DIMENSIONS = {
    PLAYER_WIDTH: 64,
    PLAYER_HEIGHT: 64,
    ENEMY_WIDTH: 48,
    ENEMY_HEIGHT: 48,
    BULLET_WIDTH: 16,
    BULLET_HEIGHT: 32
};

const TEXT_COLOR_SCORE = '#00FF00'; // Green
const TEXT_COLOR_GAMEOVER = '#FF0000'; // Red
const TEXT_COLOR_WIN = '#0000FF'; // Blue
const TEXT_COLOR_LOADING = '#FFFFFF'; // White
const TEXT_COLOR_DEFAULT = '#FFFFFF'; // White for other messages
const FONT_DEFAULT = 'Arial';

const TEXT_COLOR_TITLE = 'lightblue';
const FONT_TITLE = '48px Arial';
const TEXT_START_INSTRUCTION = 'Press ENTER to Start';


// Export if using modules, otherwise they are global
// export { CANVAS_WIDTH, CANVAS_HEIGHT, ASSET_PATHS, PLAYER_SPEED, BULLET_SPEED, BULLET_COOLDOWN, WIN_SCORE, INITIAL_ENEMY_COUNT, ENEMY_SPAWN_Y_MAX, ENEMY_BASE_SPEED_X, ENEMY_BASE_SPEED_Y_DROP, DIFFICULTY_LEVELS, SPRITE_DIMENSIONS, TEXT_COLOR_SCORE, TEXT_COLOR_GAMEOVER, TEXT_COLOR_WIN, TEXT_COLOR_LOADING, TEXT_COLOR_DEFAULT, FONT_DEFAULT, TEXT_COLOR_TITLE, FONT_TITLE, TEXT_START_INSTRUCTION };
