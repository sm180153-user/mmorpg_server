let players = {};
let nextId = 1;

function createPlayer(ws) {
    const id = nextId++;

    players[id] = {
        id,

        // position
        x: 100,
        y: 100,
        hp: 100,
        energy: 50,

        // character system (NO class system)
        name: "Player",
        appearance: {
            hair: 1,
            face: 1,
            skinColor: "#f2c49a",
            outfit: 1
        },

        // networking
        input: {},
        ws,
        lastSeen: Date.now()
    };

    return players[id];
}

function removePlayer(id) {
    delete players[id];
}

function updateInput(id, data) {
    if (!players[id]) return;
    players[id].input = data;
    players[id].lastSeen = Date.now();
}

function getPlayers() {
    return players;
}

function getSnapshot() {
    return Object.values(players).map(p => ({
        id: p.id,
        x: p.x,
        y: p.y,
        hp: p.hp,
        name: p.name,
        appearance: p.appearance
    }));
}

module.exports = {
    createPlayer,
    removePlayer,
    updateInput,
    getPlayers,
    getSnapshot
};
