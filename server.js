console.log("MMORPG Server Booting (Final Character System Build)...");

const WebSocket = require("ws");

const config = require("./config");
const World = require("./world");
const PlayerManager = require("./playerManager");
const Packet = require("./packet");

const wss = new WebSocket.Server({ port: 3000 });

// ---------------- CONNECTION ----------------
wss.on("connection", (ws) => {
    const player = PlayerManager.createPlayer(ws);

    ws.isAlive = true;

    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg);
            PlayerManager.updateInput(player.id, data);
        } catch (e) {}
    });

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.on("close", () => {
        PlayerManager.removePlayer(player.id);
    });
});

// ---------------- GAME LOOP ----------------
setInterval(() => {
    World.tick();
}, config.TICK_RATE);

// ---------------- BROADCAST ----------------
setInterval(() => {
    const packet = Packet.createSync(
        PlayerManager.getSnapshot()
    );

    const players = PlayerManager.getPlayers();

    for (let id in players) {
        const p = players[id];

        if (p.ws.readyState === 1) {
            try {
                p.ws.send(packet);
            } catch (e) {}
        }
    }

}, config.BROADCAST_RATE);

// ---------------- HEARTBEAT ----------------
setInterval(() => {
    const players = PlayerManager.getPlayers();

    for (let id in players) {
        const p = players[id];

        if (!p.ws.isAlive) {
            p.ws.terminate();
            PlayerManager.removePlayer(id);
            continue;
        }

        p.ws.isAlive = false;

        try {
            p.ws.ping();
        } catch (e) {}
    }
}, 10000);

console.log("Final MMORPG Core Running on port 3000");
