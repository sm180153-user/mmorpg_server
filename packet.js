const PacketTypes = {
    MOVE: "move",
    ATTACK: "attack",
    SYNC: "sync"
};

function createSync(players) {
    return JSON.stringify({
        type: PacketTypes.SYNC,
        players
    });
}

module.exports = {
    PacketTypes,
    createSync
};
