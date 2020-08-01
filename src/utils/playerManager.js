let players = []

function addPlayer(name) {
    if (players.length >= 8) return
    if (players.indexOf(name) > -1) return
    players.push(name)
    return (players.length - 1)
}

function deletePlayer(name) {

}

function getPlayers() {
    return players
}

module.exports = { addPlayer, deletePlayer, getPlayers }