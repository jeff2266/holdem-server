const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const socketApi = require('./socketApi')
const gameStateManager = require('./gameStateManager')
const playerManager = require('./playerManager')
const { setGameState } = require('./gameStateManager')

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
        if (password === 'covid2020') {
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

        newHand()

        if (gameStateManager.getGameState() === gameStateManager.gameStates.GAME_OVER) {
            io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
            playerManager.clearAllPlayers()
        }
    })

    client.on('c_action', (amount) => {
        const playerName = playerManager.getPlayers().find(x => x.id === client.id).name
        let nextState = gameStateManager.playerAction(playerName, amount)
        switch (nextState) {
            case -1:
                return
            case 0:
                io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
                return
            default:
                gameStateManager.setGameState(nextState)
                io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
                break
        }
        switch (gameStateManager.getGameState()) {
            case gameStateManager.gameStates.FLOP:
            case gameStateManager.gameStates.TURN:
            case gameStateManager.gameStates.RIVER:
                setTimeout(() => {
                    gameStateManager.setGameState(gameStateManager.gameStates.ACTION)
                    io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
                }, 4000)
                return
            case gameStateManager.gameStates.FLIP:
                setTimeout(() => {
                    distributePots()
                }, 7000)
                break
            case gameStateManager.gameStates.FIND_WINNERS:
                distributePots()
                break
            case gameStateManager.gameStates.GAME_OVER:
                io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
                playerManager.clearAllPlayers()
                break
        }
    })

    client.on('disconnect', () => {
        console.log(`${client.id} has disconnected...`)
        const dcPlayer = playerManager.getPlayers().find(x => x.id === client.id)
        if (dcPlayer !== undefined) {
            if (dcPlayer.name !== undefined) {
                if (gameStateManager.playerDisconnect(dcPlayer.name)) {
                    io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
                }
            }
        }

        let iDelete
        if ((iDelete = playerManager.deletePlayer(client.id)) !== undefined) {
            console.log(`${client.id}, ${iDelete} deleted from players...`)
            io.emit(socketApi.PLAYERS, playerManager.getPlayers().map(x => x.name))
            if (iDelete === 0) {
                const currentPlayers = playerManager.getPlayers()
                if (!currentPlayers[0]) return
                const clientNewFirstPlayer = currentPlayers[0]
                io.to(clientNewFirstPlayer.id).emit(socketApi.JOIN_SUCCESS, true, clientNewFirstPlayer.name)
                console.log(`${clientNewFirstPlayer.id}, ${clientNewFirstPlayer.name} is the new first player...`)
            }
        }
    })

})

function newHand() {
    setTimeout(() => {
        gameStateManager.setGameState(gameStateManager.gameStates.SHUFFLE_AND_BLINDS_SET)
        io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
        setTimeout(() => {
            gameStateManager.setGameState(gameStateManager.gameStates.DEAL)
            io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
            setTimeout(() => {
                gameStateManager.setGameState(gameStateManager.gameStates.PLACE_BLINDS)
                io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
                setTimeout(() => {
                    gameStateManager.setGameState(gameStateManager.gameStates.ACTION_PRE_FLOP)
                    io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
                }, 2800)
            }, 1500)
        }, 2800)
    }, 4000)
}

function distributePots() {
    gameStateManager.setGameState(gameStateManager.gameStates.FIND_WINNERS)
    let nextState = gameStateManager.setGameState(gameStateManager.gameStates.DIST_POTS)
    io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
    setTimeout(() => {
        if (nextState === gameStateManager.gameStates.FIND_WINNERS) distributePots()
        else if (nextState === gameStateManager.gameStates.SHUFFLE_AND_BLINDS_SET) newHand()
        else if (nextState === gameStateManager.gameStates.GAME_OVER) {
            setTimeout(() => {
                gameStateManager.setGameState(gameStateManager.gameStates.GAME_OVER)
                io.emit(socketApi.GUI_STATE, gameStateManager.getGuiState())
            })
        }
    }, 3000)
}

app.use(express.static(path.join(__dirname, '../public')))
server.listen(port, () => { console.log(`The server is running on port ${port}`) })