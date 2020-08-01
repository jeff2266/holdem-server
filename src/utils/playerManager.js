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
    players.splice(iDelete)
    return true
}

function getPlayers(startAt = '') {
    let names = players.map(x => x.name)
    if (startAt) {
        const startAtIndex = names.indexOf(startAt)
        if (startAtIndex < 0) return
        return names.slice(startAtIndex, names.length).concat(names.slice(0, startAtIndex))
    }
    return players.map(x => x.name)
}

module.exports = { addPlayer, deletePlayer, getPlayers }