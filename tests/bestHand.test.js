const expect = require('expect')

const bestHand = require('../src/utils/bestHand')
const { suits } = require('../src/utils/cards')
const hands = require('../src/utils/hands')

const window = [
    {
        suit: suits.SPADES,
        value: '10'
    },
    {
        suit: suits.SPADES,
        value: '8'
    },
    {
        suit: suits.SPADES,
        value: '9'
    },
    {
        suit: suits.SPADES,
        value: 'A'
    },
    {
        suit: suits.SPADES,
        value: 'J'
    }
]

const pocketRoyalFlush = [
    { suit: suits.SPADES, value: 'K' },
    { suit: suits.SPADES, value: 'Q' }
]
expect(
    bestHand(pocketRoyalFlush, window)
).toEqual(
    {
        cards: [
            { suit: suits.SPADES, value: 'A' },
            { suit: suits.SPADES, value: 'K' },
            { suit: suits.SPADES, value: 'Q' },
            { suit: suits.SPADES, value: 'J' },
            { suit: suits.SPADES, value: '10' }
        ],
        hand: hands.ROYAL_FLUSH
    }
)

const pocketStraightFlush = [
    { suit: suits.DIAMONDS, value: '10' },
    { suit: suits.SPADES, value: 'Q' }
]
expect(
    bestHand(pocketStraightFlush, window)
).toEqual(
    {
        cards: [
            { suit: suits.SPADES, value: 'Q' },
            { suit: suits.SPADES, value: 'J' },
            { suit: suits.SPADES, value: '10' },
            { suit: suits.SPADES, value: '9' },
            { suit: suits.SPADES, value: '8' }
        ],
        hand: hands.STRAIGHT_FLUSH
    }
)

const pocketFlush = [
    { suit: suits.DIAMONDS, value: '10' },
    { suit: suits.DIAMONDS, value: 'Q' }
]
expect(
    bestHand(pocketFlush, window)
).toEqual(
    {
        cards: [
            { suit: suits.SPADES, value: 'A' },
            { suit: suits.SPADES, value: 'J' },
            { suit: suits.SPADES, value: '10' },
            { suit: suits.SPADES, value: '9' },
            { suit: suits.SPADES, value: '8' }
        ],
        hand: hands.FLUSH
    }
)

const window2 = [
    {
        suit: suits.SPADES,
        value: '10'
    },
    {
        suit: suits.CLUBS,
        value: '10'
    },
    {
        suit: suits.SPADES,
        value: '9'
    },
    {
        suit: suits.HEARTS,
        value: 'A'
    },
    {
        suit: suits.HEARTS,
        value: 'J'
    }
]

const pocketFullHouse = [
    { suit: suits.HEARTS, value: '9' },
    { suit: suits.DIAMONDS, value: '9' }
]
expect(
    bestHand(pocketFullHouse, window2)
).toEqual(
    {
        cards: [
            { suit: suits.SPADES, value: '9' },
            { suit: suits.HEARTS, value: '9' },
            { suit: suits.DIAMONDS, value: '9' },
            { suit: suits.SPADES, value: '10' },
            { suit: suits.CLUBS, value: '10' }
        ],
        hand: hands.FULL_HOUSE
    }
)

const pocketStraight = [
    { suit: suits.HEARTS, value: 'K' },
    { suit: suits.DIAMONDS, value: 'Q' }
]
expect(
    bestHand(pocketStraight, window2)
).toEqual(
    {
        cards: [
            { suit: suits.HEARTS, value: 'A' },
            { suit: suits.HEARTS, value: 'K' },
            { suit: suits.DIAMONDS, value: 'Q' },
            { suit: suits.HEARTS, value: 'J' },
            { suit: suits.SPADES, value: '10' }
        ],
        hand: hands.STRAIGHT
    }
)

const pocketThreeOfKind = [
    { suit: suits.HEARTS, value: '10' },
    { suit: suits.DIAMONDS, value: '2' }
]
expect(
    bestHand(pocketThreeOfKind, window2)
).toEqual(
    {
        cards: [
            { suit: suits.SPADES, value: '10' },
            { suit: suits.HEARTS, value: '10' },
            { suit: suits.CLUBS, value: '10' },
            { suit: suits.HEARTS, value: 'A' },
            { suit: suits.HEARTS, value: 'J' }
        ],
        hand: hands.THREE_OF_KIND
    }
)

const pocketTwoPair = [
    { suit: suits.HEARTS, value: '9' },
    { suit: suits.DIAMONDS, value: 'A' }
]
expect(
    bestHand(pocketTwoPair, window2)
).toEqual(
    {
        cards: [
            { suit: suits.HEARTS, value: 'A' },
            { suit: suits.DIAMONDS, value: 'A' },
            { suit: suits.SPADES, value: '10' },
            { suit: suits.CLUBS, value: '10' },
            { suit: suits.HEARTS, value: 'J' }
        ],
        hand: hands.TWO_PAIR
    }
)

const pocketPair = [
    { suit: suits.HEARTS, value: 'K' },
    { suit: suits.DIAMONDS, value: '3' }
]
expect(
    bestHand(pocketPair, window2)
).toEqual(
    {
        cards: [
            { suit: suits.SPADES, value: '10' },
            { suit: suits.CLUBS, value: '10' },
            { suit: suits.HEARTS, value: 'A' },
            { suit: suits.HEARTS, value: 'K' },
            { suit: suits.HEARTS, value: 'J' }
        ],
        hand: hands.PAIR
    }
)

const window3 = [
    {
        suit: suits.SPADES,
        value: '5'
    },
    {
        suit: suits.CLUBS,
        value: '10'
    },
    {
        suit: suits.SPADES,
        value: '9'
    },
    {
        suit: suits.HEARTS,
        value: 'A'
    },
    {
        suit: suits.HEARTS,
        value: 'J'
    }
]

const pocketHighCard = [
    { suit: suits.HEARTS, value: 'K' },
    { suit: suits.DIAMONDS, value: '3' }
]
expect(
    bestHand(pocketHighCard, window3)
).toEqual(
    {
        cards: [
            { suit: suits.HEARTS, value: 'A' },
            { suit: suits.HEARTS, value: 'K' },
            { suit: suits.HEARTS, value: 'J' },
            { suit: suits.CLUBS, value: '10' },
            { suit: suits.SPADES, value: '9' }
        ],
        hand: hands.HIGH_CARD
    }
)