const newDeck = require('./utils/shuffler')

let isPlay = false
let startBalance
let window = []
let minBet
let playerStates = []
let firstAction
let deck
let pots = []

const gameStates = {
    WELCOME: {
        message: () => "Welcome to Texas Hold'em!"
    },
    SHUFFLE_AND_BLINDS_SET: {
        message: () => "Shuffling and setting blinds",
        onEnter: () => {
            updateBlinds()
            resetTurn()
            window = []
            playerStates.forEach(x => {
                x.pocket = []
                x.bet = 0
                x.isTurn = false
                x.toCall = 0
            })
            deck = newDeck()
            pots = []
        }
    },
    PLACE_BLINDS: {
        message: () => "Collecting blinds",
        onEnter: () => {
            const big = playerStates.find(x => x.blind.includes('B'))
            const small = playerStates.find(x => x.blind.includes('S'))
            pots.push(new Pot([0, 1, 2, 3, 4, 5, 6, 7]))
            if (big.balance > minBet) {
                big.balance -= minBet
                big.bet += minBet
                pots[0].amount += minBet
            } else {
                // BB all in after blind


            }
            if (small.balance > (minBet / 2)) {
                small.balance -= (minBet / 2)
                small.bet += (minBet / 2)
                pots[pots.length - 1] += (minBet / 2)
            } else {
                // SB all in after blind

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
                resetTurn(iAction)
                firstAction = iAction
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
let gameState = gameStates.WELCOME

function getIsPlay() { return isPlay }

function PlayerState(name, balance) {
    this.name = name
    this.balance = balance
    this.blind = []
    this.pocket = []
    this.cardsUp = false
    this.bet = 0
    this.isTurn = false
    this.toCall = 0
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

    startBalance = Math.ceil((1000 / players.length) / 100) * 100
    players.forEach(x => playerStates.push(new PlayerState(x, startBalance)))
    playerStates.fill(null, players.length, 8)

    minBet = startBalance / 10

    isPlay = true
}

function updateBlinds() {
    let iBlinds
    if ((iBlinds = playerStates.findIndex(x => x.blind.includes('D'))) < 0) {
        let i = 0
        playerStates[i++].blind.push('D')
        while (playerStates[i] === null) i = (i + 1) % playerStates.length
        playerStates[i].blind.push('S')
        i = (i + 1) % playerStates.length
        while (playerStates[i] === null) i = (i + 1) % playerStates.length
        playerStates[i].blind.push('B')
    } else {
        playerStates.forEach(x => { if (x !== null) x.blind = [] })
        do {
            iBlinds = (iBlinds + 1) % playerStates.length
        } while (playerStates[iBlinds] === null)
        playerStates[iBlinds].bets.push('D')
        do {
            iBlinds = (iBlinds + 1) % playerStates.length
        } while (playerStates[iBlinds] === null)
        playerStates[iBlinds].bets.push('S')
        do {
            iBlinds = (iBlinds + 1) % playerStates.length
        } while (playerStates[iBlinds] === null)
        playerStates[iBlinds].bets.push('B')
    }
}

function resetTurn(iNextPlayer = null) {
    playerStates.forEach(x => x.isTurn = false)
    if (iNextPlayer !== null) {
        playerStates[iNextPlayer].isTurn = true
        playerStates[iNextPlayer].toCall =
            Math.max(...playerStates.filter(x => x !== null).map(x => x.bet)) - playerStates[iNextPlayer].bet
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