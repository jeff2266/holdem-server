"use strict"

const hands = {
    HIGH_CARD: {
        name: 'high card',
        rank: 0,
        tie: highCardOrFlushTie
    },
    PAIR: {
        name: 'pair',
        rank: 1,
        /**
         * Rule for pair ties. Returns 1 if player a wins, -1 if player b wins, 0 if tie
         * @param {number[]} a Player a's card values
         * @param {number[]} b Player b's card values
         */
        tie: function (a, b) {
            if (a.length != 5 || b.length != 5) throw new Error('Invalid argument(s) length')
            if (a[0] > b[0]) return 1
            else if (b[0] > a[0]) return -1
            else {
                for (let i = 2; i < 5; i++) {
                    if (a[i] > b[i]) return 1
                    else if (b[i] > a[i]) return -1
                }
                return 0
            }
        }
    },
    TWO_PAIR: {
        name: 'two pair',
        rank: 2,
        /**
         * Rule for two pair ties. Returns 1 if player a wins, -1 if player b wins, 0 if tie
         * @param {number[]} a Player a's card values
         * @param {number[]} b Player b's card values
         */
        tie: function (a, b) {
            if (a.length != 5 || b.length != 5) throw new Error('Invalid argument(s) length')
            if (a[0] > b[0]) return 1
            else if (b[0] > a[0]) return -1
            else {
                if (a[2] > b[2]) return 1
                else if (b[2] > a[2]) return -1
                else {
                    if (a[4] > b[4]) return 1
                    else if (b[4] > a[4]) return -1
                    else return 0
                }
            }
        }
    },
    THREE_OF_KIND: {
        name: 'three of a kind',
        rank: 3,
        /**
         * Rule for three of a kind ties. Returns 1 if player a wins, -1 if player b wins, 0 if tie
         * @param {number[]} a Player a's card values
         * @param {number[]} b Player b's card values
         */
        tie: function (a, b) {
            if (a.length != 5 || b.length != 5) throw new Error('Invalid argument(s) length')
            if (a[0] > b[0]) return 1
            else if (b[0] > a[0]) return -1
            else {
                if (a[3] > b[3]) return 1
                else if (b[3] > a[3]) return -1
                else {
                    if (a[4] > b[4]) return 1
                    else if (b[4] > a[4]) return -1
                    else return 0
                }
            }
        }
    },
    STRAIGHT: {
        name: 'straight',
        rank: 4,
        tie: straightTie
    },
    FLUSH: {
        name: 'flush',
        rank: 5,
        tie: highCardOrFlushTie
    },
    FULL_HOUSE: {
        name: 'full house',
        rank: 6,
        /**
         * Rule for full house ties. Returns 1 if player a wins, -1 if player b wins, 0 if tie
         * @param {number[]} a Player a's card values
         * @param {number[]} b Player b's card values
         */
        tie: function (a, b) {
            if (a.length != 5 || b.length != 5) throw new Error('Invalid argument(s) length')
            if (a[0] > b[0]) return 1
            else if (b[0] > a[0]) return -1
            else {
                if (a[3] > b[3]) return 1
                else if (b[3] > a[3]) return -1
                else return 0
            }
        }
    },
    FOUR_OF_KIND: {
        name: 'four of a kind',
        rank: 7,
        /**
         * Rule for four of a kind ties. Returns 1 if player a wins, -1 if player b wins, 0 if tie
         * @param {number[]} a Player a's card values
         * @param {number[]} b Player b's card values
         */
        tie: function (a, b) {
            if (a.length != 5 || b.length != 5) throw new Error('Invalid argument(s) length')
            if (a[0] > b[0]) return 1
            else if (b[0] > a[0]) return -1
            else {
                if (a[4] > b[4]) return 1
                else if (b[4] > a[4]) return -1
                else return 0
            }
        }
    },
    STRAIGHT_FLUSH: {
        name: 'straight flush',
        rank: 8,
        tie: straightTie
    },
    ROYAL_FLUSH: {
        name: 'royal flush',
        rank: 9,
        tie: straightTie
    }
}

/**
 * Rule for straight, straight flush, and royal flush ties. Returns 1 if player a wins, -1 if 
 * player b wins, 0 if tie
 * @param {number[]} a Player a's card values
 * @param {number[]} b Player b's card values
 */
function straightTie(a, b) {
    if (a.length != 5 || b.length != 5) throw new Error('Invalid argument(s) length')
    if (a[0] > b[0]) return 1
    else if (b[0] > a[0]) return -1
    else return 0
}

/**
 * Rule for high card and flush ties. Returns 1 if player a wins, -1 if player b wins, 0 if tie
 * @param {number[]} a Player a's card values
 * @param {number[]} b Player b's card values
 */
function highCardOrFlushTie(a, b) {
    if (a.length != 5 || b.length != 5) throw new Error('Invalid argument(s) length')
    for (let i = 0; i < 5; i++) {
        if (a[i] > b[i]) return 1
        else if (b[i] > a[i]) return -1
    }
    return 0
}

module.exports = hands