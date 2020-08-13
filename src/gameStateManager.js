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
    DEAL: {
        message: () => "Dealing",
        onEnter: () => {
            playerStates.filter(x => (x.name !== null)).forEach(x => x.pocket.push(deck.pop()))
            playerStates.filter(x => (x.name !== null)).forEach(x => x.pocket.push(deck.pop()))
        }
    },
    PLACE_BLINDS: {
        message: () => "Collecting blinds",
        onEnter: () => {
            const small = playerStates.find(x => x.blind.includes('S'))
            const big = playerStates.find(x => x.blind.includes('B'))
            pots.push(new Pot())
            if (small.balance > (minBet / 2)) {
                small.balance -= (minBet / 2)
                small.bet += (minBet / 2)
                pots[pots.length - 1].amount += (minBet / 2)
            } else {
                // SB all in after blind
                small.bet += small.balance
                pots[pots.length - 1] += (minBet / 2)
                small.balance = 0
                pots.push(new Pot())
            }
            if (big.balance > minBet) {
                big.balance -= minBet
                big.bet += minBet
                pots[pots.length - 1].amount += minBet
            } else {
                // BB all in after blind
                big.bet += big.balance
                pots[pots.length - 1].amount += big.balance
                big.balance = 0
                pots.push(new Pot())
            }
        }
    },
    ACTION_PRE_FLOP: {
        message: () => {
            const actionPlayer = playerStates.find(x => x.isTurn)
            if (actionPlayer) return `Action to ${actionPlayer.name}, \$${actionPlayer.toCall} to call`
            return null
        },
        onEnter: () => {
            let iAction = playerStates.findIndex(x => x.blind.includes('B'))
            if (iAction > -1) {
                do {
                    iAction = (iAction + 1) % playerStates.length
                } while (playerStates[iAction].name === null)
                resetTurn(iAction)
                firstAction = iAction
            }
        }
    },
    FLOP: {
        message: () => "Here is the flop",
        onEnter: () => {
            deck.pop()
            window.push(deck.pop())
            window.push(deck.pop())
            window.push(deck.pop())
        }
    },
    ACTION: {
        message: () => {
            const actionPlayer = playerStates.find(x => x.isTurn)
            if (actionPlayer) return `Action to ${actionPlayer.name}, \$${actionPlayer.toCall} to call`
            return null
        },
        onEnter: () => {
            debugger
            let iAction = playerStates.findIndex(x => x.blind.includes('D'))
            if (iAction > -1) {
                do {
                    iAction = (iAction + 1) % playerStates.length
                } while (playerStates[iAction].name === null)
                resetTurn(iAction)
                firstAction = iAction
            }
        }
    },
    TURN: {
        message: () => "Here is the turn",
        onEnter: () => {
            deck.pop()
            window.push(deck.pop())
        }
    },
    RIVER: {
        message: () => "Here is the river",
        onEnter: () => {
            deck.pop()
            window.push(deck.pop())
        }
    },
    FLIP: {},
    FIND_WINNERS: {},
    DIST_POTS: {},
    GAME_OVER: {}
}
let gameState = gameStates.WELCOME

function getIsPlay() { return isPlay }

function getGameState() { return gameState }

function PlayerState(name = null, balance = 0) {
    this.name = name
    this.balance = balance
    this.blind = []
    this.pocket = []
    this.cardsUp = false
    this.bet = 0
    this.isTurn = false
    this.toCall = 0
}

function Pot() {
    this.amount = 0
    this.claim = playerStates
        .filter(x => (x.name !== null && x.balance > 0 && x.pocket.length > 0))
        .map(x => x.name)
}

function setGameState(newGameState) {
    if (gameState === newGameState) return
    gameState = newGameState
    if (gameState.onEnter) gameState.onEnter()
}

function newGame(players) {
    gameState = gameStates.WELCOME

    startBalance = Math.ceil((1000 / players.length) / 100) * 100
    players.forEach(x => playerStates.push(new PlayerState(x, startBalance)))
    for (let i = playerStates.length; i < 8; i++) {
        playerStates.push(new PlayerState())
    }
    minBet = startBalance / 10

    isPlay = true
}

