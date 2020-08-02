const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const socketApi = require('./utils/socketApi')
const playerManager = require('./utils/playerManager')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3001

io.on('connection', (client) => {
    console.log(`Connection from ${client.id}...`)
    // Pass current players to client
    client.emit(socketApi.PLAYERS, playerManager.getPlayers())

    client.on('c_join', ({ name, password }) => {

        console.log(`${name} trying to join with password, '${password}'...`)
        if (password === 'queensfulloftens') {
            const playerID = playerManager.addPlayer(name, client.id)
            if (playerID < 0) {
                client.emit(socketApi.JOIN_FAILED)
                return
            }
            console.log(`Player ${playerID}: ${name} has joined...`)
            if (playerID === 0) {
                console.log(socketApi.JOIN_SUCCESS)

                // Tell client he is first player
                client.emit(socketApi.JOIN_SUCCESS, true)
            }
            // Otherwise, just tell client he joined successfully
            else client.emit(socketApi.JOIN_SUCCESS)
            io.emit(socketApi.PLAYERS, playerManager.getPlayers())
        }
    })

    client.on('c_play', () => {
        // TODO implement loading? (io.emit(socketApi.LOADING))

        io.emit(socketApi.PLAY)
    })

    client.on('disconnect', () => {
        console.log(`${client.id} has disconnected...`)
        if (playerManager.deletePlayer(client.id)) {
            console.log(`${client.id} deleted from players...`)
            io.emit(socketApi.PLAYERS, playerManager.getPlayers())
        }
    })

})

app.use(express.static(path.join(__dirname, '../public')))
server.listen(port, () => { console.log(`The server is running on port ${port}`) })