const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const playerManager = require('./utils/playerManager')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3001

function emitPlayersArray(connection) {
    connection.emit('s_players', playerManager.getPlayers())
}

function emitPlay() {
    io.emit('s_play', playerManager.getPlayers())
}

io.on('connection', (client) => {
    console.log(`Connection from ${client.id}...`)
    // Pass current players to client
    emitPlayersArray(client)

    client.on('c_join', ({ name, password }) => {

        console.log(`${name} trying to join with password, '${password}'...`)
        if (password === 'queensfulloftens') {
            const playerID = playerManager.addPlayer(name)
            console.log(playerID)
            if (playerID < 0) {
                client.emit('joinFailed')
                return
            }
            if (playerID === 0) client.emit('s_isFirst')
            emitPlayersArray(io)
            console.log('emitted players')
        }
    })

    client.on('c_play', () => {

    })

})

app.use(express.static(path.join(__dirname, '../public')))
server.listen(port, () => { console.log(`The server is running on port ${port}`) })