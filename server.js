console.log("MMORPG Server starting...");

const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });

let players = {};

wss.on("connection", (ws) => {
    const id = Math.random().toString(36).substring(2);

    players[id] = {
        id,
        x: 100,
        y: 100,
        hp: 100,
        ws
    };

    ws.on("message", (msg) => {
        const data = JSON.parse(msg);

        if (data.type === "move") {
            players[id].x += data.x;
            players[id].y += data.y;
        }
    });

    ws.on("close", () => {
        delete players[id];
    });
});

setInterval(() => {
    const state = Object.values(players).map(p => ({
        id: p.id,
        x: p.x,
        y: p.y,
        hp: p.hp
    }));

    Object.values(players).forEach(p => {
        p.ws.send(JSON.stringify({
            type: "sync",
            players: state
        }));
    });
}, 50);

console.log("Server running on port 3000");
