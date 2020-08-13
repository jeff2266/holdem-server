const expect = require('expect')

const shuffler = require('../src/utils/shuffler')
const { suits } = require('../src/utils/cards')

const newDeck = shuffler()

expect(
    newDeck.length
).toEqual(52)

expect(
    newDeck.filter(x => x.suit == suits.SPADES).length
).toEqual(13)

expect(
    newDeck.filter(x => x.suit == suits.HEARTS).length
).toEqual(13)

expect(
    newDeck.filter(x => x.suit == suits.CLUBS).length
).toEqual(13)

expect(
    newDeck.filter(x => x.suit == suits.DIAMONDS).length
).toEqual(13)