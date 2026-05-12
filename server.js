console.log("MMORPG Server Booting (Final Stable Core)...");

const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });

let players = {};
let nextId = 1;

const TICK_RATE = 50;

// -------------------------
// CONNECTION
// -------------------------
wss.on("connection", (ws) => {
    const id = nextId++;

    players[id] = {
        id,
        x: 100,
        y: 100,
        hp: 100,
        input: {},
        lastSeen: Date.now(),
        ws,
        alive: true
    };

    ws.isAlive = true;

    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg);

            if (players[id]) {
                players[id].input = data;
                players[id].lastSeen = Date.now();
            }
        } catch (e) {
            // ignore corrupted packets
        }
    });

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.on("close", () => {
        delete players[id];
    });
});

// -------------------------
// GAME LOOP (WORLD SIMULATION)
// -------------------------
setInterval(() => {
    const now = Date.now();

    for (let id in players) {
        const p = players[id];
        const input = p.input || {};

        const speed = 2;

        if (input.up) p.y -= speed;
        if (input.down) p.y += speed;
        if (input.left) p.x -= speed;
        if (input.right) p.x += speed;

        // world bounds
        p.x = Math.max(0, Math.min(2000, p.x));
        p.y = Math.max(0, Math.min(2000, p.y));

        // timeout cleanup
        if (now - p.lastSeen > 30000) {
            delete players[id];
        }
    }

}, TICK_RATE);

// -------------------------
// BROADCAST SYSTEM (SYNC)
// -------------------------
setInterval(() => {
    const snapshot = [];

    for (let id in players) {
        const p = players[id];
        snapshot.push({
            id: p.id,
            x: Math.floor(p.x),
            y: Math.floor(p.y),
            hp: p.hp
        });
    }

    const packet = JSON.stringify({
        type: "sync",
        players: snapshot
    });

    for (let id in players) {
        const p = players[id];

        if (p.ws.readyState === 1) {
            try {
                p.ws.send(packet);
            } catch (e) {}
        }
    }

}, TICK_RATE);

// -------------------------
// HEARTBEAT (ANTI-DESYNC)
// -------------------------
setInterval(() => {
    for (let id in players) {
        const p = players[id];

        if (!p.ws.isAlive) {
            try {
                p.ws.terminate();
            } catch (e) {}
            delete players[id];
            continue;
        }

        p.ws.isAlive = false;

        try {
            p.ws.ping();
        } catch (e) {}
    }
}, 10000);

console.log("Final MMORPG Core Running on port 3000");
