const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const socketApi = require('./socketApi')
const gameStateManager = require('./gameStateManager')
const playerManager = require('./playerManager')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3001

io.on('connection', (client) => {
    console.log(`Connection from ${client.id}...`)
    // Pass current players to client
    client.emit(socketApi.PLAYERS, playerManager.getPlayers().map(x => x.name))

    client.on('c_join', ({ name, password }) => {

        console.log(`${name} trying to join with password, '${password}'...`)
        if (password === '123') {
            const playerID = playerManager.addPlayer(name, client.id)
            if (playerID < 0 || gameStateManager.getIsPlay()) {
                client.emit(socketApi.JOIN_FAILED)
                return
            }
            console.log(`Player ${playerID}: ${name} has joined...`)
            if (playerID === 0) {

                // Tell client he is first player
                client.emit(socketApi.JOIN_SUCCESS, true, name)
            } else client.emit(socketApi.JOIN_SUCCESS, false, name)
            io.emit(socketApi.PLAYERS, playerManager.getPlayers().map(x => x.name))
        }
    })

    client.on('c_play', () => {
        if (gameStateManager.getIsPlay()) {
            client.emit(socketApi.ERROR, { message: 'Trying to start play when game is already in play...' })
            return
        }
        // TODO implement loading? (io.emit(socketApi.LOADING))
        gameStateManager.newGame(playerManager.getPlayers().map(x => x.name))
        io.emit(socketApi.PLAY)

        io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())

        setTimeout(() => {
            gameStateManager.setGameState(gameStateManager.gameStates.SHUFFLE_AND_BLINDS_SET)
            io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
            setTimeout(() => {
                gameStateManager.setGameState(gameStateManager.gameStates.PLACE_BLINDS)
                io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
                setTimeout(() => {
                    gameStateManager.setGameState(gameStateManager.gameStates.DEAL)
                    io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
                    setTimeout(() => {
                        gameStateManager.setGameState(gameStateManager.gameStates.ACTION_PRE_FLOP)
                        io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
                    }, 1500)
                }, 2800)
            }, 2800)
        }, 4000)


    })

    client.on('disconnect', () => {
        console.log(`${client.id} has disconnected...`)
        let iDelete
        if ((iDelete = playerManager.deletePlayer(client.id)) !== undefined) {
            console.log(`${client.id}, ${iDelete} deleted from players...`)
            io.emit(socketApi.PLAYERS, playerManager.getPlayers().map(x => x.name))
            if (iDelete === 0) {
                const currentPlayers = playerManager.getPlayers()
                if (currentPlayers[0]) return
                const clientNewFirstPlayer = currentPlayers[0]
                io.to(clientNewFirstPlayer.id).emit(socketApi.JOIN_SUCCESS, true, clientNewFirstPlayer.name)
                console.log(`${clientNewFirstPlayer.id}, ${clientNewFirstPlayer.name} is the new first player...`)
            }
        }
    })

})

app.use(express.static(path.join(__dirname, '../public')))
server.listen(port, () => { console.log(`The server is running on port ${port}`) })