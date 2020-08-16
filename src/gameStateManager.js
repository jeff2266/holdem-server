const newDeck = require('./utils/shuffler')
const bestHand = require('./utils/bestHand')
const findWinner = require('./utils/findWinner')

let isPlay = false
let startBalance
let numPlayersOut = 0
let currPot = 0
let winner = null

let window = []
let minBet
let playerStates = []
let firstAction
let deck
let pots = []
let winners = []

const gameStates = {
    WELCOME: {
        message: () => "Welcome to Texas Hold'em!"
    },
    SHUFFLE_AND_BLINDS_SET: {
        message: () => "Shuffling and setting blinds",
        onEnter: () => {
            let deadPlayers = playerStates.filter(x => x.name !== null && x.balance === 0)
            if (deadPlayers.length > 0) console.log(deadPlayers.map(x => x.name).join(', ') + ' out')
            numPlayersOut += deadPlayers.length
            deadPlayers.forEach(x => {
                x.name = null
            })
            updateBlinds()
            resetTurn()
            window = []
            minBet = (startBalance / 10) * (numPlayersOut + 1)
            playerStates.forEach(x => {
                x.pocket = []
                x.cardsUp = false
                x.bet = 0
                x.isTurn = false
                x.toCall = 0
                x.bestHand = {
                    cards: [],
                    hand: null
                }
            })
            deck = newDeck()
            pots = []
            winners = []

            return gameStates.DEAL
        }
    },
    DEAL: {
        message: () => "Dealing",
        onEnter: () => {
            playerStates.filter(x => (x.name !== null)).forEach(x => x.pocket.push(deck.pop()))
            playerStates.filter(x => (x.name !== null)).forEach(x => x.pocket.push(deck.pop()))

            return gameStates.PLACE_BLINDS
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

            return gameStates.ACTION_PRE_FLOP
        }
    },
    ACTION_PRE_FLOP: {
        message: () => {
            const actionPlayer = playerStates.find(x => x.isTurn)
            if (actionPlayer) {
                if (actionPlayer.toCall === 0) return `Action to ${actionPlayer.name}, check or raise`
                return `Action to ${actionPlayer.name}, \$${actionPlayer.toCall} to call`
            }
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

            return gameStates.FLOP
        }
    },
    FLOP: {
        message: () => "Here is the flop",
        onEnter: () => {
            deck.pop()
            window.push(deck.pop())
            window.push(deck.pop())
            window.push(deck.pop())

            return gameStates.ACTION
        }
    },
    ACTION: {
        message: () => {
            const actionPlayer = playerStates.find(x => x.isTurn)
            if (actionPlayer) {
                if (actionPlayer.toCall === 0) return `Action to ${actionPlayer.name}, check or raise`
                return `Action to ${actionPlayer.name}, \$${actionPlayer.toCall} to call`
            }
            return null
        },
        onEnter: () => {
            let iAction = playerStates.findIndex(x => x.blind.includes('D'))
            if (iAction > -1) {
                do {
                    iAction = (iAction + 1) % playerStates.length
                } while (playerStates[iAction].name === null || playerStates[iAction].pocket.length < 2)
                resetTurn(iAction)
                firstAction = iAction
            }

            switch (window.length) {
                case 3: return gameStates.TURN
                case 4: return gameStates.RIVER
                case 5: return gameStates.FLIP
                default: return
            }
        }
    },
    TURN: {
        message: () => "Here is the turn",
        onEnter: () => {
            deck.pop()
            window.push(deck.pop())
            return gameStates.ACTION
        }
    },
    RIVER: {
        message: () => "Here is the river",
        onEnter: () => {
            deck.pop()
            window.push(deck.pop())
            return gameStates.ACTION
        }
    },
    FLIP: {
        message: () => "Players reveal cards",
        onEnter: () => {
            playerStates.forEach((x) => {
                if (x.name !== null && x.pocket.length > 0) {
                    x.cardsUp = true
                }
            })
            pots = pots.filter(x => x.amount !== 0)
            return gameStates.FIND_WINNERS
        }
    },
    FIND_WINNERS: {
        message: () => "...",
        onEnter: () => {
            const playersLeft = playerStates.filter(x => x.name !== null && x.pocket.length > 0)
            if (playersLeft.length === 1) {
                winners = [playersLeft[0].name]
                return gameStates.DIST_POTS
            }
            playersLeft.forEach(x => x.bestHand = bestHand(x.pocket, window))
            winners = findWinner(playersLeft.map((x) => {
                return {
                    cards: x.bestHand.cards,
                    hand: x.bestHand.hand,
                    id: x.name
                }
            }))
            return gameStates.DIST_POTS
        }
    },
    DIST_POTS: {
        message: () => {
            return (winners.length > 1) ?
                winners.join(', ') + ` split \$${currPot}`
                : winners[0] + ` wins \$${currPot}`
        },
        onEnter: () => {
            if (pots.length > 1) {
                winners.filter(x => pots[0].claim.includes(x)).map(x => playerStates.find(y => y.name === x)).forEach(wState => {
                    wState.balance += Math.floor(pots[0].amount / winners.length)
                })
                currPot = pots.shift().amount
                return gameStates.FIND_WINNERS
            } else if (pots.length === 1) {
                winners.filter(x => pots[0].claim.includes(x)).map(x => playerStates.find(y => y.name === x)).forEach(wState => {
                    wState.balance += Math.floor(pots[0].amount / winners.length)
                })
                currPot = pots.shift().amount
                if (playerStates.filter(x => x.name !== null && x.balance > 0).length == 1) {
                    winner = playerStates.find(x => x.name !== null && x.balance > 0).name
                    return gameStates.GAME_OVER
                }
                return gameStates.SHUFFLE_AND_BLINDS_SET
            }
        }
    },
    GAME_OVER: {
        message: () => {
            return winner + ' wins!'
        },
        onEnter: () => { isPlay = false }
    }
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
    this.bestHand = {
        cards: [],
        hand: null
    }
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
    if (!gameState.onEnter) return
    return gameState.onEnter()
}

