const expect = require('expect')
const findWinner = require('../src/utils/findWinner')
const hands = require('../src/utils/hands')

const handsNoTie = [
    {
        cards: [
            { suit: 'spades', value: '4' },
            { suit: 'hearts', value: '4' },
            { suit: 'clubs', value: 'J' },
            { suit: 'clubs', value: '9' },
            { suit: 'spades', value: '5' }
        ],
        hand: hands.PAIR,
        id: 0
    },
    {
        cards: [
            { suit: 'clubs', value: 'J' },
            { suit: 'clubs', value: '9' },
            { suit: 'hearts', value: '6' },
            { suit: 'spades', value: '5' },
            { suit: 'spades', value: '4' }
        ],
        hand: hands.HIGH_CARD,
        id: 1
    },
    {
        cards: [
            { suit: 'spades', value: '4' },
            { suit: 'hearts', value: '4' },
            { suit: 'clubs', value: '4' },
            { suit: 'clubs', value: '2' },
            { suit: 'spades', value: '2' }
        ],
        hand: hands.FULL_HOUSE,
        id: 2
    }
]

expect(
    findWinner(handsNoTie)
).toEqual([2])

const handsFullHouseTieBreaker = [
    {
        cards: [
            { suit: 'spades', value: '5' },
            { suit: 'hearts', value: '5' },
            { suit: 'clubs', value: '5' },
            { suit: 'clubs', value: '2' },
            { suit: 'spades', value: '2' }
        ],
        hand: hands.FULL_HOUSE,
        id: 0
    },
    {
        cards: [
            { suit: 'clubs', value: 'J' },
            { suit: 'clubs', value: '9' },
            { suit: 'hearts', value: '6' },
            { suit: 'spades', value: '5' },
            { suit: 'spades', value: '4' }
        ],
        hand: hands.HIGH_CARD,
        id: 1
    },
    {
        cards: [
            { suit: 'spades', value: '4' },
            { suit: 'hearts', value: '4' },
            { suit: 'clubs', value: '4' },
            { suit: 'clubs', value: '3' },
            { suit: 'spades', value: '3' }
        ],
        hand: hands.FULL_HOUSE,
        id: 2
    }
]

expect(
    findWinner(handsFullHouseTieBreaker)
).toEqual([0])

const handsTwoPairTie = [
    {
        cards: [
            { suit: 'hearts', value: '4' },
            { suit: 'clubs', value: '4' },
            { suit: 'diamonds', value: '3' },
            { suit: 'diamonds', value: '3' },
            { suit: 'diamonds', value: 'K' }
        ],
        hand: hands.FULL_HOUSE,
        id: 0
    },
    {
        cards: [
            { suit: 'clubs', value: 'J' },
            { suit: 'clubs', value: '9' },
            { suit: 'hearts', value: '6' },
            { suit: 'spades', value: '5' },
            { suit: 'spades', value: '4' }
        ],
        hand: hands.HIGH_CARD,
        id: 1
    },
    {
        cards: [
            { suit: 'spades', value: '4' },
            { suit: 'hearts', value: '4' },
            { suit: 'clubs', value: '3' },
            { suit: 'clubs', value: '3' },
            { suit: 'spades', value: 'K' }
        ],
        hand: hands.FULL_HOUSE,
        id: 2
    }
]

expect(
    findWinner(handsTwoPairTie)
).toEqual([0, 2])