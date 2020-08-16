let players = []

function addPlayer(name, id) {
    if (players.length >= 8) return -1
    if (players.map(x => x.name).indexOf(name) > -1) return -2
    players.push({ name, id })
    return (players.length - 1)
}

function deletePlayer(id) {
    const iDelete = players.map(x => x.id).indexOf(id)
    if (iDelete < 0) return
    players.splice(iDelete, 1)
    return iDelete
}

function clearAllPlayers() {
    players = []
}

function getPlayers() {
    return players
}

module.exports = { addPlayer, deletePlayer, clearAllPlayers, getPlayers }