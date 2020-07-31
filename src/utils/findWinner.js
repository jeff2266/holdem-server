const hands = require('./hands')
const { values } = require('./cards')

/**
 * Takes in an array of hands and returns the player id of the winning hand
 * @param {{cards: {suit: string, value: string}[], hand: Object, id: number}} handsArray Array of players' hands
 */
function findWinner(handsArray) {
    // Find best hand
    const handScores = handsArray.map((x) => {
        return {
            handScore: x.hand.rank,
            id: x.id
        }
    })
    const maxHandScore = Math.max.apply(Math, handScores.map(x => x.handScore))
    const winningHands = handsArray.filter(x => x.hand.rank === maxHandScore)

    // If one winning hand, return it's id
    if (winningHands.length === 1) return [winningHands[0].id]

    // If multiple winning hands, apply tie breakers
    const tieBreaker = winningHands[0].hand.tie
    let winners = [winningHands[0]]
    for (let i = 1; i < winningHands.length; i++) {
        const result = tieBreaker(winners[0].cards.map(x => values[x.value]),
            (winningHands[i].cards.map(x => values[x.value])))
        switch (result) {
            case 1:
                break
            case 0:
                winners.push(winningHands[i])
                break
            case -1:
                winners = [winningHands[i]]
                break
            default:
                throw new Error(`Tie breaker returned unexpected code ${result}`)
        }
    }

    return winners.map(x => x.id)
}

module.exports = findWinner