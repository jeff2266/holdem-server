"use strict"

const { suits, values } = require('./cards')
const hands = require('./hands')

/**
 * Takes in an array of two cards and the window, and returns the best possible five card
 * @param {{suit: string, value: string}[]} pocket Player's pocket cards
 * @param {{suit: string, value: string}[]} window Window cards
 */
function bestHand(pocket, window) {

    if (window.length !== 5) throw new Error('Invalid window length')
    if (pocket.length !== 2) throw new Error('Invalid pocket length')

    let hasFlush = false
    let allCards = pocket.concat(window)
    let ofSuitx

    // Look for flush
    for (let iSuit of Object.values(suits)) {
        ofSuitx = allCards.filter(card => card.suit == iSuit)
        if (ofSuitx.length >= 5) {
            hasFlush = true

            // Is straight flush?
            ofSuitx.sort((a, b) => { return values[b.value] - values[a.value] })
            const ofSuitxValues = ofSuitx.map(x => values[x.value])
            for (let i = 0; i <= (ofSuitxValues.length - 5); i++) {
                let isStraightFlush = true
                for (let j = 1; j < 5; j++) {
                    if (ofSuitxValues[i + j] !== ofSuitxValues[i + j - 1] - 1) {
                        isStraightFlush = false
                        break
                    }
                }
                if (isStraightFlush) return {
                    cards: ofSuitx.slice(i, i + 5),
                    hand: (ofSuitx[i].value == 'A') ? hands.ROYAL_FLUSH : hands.STRAIGHT_FLUSH
                }
            }

            // No straight flush, only flush. Save the highest flush by value.
            ofSuitx = ofSuitx.slice(0, 5)
            break
        }
    }

    // Bin by value, then by suit
    allCards.sort((a, b) => {
        const rankA = values[a.value]
        const rankB = values[b.value]
        if (rankB > rankA) return 1
        else if (rankB < rankA) return -1
        else {
            return (suits.rank(b.suit, a.suit))
        }
    })

    const allCardsValues = allCards.map(x => x.value)
    const uniqueValues = allCardsValues.filter((v, i, s) => { return s.indexOf(v) === i })
    const uniqueValuesCts = uniqueValues.map(x => allCardsValues.filter(y => y === x).length)

    // Look for four of a kind
    const i4oK = uniqueValuesCts.indexOf(4)
    if (i4oK > -1) {
        const fourOfKindHand = allCards.filter(x => x.value == uniqueValues[i4oK])
        fourOfKindHand.push(allCards.filter(x => x.value != uniqueValues[i4oK])[0])
        return {
            cards: fourOfKindHand,
            hand: hands.FOUR_OF_KIND
        }
    }

    // Find triplets and pairs
    const i3oKs = [], iPairs = []
    for (let i = 0; i < uniqueValuesCts.length; i++) {
        if (uniqueValuesCts[i] === 3) i3oKs.push(i)
        else if (uniqueValuesCts[i] === 2) iPairs.push(i)
    }

    // Look for full house
    let thrOfKindOrFullHouseHand
    if (i3oKs.length > 0) {
        thrOfKindOrFullHouseHand = allCards.filter(x => x.value == uniqueValues[i3oKs[0]])
        const iRemTripOrPair = i3oKs.slice(1).concat(iPairs)
        if (iRemTripOrPair.length > 0) {
            // Find remaining triplet or pair with highest value
            const fill = uniqueValues[iRemTripOrPair[0]]
            for (let i = 1; i < iRemTripOrPair.length; i++) {
                if (uniqueValues[iRemTripOrPair[i]] > fill) fill = uniqueValues[iRemTripOrPair[i]]
            }
            thrOfKindOrFullHouseHand.push(...allCards.filter(x => x.value == fill).slice(0, 2))
            return {
                cards: thrOfKindOrFullHouseHand,
                hand: hands.FULL_HOUSE
            }
        }

        // No full house, only three of kind
    }

    // Flush?
    if (hasFlush) return {
        cards: ofSuitx,
        hand: hands.FLUSH
    }

    // Look for straight
    // Straight will have at least five unique values
    if (uniqueValues.length >= 5) {
        const uniqueValuesNumeric = uniqueValues.map(x => values[x])
        for (let i = 0; i <= 2; i++) {
            let isStraight = true
            for (let j = 1; j < 5; j++) {
                if (uniqueValuesNumeric[i + j] != uniqueValuesNumeric[i + j - 1] - 1) {
                    isStraight = false
                    break
                }
            }
            if (isStraight) {
                let straightHand = []
                for (let i = 0; i < 5; i++) {
                    straightHand.push(allCards.find(x => x.value == uniqueValues[i]))
                }
                return {
                    cards: straightHand,
                    hand: hands.STRAIGHT
                }
            }
        }
    }

    // Three of a kind?
    if (i3oKs.length > 0) {
        // Push two highest value cards
        thrOfKindOrFullHouseHand.push(...allCards.filter(x => x.value != uniqueValues[i3oKs[0]]).slice(0, 2))
        return {
            cards: thrOfKindOrFullHouseHand,
            hand: hands.THREE_OF_KIND
        }
    }

    // Two pair?
    if (iPairs.length >= 2) {
        const twoPairHand = allCards.filter(x => x.value == uniqueValues[iPairs[0]] || x.value == uniqueValues[iPairs[1]])
        twoPairHand.push(allCards.filter(x => !(x.value == uniqueValues[iPairs[0]] || x.value == uniqueValues[iPairs[1]]))[0])
        return {
            cards: twoPairHand,
            hand: hands.TWO_PAIR
        }
    }

    // Pair?
    if (iPairs.length == 1) {
        const pairHand = allCards.filter(x => x.value == uniqueValues[iPairs[0]])
        pairHand.push(...allCards.filter(x => x.value != uniqueValues[iPairs[0]]).slice(0, 3))
        return {
            cards: pairHand,
            hand: hands.PAIR
        }
    }

    // High card
    const highCardHand = allCards.slice(0, 5)
    return {
        cards: highCardHand,
        hand: hands.HIGH_CARD
    }
}

module.exports = bestHand