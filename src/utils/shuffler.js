"use strict"

const _ = require('lodash')
const { suits, values } = require('./cards')

/**
 * Constructor for card
 * @param {string} newSuit 
 * @param {string} newValue 
 */
function Card(newSuit, newValue) {
    if (!suits[newSuit] || !values[newValue]) {
        throw new Error('Invalid argument(s)')
    }
    this.suit = suits[newSuit]
    this.value = newValue
}

/**
 * Returns a new suffled 52 card deck
 */
function newDeck() {
    let deck = []

    Object.keys(suits).slice(0, 4).forEach((x) => {
        Object.keys(values).forEach((y) => {
            deck.push(new Card(x, y))
        })
    })
    return _.shuffle(deck)
}

module.exports = newDeck