function updateBlinds() {
    let iBlinds
    if ((iBlinds = playerStates.filter(x => x !== null).findIndex(x => x.blind.includes('D'))) < 0) {
        let i = 0
        playerStates[i++].blind.push('D')
        while (playerStates[i].name === null) i = (i + 1) % playerStates.length
        playerStates[i].blind.push('S')
        i = (i + 1) % playerStates.length
        while (playerStates[i].name === null) i = (i + 1) % playerStates.length
        playerStates[i].blind.push('B')
    } else {
        playerStates.forEach(x => { if (x !== null) x.blind = [] })
        do {
            iBlinds = (iBlinds + 1) % playerStates.length
        } while (playerStates[iBlinds].name === null)
        playerStates[iBlinds].bets.push('D')
        do {
            iBlinds = (iBlinds + 1) % playerStates.length
        } while (playerStates[iBlinds].name === null)
        playerStates[iBlinds].bets.push('S')
        do {
            iBlinds = (iBlinds + 1) % playerStates.length
        } while (playerStates[iBlinds].name === null)
        playerStates[iBlinds].bets.push('B')
    }
}

function resetTurn(iNextPlayer = null) {
    playerStates.forEach(x => x.isTurn = false)
    if (iNextPlayer !== null) {
        playerStates[iNextPlayer].isTurn = true
        playerStates[iNextPlayer].toCall =
            Math.max(...playerStates.filter(x => x.name !== null).map(x => x.bet)) - playerStates[iNextPlayer].bet
    }
}

function playerAction(name, amount) {
    let iPlayer = playerStates.findIndex(x => x.name === name)
    if (!(gameState === gameStates.ACTION_PRE_FLOP || gameState === gameStates.ACTION) ||
        iPlayer < 0 ||
        !playerStates[iPlayer].isTurn)
        return -1
    const player = playerStates[iPlayer]
    // Fold
    if (amount < 0) player.pocket = []
    // Check
    else if (amount === 0) { }
    else if (amount < player.toCall) {
        // All in
        if (amount === player.balance) {
            player.balance === 0
            player.bet += amount
            pots[pots.length - 1].amount += amount
            pots.push(new Pot())
        }
        else return -1
    }
    // Call or Raise
    else {
        player.balance -= amount
        player.bet += amount
        pots[pots.length - 1].amount += amount
        if (amount > player.toCall) {
            firstAction = iPlayer
        }
    }
    console.log(playerStates.map((x) => { return { name: x.name, balance: x.balance } }), playerStates[firstAction].name)
    do {
        iPlayer = (iPlayer + 1) % playerStates.length
    } while (playerStates[iPlayer].name === null || playerStates[iPlayer].pocket.length < 2)
    if (iPlayer === firstAction) {
        switch (gameState) {
            case gameStates.ACTION_PRE_FLOP:
                return gameStates.FLOP
            case gameStates.ACTION:
                switch (window.length) {
                    case 3:
                        return gameStates.TURN
                    case 4:
                        return gameStates.RIVER
                    case 5:
                        return gameStates.FLIP
                    default:
                        return -1
                }
            default:
                return -1
        }
    }
    resetTurn(iPlayer)
    return 0
}

function playerDisconnect(name) {
    const iDCPlayer = playerStates.findIndex(x => x.name === name)
    if (iDCPlayer < 0) return false
    if (iDCPlayer === firstAction) {
        do {
            firstAction = (firstAction + 1) % playerStates.length
        } while (playerStates[firstAction].name === null || playerStates[firstAction].pocket.length < 2)
    }
    if (playerStates[iDCPlayer].isTurn) {
        let j = iDCPlayer
        do {
            j = (j + 1) % playerStates.length
        } while (playerStates[j].name === null || playerStates[j].pocket.length < 2)
        resetTurn(j)
    }
    playerStates[iDCPlayer].pocket = []
    playerStates[iDCPlayer].name = null
    return true
}

function getGuiState() {
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
    playerAction,
    playerDisconnect,
    getGuiState
}