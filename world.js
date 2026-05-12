const config = require("./config");
const PlayerManager = require("./playerManager");

function tick() {
    const players = PlayerManager.getPlayers();

    for (let id in players) {
        const p = players[id];
        const input = p.input || {};

        if (input.up) p.y -= config.PLAYER_SPEED;
        if (input.down) p.y += config.PLAYER_SPEED;
        if (input.left) p.x -= config.PLAYER_SPEED;
        if (input.right) p.x += config.PLAYER_SPEED;

        // world boundaries
        p.x = Math.max(0, Math.min(config.WORLD_SIZE, p.x));
        p.y = Math.max(0, Math.min(config.WORLD_SIZE, p.y));

        // AFK cleanup
        if (Date.now() - p.lastSeen > config.AFK_TIMEOUT) {
            delete players[id];
        }
    }
}

module.exports = { tick };
