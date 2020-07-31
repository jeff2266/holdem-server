const suits = {
    SPADES: '♠',
    HEARTS: '♥',
    CLUBS: '♣',
    DIAMONDS: '♦',
    rank: (a, b) => {
        const ranks = ['♦', '♣', '♥', '♠']
        const rankA = ranks.indexOf(a)
        const rankB = ranks.indexOf(b)
        if (rankA < 0 || rankB < 0) throw new Error('Invalid argument(s)')
        return (rankA > rankB) ? 1 : (rankA < rankB) ? -1 : 0
    }
}

const values = {
    A: 14,
    K: 13,
    Q: 12,
    J: 11,
    10: 10,
    9: 9,
    8: 8,
    7: 7,
    6: 6,
    5: 5,
    4: 4,
    3: 3,
    2: 2
}

module.exports = { suits, values }