function newGame(players) {
    playerStates = []
    numPlayersOut = 0
    currPot = 0
    winner = null
    window = []
    gameState = gameStates.WELCOME

    numStartingPlayers = players.length
    startBalance = Math.ceil((1000 / players.length) / 100) * 100
    players.forEach(x => playerStates.push(new PlayerState(x, startBalance)))
    for (let i = playerStates.length; i < 8; i++) {
        playerStates.push(new PlayerState())
    }

    isPlay = true
}

function updateBlinds() {
    let iBlinds
    if ((iBlinds = playerStates.findIndex(x => x.blind.includes('D'))) < 0) {
        let i = 0
        playerStates[i++].blind.push('D')
        while (playerStates[i].name === null) i = (i + 1) % playerStates.length
        playerStates[i].blind.push('S')
        i = (i + 1) % playerStates.length
        while (playerStates[i].name === null) i = (i + 1) % playerStates.length
        playerStates[i].blind.push('B')
    } else {
        playerStates.forEach(x => x.blind = [])
        do {
            iBlinds = (iBlinds + 1) % playerStates.length
        } while (playerStates[iBlinds].name === null)
        playerStates[iBlinds].blind.push('D')
        do {
            iBlinds = (iBlinds + 1) % playerStates.length
        } while (playerStates[iBlinds].name === null)
        playerStates[iBlinds].blind.push('S')
        do {
            iBlinds = (iBlinds + 1) % playerStates.length
        } while (playerStates[iBlinds].name === null)
        playerStates[iBlinds].blind.push('B')
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
            player.balance = 0
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

    resetTurn()

    // Check if one player left
    if (playerStates.filter(x => x.name !== null && x.pocket.length > 0).length === 1) {
        return gameStates.FIND_WINNERS
    }

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
    numPlayersOut++
    if (playerStates.filter(x => x.name !== null && x.balance > 0).length == 1) {
        winner = playerStates.find(x => x.name !== null && x.balance > 0).name
        setGameState(gameStates.GAME_OVER)
    }
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