const newDeck = require('./utils/shuffler')

const gameStates = {
    WELCOME: {
        message: () => "Welcome to Texas Hold'em!"
    },
    SHUFFLE_AND_BLINDS_SET: {
        message: () => "Shuffling and setting blinds",
        onEnter: () => {
            updateBlinds()
            deck = newDeck()
            console.log(deck)
        }
    },
    PLACE_BLINDS: {
        message: () => "Collecting blinds",
        onEnter: () => {
            const big = playerStates.find(x => x.blind.includes('B'))
            const small = playerStates.find(x => x.blind.includes('S'))
            if (big.balance > minBet) {
                big.balance -= minBet
                pots[pots.length] += minBet
            } else {

            }
            if (small.balance > (minBet / 2)) {
                small.balance -= (minBet / 2)
                pots[pots.length] += (minBet / 2)
            } else {

            }

        }
    },
    DEAL: {
        onEnter: () => {
            playerStates.filter((x) => { return (x) }).forEach(x => x.pocket.push(deck.pop()))
            playerStates.filter((x) => { return (x) }).forEach(x => x.pocket.push(deck.pop()))
        }
    },
    ACTION_PRE_FLOP: {
        message: () => {
            const actionPlayer = playerStates.find(x => x.isTurn)
            if (actionPlayer) return `Action ${actionPlayer.name}`
            return null
        },
        onEnter: () => {
            const big = playerStates.findIndex(x => x.blind.includes('B'))
            if (big > -1) {
                const iAction = (big + 1) % playerStates.length
                playerStates[iAction].isTurn = true
            }
        }
    },
    FLOP: {},
    ACTION: {},
    TURN: {},
    RIVER: {},
    FLIP: {},
    FIND_WINNERS: {},
    DIST_POTS: {},
    GAME_OVER: {}
}

let isPlay = false
let gameState = gameStates.WELCOME
let window = []
let minBet = null
let playerStates = []

let deck
let pots = []

function getIsPlay() { return isPlay }

function PlayerState(name, balance) {
    this.name = name
    this.balance = balance
    this.blind = []
    this.pocket = []
    this.cardsUp = false
    this.bet = null
    this.isTurn = false
    this.toCall = null
}

function Pot(claim) {
    this.amount = 0
    this.claim = [...claim]
}

function getGameState() {
    return gameState
}

function setGameState(newGameState) {
    if (gameState === newGameState) return
    gameState = newGameState
    if (gameState.onEnter) gameState.onEnter()
    console.log(gameState)
}

function newGame(players) {
    gameState = gameStates.WELCOME
    window = []
    minBet = null

    let startBalance = Math.ceil((1000 / players.length) / 100) * 100
    players.forEach(x => playerStates.push(new PlayerState(x, startBalance)))

    minBet = startBalance / 10

    isPlay = true
}

function updateBlinds() {
    if (!playerStates.find(x => x.blind.includes('D'))) {
        let i = 0
        playerStates[i++].blind.push('D')
        playerStates[i++].blind.push('B')
        playerStates[i++ % playerStates.length].blind.push('S')
    } else {

    }
}

function getGuiState(forPlayer = '') {
    return {
        message: (gameState.message) ? gameState.message() : null,
        window,
        minBet,
        playerStates
    }
}

module.exports = {
    gameStates,
    getIsPlay,
    getGameState,
    setGameState,
    newGame,
    getGuiState
}