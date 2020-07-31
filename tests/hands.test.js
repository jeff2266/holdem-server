const expect = require('expect')
const hands = require('../src/utils/hands')

const highCard = hands.HIGH_CARD

expect(
    highCard.tie([14, 8, 2, 2, 2], [13, 8, 2, 2, 2])
).toEqual(1);

// 1st kicker
expect(
    highCard.tie([13, 9, 3, 3, 3], [13, 8, 2, 2, 2])
).toEqual(1);

// 4th kicker
expect(
    highCard.tie([13, 9, 3, 3, 3], [13, 9, 3, 3, 4])
).toEqual(-1);

// Tie
expect(
    highCard.tie([13, 9, 3, 3, 3], [13, 9, 3, 3, 3])
).toEqual(0);


const twoPair = hands.TWO_PAIR

expect(
    twoPair.tie([14, 14, 9, 9, 2], [13, 13, 9, 9, 2])
).toEqual(1);

// 2nd pair
expect(
    twoPair.tie([14, 14, 9, 9, 12], [14, 14, 10, 10, 2])
).toEqual(-1);

// Kicker
expect(
    twoPair.tie([14, 14, 9, 9, 2], [14, 14, 9, 9, 3])
).toEqual(-1);

// Tie
expect(
    twoPair.tie([14, 14, 9, 9, 2], [14, 14, 9, 9, 2])
).toEqual(0);


const threeOfAKind = hands.THREE_OF_KIND

expect(
    threeOfAKind.tie([14, 14, 14, 9, 2], [13, 13, 13, 14, 2])
).toEqual(1);

// 1st kicker
expect(
    threeOfAKind.tie([13, 13, 13, 9, 2], [13, 13, 13, 10, 2])
).toEqual(-1);

// 2nd kicker
expect(
    threeOfAKind.tie([13, 13, 13, 9, 4], [13, 13, 13, 9, 2])
).toEqual(1);

// Tie
expect(
    threeOfAKind.tie([13, 13, 13, 9, 4], [13, 13, 13, 9, 4])
).toEqual(0);


const straight = hands.STRAIGHT

expect(
    straight.tie([14, 13, 12, 11, 10], [13, 12, 11, 10, 9])
).toEqual(1);

expect(
    straight.tie([13, 12, 11, 10, 9], [14, 13, 12, 11, 10])
).toEqual(-1);

// Tie
expect(
    straight.tie([13, 12, 11, 10, 9], [13, 12, 11, 10, 9])
).toEqual(0);


const fourOfAKind = hands.FOUR_OF_KIND

expect(
    fourOfAKind.tie([12, 12, 12, 12, 10], [2, 2, 2, 2, 13])
).toEqual(1);

// Kicker
expect(
    fourOfAKind.tie([12, 12, 12, 12, 10], [12, 12, 12, 12, 13])
).toEqual(-1);

// Tie
expect(
    fourOfAKind.tie([12, 12, 12, 12, 10], [12, 12, 12, 12, 10])
).toEqual(0);