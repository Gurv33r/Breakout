import Deck from "./deck.js";
import vmap from "./values.js"; // used to compare cards - check judgeCard() for more details

var oppfinal = new Array(3), opppen = new Array(3), playfinal = new Array(3), playpen = new Array(3);
var opphand = [], playhand = [], center = new Deck(), trash = new Deck();
var past7 = false, drawEmpty = false, onPlayHand = false, onPlayPen = false, onPlayFinal = false, playerWon = false, onOppHand = false, onOppPen = false, onOppFinal = false;
var turnOver = false, oppWon = false;
//empty the center and trash piles
center.emptyDeck();
trash.emptyDeck();
//used to associate hands and HTML elements
var varstrmap = new Map()
varstrmap.set(oppfinal, 'oppfinal')
varstrmap.set(opppen, 'opppen')
varstrmap.set(opphand, 'opphand')
varstrmap.set(playhand, 'playhand')
varstrmap.set(playpen, 'playpen')
varstrmap.set(playfinal, 'playfinal')
//create and shuffle a deck
const draw = new Deck();
draw.shuffle();

// // after someone places a 10:
// // the center pile should be transferred to the trash pile 
// // and the center pile's display should be wiped out
// // this function fulfills that 2nd req 
// function clearCenter() {
//     var centerPile = document.querySelector('#center') // target the center pile display
//     centerPile.style.backgroundColor = ""; // set the background to none
//     if (centerPile.children.length > 0 ) { // if there is a card there
//         centerPile.children[0].replaceWith(document.createDocumentFragment()) // it shouldn't be displayed
//         // document fragments can be used as empty HTML elements
//         // so replacing cards with document fragments is like taking the card out of its slot
//     }
// }
// searches for the card object equivalent to a given HTML card in a given hand
// returns the INDEX, not the card object itself
// if not found, returns -1
function searchCard(cardElement, hand) {
    //iterate through the hand
    for (var i = 0; i < hand.length; i++) {
        // the data-value property of the HTML element and the card object's toString field have the same format
        // use those to compare HTML elements and card objects
        // if the element represents the card, return the index
        if (cardElement.children[0].getAttribute('data-value') === hand[i].toString) {
            return i
        }
    }
    // if the element isn't representing any of the cards in the provided hand, then return 1 
    return -1
}
//updates the display of the draw, center, and trash piles, as well as the arrows used for the player to flips through their hand
function updatePiles() {
    //target the 3 piles
    var drawSize = document.getElementById('draw');
    var trashSize = document.getElementById('trash');
    var centerPile = document.getElementById('center');
    //update the size of the draw pile
    drawSize.innerHTML = draw.size;
    //check if the draw pile is empty and set a flag if so
    if (drawSize.innerHTML === "0") {
        drawEmpty = true
    }
    //update the size of the trash pile
    trashSize.innerHTML = trash.size;
    //change the top card only if the center pile isn't empty
    //console.log(centerPile, centerPile.childNodes[0], center.size , center.cards)
    if (center.size === 0 ){
        centerPile.innerHTML = ""
        centerPile.style.backgroundColor = ""
    } else {
        centerPile.innerHTML = ""
        centerPile.appendChild(center.topCard.getHTML())
        centerPile.style.backgroundColor = "#fff"
    }
    // if(center.cards.length !== centerPile.children.length){
    //     if (center.topCard !== undefined){
    //         centerPile.appendChild(center.topCard.getHTML())
    //     } else {
    //         console.log('this legit doesn\'t make sense', center.cards)
    //     }
    // }
    // if (center.size > 0) {
    //     // cards have white backgrounds
    //     centerPile.style.backgroundColor = '#fff';
    //     //update the top card of the center pile
    //     if (centerPile.children.length > 0) { //change the top card
    //         if (!(centerPile.children[0].dataset.value === center.topCard.toString)) {
    //             centerPile.children[0].replaceWith(center.topCard.getHTML())
    //         }
    //     } else {// add the top card 
    //         console.log('center is empty!')
    //         centerPile.appendChild(center.topCard.getHTML());
    //     }
    // } 
    // update the numbers next to the arrows
    updateArrows()
}
//startup sequence for the game
//allocates cards from the draw pile to each of the hands and finally one to the center to start things off
function dealCards() {
    for (var i = 0; i < 18; i++) {
        //deal off the top of the deck
        let dealtCard = draw.cards.shift();
        if (i <= 2) {//opponent's final hand
            oppfinal[i] = dealtCard;
            document.querySelector('#oppfinal' + (i + 1)).appendChild(oppfinal[i].getHTML())
        } else if (i > 2 && i < 6) { //opponent's penultimate hand
            opppen[i - 3] = dealtCard;
            document.querySelector('#opppen' + (i - 3 + 1)).appendChild(opppen[i - 3].getHTML())
        } else if (i > 5 && i < 9) {//opponent's hand
            opphand.push(dealtCard);
            document.querySelector('#opphand' + (i - 6 + 1)).appendChild(opphand[i - 6].getHTML())
        } else if (i > 8 && i < 12) {//player's final hand
            playfinal[i - 9] = dealtCard;
            document.querySelector('#playfinal' + (i - 9 + 1)).appendChild(playfinal[i - 9].getHTML())
        } else if (i > 11 && i < 15) { // play's penultimate hand
            playpen[i - 12] = dealtCard;
            document.querySelector('#playpen' + (i - 12 + 1)).appendChild(playpen[i - 12].getHTML())
        } else { //player's hand
            playhand.push(dealtCard);
            document.querySelector('#playhand' + (i - 15 + 1)).appendChild(playhand[i - 15].getHTML())
        }
    }
    var startingCard = draw.cards.shift();
    //ensure that starting card is not a special card
    while (isSpecialCard(startingCard)) {
        draw.cards.push(startingCard)
        startingCard = draw.cards.shift()
    }
    center.collectSingle(startingCard);
    updatePiles();
}
//allocates a card from the draw pile to the given hand
function drawCard(handContext) {
    if (!drawEmpty) { // while the draw pile isn't empty
        //add a card from the draw pile to the given hand
        handContext.push(draw.cards.shift())
        //update the draw pile and arrows
        for (var i = 1; i <= 3; i++) {
            let slot = document.getElementById(varstrmap.get(handContext) + i)
            if (slot.children.length === 0) { // empty slot
                slot.appendChild(handContext[i - 1].getHTML())
            }
        }
        updatePiles()
    }
    return handContext
}
//provides funtionality to the collect button
//player's hand collects the entirety of the center pile
function collectCenter() {
    //collect the center into the right hand
    if (!turnOver) {
        playhand = playhand.concat(center.cards)
        for (var i = 1; i <= 3; i++) {
            let slot = document.getElementById('playhand' + i)
            if (slot.children.length === 0) { // empty slot
                slot.appendChild(playhand[i - 1].getHTML())
            }
        }
        updatePiles()
        endPlayerTurn()
    } else {
        opphand = opphand.concat(center.cards)
        turnOver = false
        for (var i = 1; i <= 3; i++) {
            let slot = document.getElementById('opphand' + i)
            if (slot.children.length === 0) { // empty slot
                slot.appendChild(opphand[i - 1].getHTML())
            }
        }
        updateExtra()
    }
    //empty the deck
    center.emptyDeck()
    //update the center pile and arrows
    updatePiles()
}
// event listener for left cards
function chooseCard1() {
    var out = 0 // used for responding outcome of placing the card the player chose onto the center pile

    // check if it is still the player's turn
    if (!turnOver) {
        if (onPlayHand) { // player is on their first hand
            out = placeCard(playhand, 1, null) // find the outcome of the player's choice 
        } else if (onPlayPen) { // player is on their penultimate hand 
            out = placeCard(playpen, 1, null) // find the outcome of the player's choice 
        } else if (onPlayFinal) { // player is on their final hand
            out = placeCard(playfinal, 1, null) // find the outcome of the player's choice 
        }
    } else {
        if (onOppHand) { //opponent is on their first hand
            out = placeCard(opphand, 1, null) // find the outcome of opponent's choice
        } else if (onOppPen) { // opponent is on their penultimate hand
            out = placeCard(opppen, 1, null) // find the outcome of opponent's choice
        } else if (onOppFinal) { // opponent is on their final hand
            out = placeCard(oppfinal, 1, null) // find the outcome of opponent's choice
        }
    }

    // chosen card was rejected case
    if (out === 1) {
        if (onPlayFinal && !onPlayHand && !onPlayPen) {// final card was rejected
            //remove the card slot
            var chosenCard = document.getElementById('playfinal1')
            chosenCard.style.backgroundColor = "";
            //push card to playhand
            const index = searchCard(chosenCard, playfinal)
            playhand.push(playfinal[index])
            // remove the card from playfinal
            playfinal.splice(index, 1)
            //playhand collects center
            collectCenter()

        } else {
            playerTurn()
        }
    }

    if (out === 0 || out === 10 || out === 7) {
        endPlayerTurn()
    }
    if (out === 2) {
        playerTurn()
    }
}
// same as chooseCard1() but for the cards in the middle column
function chooseCard2() {
    var out = 0
    if (!turnOver) {
        if (onPlayHand) {
            out = placeCard(playhand, 2, null)
        } else if (onPlayPen) {
            out = placeCard(playpen, 2, null)
        } else if (onPlayFinal) {
            out = placeCard(playfinal, 2, null)
        }
    } else {
        if (onOppHand) {
            out = placeCard(opphand, 2, null)
        } else if (onOppPen) {
            out = placeCard(opppen, 2, null)
        } else if (onOppFinal) {
            out = placeCard(oppfinal, 2, null)
        }
    }
    if (out === 1) {
        if (onPlayFinal && !onPlayHand && !onPlayPen) {// final card was rejected
            //remove the card slot
            var chosenCard = document.getElementById('playfinal2')
            chosenCard.style.backgroundColor = "";
            //push card to playhand
            const index = searchCard(chosenCard, playfinal)
            playhand.push(playfinal[index])
            // remove the card from playfinal
            playfinal.splice(index, 1)
            //playhand collects center
            collectCenter()

        } else {
            playerTurn()
        }

    }
    if (out === 0 || out === 10 || out === 7) {
        endPlayerTurn()
    }
    if (out === 2) {
        playerTurn()
    }
}
//same as chooseCard1() but for the cards in the right column
function chooseCard3() {
    console.log('clicked card 3')
    var out = 0
    if (!turnOver) {
        if (onPlayHand) {
            out = placeCard(playhand, 3, null)
        } else if (onPlayPen) {
            out = placeCard(playpen, 3, null)
        } else if (onPlayFinal) {
            out = placeCard(playfinal, 3, null)
        }
    } else {
        if (onOppHand) {
            out = placeCard(opphand, 3, null)
        } else if (onOppPen) {
            out = placeCard(opppen, 3, null)
        } else if (onOppFinal) {
            out = placeCard(oppfinal, 3, null)
        }
    }
    if (out === 1) {
        if (onPlayFinal && !onPlayHand && !onPlayPen) {// final card was rejected
            //remove the card slot
            var chosenCard = document.getElementById('playfinal3')
            chosenCard.style.backgroundColor = "";
            //push card to playhand
            const index = searchCard(chosenCard, playfinal)
            playhand.push(playfinal[index])
            // remove the card from playfinal
            playfinal.splice(index, 1)
            //playhand collects center
            collectCenter()
        } else {
            playerTurn()
        }

    }
    if (out === 0 || out === 10 || out === 7) {
        endPlayerTurn()
    }
    //will check if the player has won on after placing down a 2 
    if (out === 2) {
        playerTurn()
    }
}
//created for event listener arg since it cannot take arguments itself
//places card onto the center pile or rejects the card based on the result of judgeCard()
//also updates the display of the hand after placing the card
function placeCard(handContext, cardNum, index) {
    //console.log(onPlayHand, onOppHand)
    var toPlace = undefined
    if (cardNum !== null && index === null) {
        index = searchCard(document.getElementById(varstrmap.get(handContext) + cardNum), handContext)
    }
    toPlace = handContext[index]
    console.log(toPlace.toString)
    var outcome = 3, rv = 0 // rv will notify how to response to the card's placement, outcome indicates the the center's reaction to the card
    if (index >= 0) { // if the input is valid 
        // check the center's reaction to the card
        outcome = judgeCard(toPlace)
        console.log(outcome)
        if (outcome === 1) { // card shouldn't be placed down
            return 1
        } else if (outcome === 0) { // card should be placed down
            center.collectSingle(toPlace)
        }
        //acts upon all placeable cards (inlucding special cards)
        handContext.splice(index, 1) // remove the card from the hand
        rv = outcome
        // draw a card if necessary
        if (playhand.length < 3 && onPlayHand && !onPlayPen && !onPlayFinal && !drawEmpty && !turnOver) {
            playhand = drawCard(playhand)
        } else if (opphand.length < 3 && onOppHand && !onOppPen && !onOppFinal && !drawEmpty && turnOver) {
            opphand = drawCard(opphand)
        }
        console.log(center.cards)
        if (onPlayHand && !(onOppHand || onPlayFinal || onOppPen || onPlayPen || onOppFinal)) {
            if (playhand.length >= 3) { //update display
                document.getElementById(varstrmap.get(handContext) + cardNum).children[0].replaceWith(handContext[index].getHTML()) // update chosen card's display
                // update the rest of the hand's display
                if (cardNum === 1) {
                    document.getElementById(varstrmap.get(handContext) + '2').children[0].replaceWith(handContext[index + 1].getHTML())
                    document.getElementById(varstrmap.get(handContext) + '3').children[0].replaceWith(handContext[index + 2].getHTML())
                } else if (cardNum === 2) {// chose the middle card
                    document.getElementById(varstrmap.get(handContext) + '3').children[0].replaceWith(handContext[index + 1].getHTML())
                }
            } else {//targeted display deletion
                //set card to empty element (aka empty document fragment) 
                document.getElementById(varstrmap.get(handContext) + cardNum).children[0].replaceWith(document.createDocumentFragment())
                //set the card to have no background
                document.getElementById(varstrmap.get(handContext) + cardNum).style = ""
            }
        } else if (onOppHand && !(onOppHand && onPlayFinal && onOppPen && onPlayPen && onOppFinal)) {
            if (opphand.length < 3) {
                //set card to empty element (aka empty document fragment) 
                document.getElementById(varstrmap.get(handContext) + index).children[0].replaceWith(document.createDocumentFragment())
                //set the card to have no background
                document.getElementById(varstrmap.get(handContext) + index).style = ""
            } else {
                updateExtra()
            }
        } else if (!onOppHand && !onPlayHand && (onPlayFinal || onOppFinal || onOppPen || onPlayPen)) {
            //set card to empty element (aka empty document fragment) 
            document.getElementById(varstrmap.get(handContext) + index).children[0].replaceWith(document.createDocumentFragment())
            //set the card to have no background
            document.getElementById(varstrmap.get(handContext) + index).style = ""
        }
        //update the draw, center, trash piles and arrows as needed
        updatePiles()
        return rv
    }
}

// helper function used in judgeCard() to determine if the chosen card is a 2, 7, or 10
// all special cards are collected by the center
function isSpecialCard(card) {
    //all 2s, 7s, and 10s are displayed as golden, 
    //so if the provided card's display color is golden,
    // then the card is special 
    if (card.color === "golden") {
        return true
    }
    return false
}
// all 2s give the player another turn when placed, 
// allowing them to place another card on top of the 2 they placed
// this function just returns a 2 for now and is implemented in chooseCard()
function execute2() {
    if (!turnOver) {
        return 2
    } else {
        return 4
    }
}
// sets the 7 card into effect
// the actual effect is implemented in judgeCard()
// if a player places down a 7, then the next player must play either:
// a special card 
// or a card less than 7 (i.e. 3s-6s)
// if a player doesn't have any cards that meet either of these conditions, they must collect the center pile
function execute7() {
    past7 = true
}
// all 10s dump the center pile into the trash pile
// all cards in the trash pile are disregarded for the rest of the game
function execute10() {
    trash.collectMultiple(center.cards)
    center.emptyDeck()
    updatePiles()
}
// compares the given card to the top card of the center pile
// returns 1 if the card is rejected (card is less than or equal to the top card)
// otherwise returns 0 for success (i.e. the top card is less than the given card)
// if a player doesn't have any cards that don't make judgeCard() return a 1, then the player must collect the center 
function judgeCard(card) {
    var top = ""
    //3 cases:
    //1) center is empty
    //2) center has a nonspecial card
    //3) center has a 7
    //check if center is empty
    if (center.size === 0 || center.topCard.value === "2") {
        //accept any card
        //check for special cards first
        if (isSpecialCard(card)) {
            center.collectSingle(card)
            if (card.value === "2") {
                return execute2()
            } else if (card.value === "7") {
                execute7()
                return 7
            } else if (card.value === "10") {
                execute10()
                return 10
            }
        } else {
            return 0
        }
    } else {
        past7 ? top = 7 : top = vmap.get(center.topCard.value)
        if (isSpecialCard(card)) {
            center.collectSingle(card)
            if (card.value === "2") {
                return execute2()
            } else if (card.value === "7") {
                execute7()
                return 7
            } else if (card.value === "10") {
                execute10()
                return 10
            }
        } else if (vmap.get(card.value) > top) { // card is greater than top card
            if (past7) { // bad if the last card was a 7
                return 1
            }
            past7 = false
            return 0 // fine in the normal case
        } else if (vmap.get(card.value) <= top) { // card is less than or equal to the top card
            //if the card was = to 7, it should've been handled already in the special case code
            if (past7) { // good if the last card was a 7
                past7 = false
                return 0
            }
            return 1// bad in the normal case
        }

    }
}
// provides functionality to the left arrow 
// changes the display of the hand when clicked, allowing player to access the card they've collected
function shiftLeft() {
    // initalize targets
    var card1 = document.getElementById('playhand1'), card2 = document.getElementById('playhand2'), card3 = document.getElementById('playhand3')
    //since it is shifting LEFT, find the index of the previous card to shift to
    var prev = searchCard(card1, playhand) - 1
    if (prev >= 0) { //as long as there is a card behind the left card
        // replace the right card element's with the middle card's 
        card3.children[0].replaceWith(card2.children[0])
        // since replaceWith() actually moves the element, the middle card should append a new card
        card2.appendChild(card1.children[0])
        // finally, append the previous card to the first card's display
        card1.appendChild(playhand[prev].getHTML())
        // update the arrow numbers
        updateArrows()
    }
    // reinitialize event listeners
    document.getElementById('playhand1').addEventListener('click', chooseCard1)
    document.getElementById('playhand2').addEventListener('click', chooseCard2)
    document.getElementById('playhand3').addEventListener('click', chooseCard3)
}
//provides functionality to the right arrow
//changes display of hand when clicked, allowing player to access the card they've collected
function shiftRight() {
    // initialize targets
    var card1 = document.getElementById('playhand1'), card2 = document.getElementById('playhand2'), card3 = document.getElementById('playhand3')
    //since it shifts RIGHT, find the index of the next card to shift to 
    var next = searchCard(card3, playhand) + 1
    if (playhand.length - next >= 1) {// as long as there is a card to shift forward to
        // replace the left card's display with the middle card's
        card1.children[0].replaceWith(card2.children[0])
        // since replaceWith() actually moves the element, add the right card's display to the middle card's
        card2.appendChild(card3.children[0])
        // finally, add the next card to the right card's display
        card3.appendChild(playhand[next].getHTML())
        // update the arrow numbers
        updateArrows()
    }
    //reinitialize the event listners
    document.getElementById('playhand1').addEventListener('click', chooseCard1)
    document.getElementById('playhand2').addEventListener('click', chooseCard2)
    document.getElementById('playhand3').addEventListener('click', chooseCard3)
}
// update the numbers next to the arrows
// the numbers are supposed to represent how many more cards are on each side while player is perusing through their hand
function updateArrows() {
    var leftcounter = document.getElementById('cards-left-left'), rightcounter = document.getElementById('cards-left-right');
    var card1 = document.getElementById('playhand1'), card3 = document.getElementById('playhand3')
    if (!(card1 === undefined || card3 === undefined)) {
        var leftindex = searchCard(card1, playhand), rightindex = searchCard(card3, playhand)
        rightcounter.innerHTML = "&nbsp;" + (playhand.length - rightindex - 1)
        leftcounter.innerHTML = leftindex
    }
}
// assigns the event listeners based on which hand the player is on
// also determines if the player has won
function playerTurn() {
    updatePiles()
    turnOver = false
    document.getElementById('collect-button').addEventListener('click', collectCenter)
    if (playhand.length > 0) { // player hand case
        onPlayHand = true
        onPlayFinal = false
        onPlayPen = false
        document.getElementById('left-arrow').addEventListener('click', shiftLeft)
        document.getElementById('right-arrow').addEventListener('click', shiftRight)
        document.getElementById('playhand1').addEventListener('click', chooseCard1)
        document.getElementById('playhand2').addEventListener('click', chooseCard2)
        document.getElementById('playhand3').addEventListener('click', chooseCard3)
    } else if (drawEmpty && playhand.length === 0 && playpen.length > 0 && playfinal.length > 0) {// play penultimate case
        onPlayHand = false
        onPlayFinal = false
        onPlayPen = true
        document.getElementById('playpen1').addEventListener('click', chooseCard1)
        document.getElementById('playpen2').addEventListener('click', chooseCard2)
        document.getElementById('playpen3').addEventListener('click', chooseCard3)
    } else if (drawEmpty && playhand.length === 0 && playpen.length === 0 && playfinal.length > 0) {//finalhand case
        onPlayHand = false
        onPlayPen = false
        onPlayFinal = true
        document.getElementById('playfinal1').addEventListener('click', chooseCard1)
        document.getElementById('playfinal2').addEventListener('click', chooseCard2)
        document.getElementById('playfinal3').addEventListener('click', chooseCard3)
    }
}


//shuts off player interactivity with their cards and ends their turn
function endPlayerTurn() {
    console.log('Ending player turn')
    if (!turnOver) {
        //remove all event listeners
        document.getElementById('collect-button').removeEventListener('click', collectCenter)
        if (onPlayHand && !onPlayPen && !onPlayFinal) { // player hand case
            document.getElementById('playhand1').removeEventListener('click', chooseCard1)
            document.getElementById('playhand2').removeEventListener('click', chooseCard2)
            document.getElementById('playhand3').removeEventListener('click', chooseCard3)
        } else if (onPlayPen && !onPlayHand && !onPlayFinal) {// play penultimate case
            document.getElementById('playpen1').removeEventListener('click', chooseCard1)
            document.getElementById('playpen2').removeEventListener('click', chooseCard2)
            document.getElementById('playpen3').removeEventListener('click', chooseCard3)
        } else if (onPlayFinal && !onPlayHand && !onPlayPen) {//finalhand case
            document.getElementById('playfinal1').removeEventListener('click', chooseCard1)
            document.getElementById('playfinal2').removeEventListener('click', chooseCard2)
            document.getElementById('playfinal3').removeEventListener('click', chooseCard3)
        }
        if (playhand.length + playpen.length + playhand.length === 0) {
            playerWon = true
            oppWon = false
            //break game
            determineWinner()
        }
        updatePiles()
        turnOver = true
        playerWon = false
        //oppTurn()
    }
}

function oppTurn() {
    turnOver = true
    var playable = [], out = 0
    if (opphand.length > 0) {
        onOppHand = true
        onOppFinal = onOppPen = false
        console.log(onOppHand, onOppPen, onOppFinal)
        //iterate through opp hand and find all playable cards
        for (let card of opphand) {
            // since judge card actually executes special cards, this is here to check if the card is special before executing it
            if (isSpecialCard(card)) {
                playable.push()
                continue
            } else if (judgeCard(card) !== 1) {
                playable.push(card)
            }
        }
        //no playable cards case
        if (playable.length === 0) {
            collectCenter()
        }
        //only 1 playable card case
        else if (playable.length === 1) {
            out = placeCard(opphand, null, opphand.indexOf(playable[0]))
            console.log('Opponent played', playable[0])
        }
        //multiple playable cards case
        else {
            //find the lowest playable card that isn't special
            var lowest = playable[0]
            for (let card of playable) {
                if (vmap.get(card) < vmap.get(lowest) && !isSpecialCard(card)) {
                    lowest = card
                }
            }
            out = placeCard(opphand, null, opphand.indexOf(lowest))
            console.log('Opponent played', lowest)
        }
        updatePiles()
    }
    //opppen case
    else if (opphand.length === 0 && opppen.length > 0 && drawEmpty && oppfinal.length === 3) {
        onOppPen = true
        onOppHand = onOppFinal = false
        console.log(onOppHand, onOppPen, onOppFinal)
        //iterate through opppen and find all playable cards
        for (let card of opppen) {
            // since judge card actually executes special cards, this is here to check if the card is special before executing it
            if (isSpecialCard(card)) {
                playable.push()
            }
            else if (judgeCard(card) !== 1) {
                playable.push(card)
            }
        }
        //no playable cards case
        if (playable.length === 0) {
            collectCenter()
        }
        //only 1 playable card case
        else if (playable.length === 1) {
            out = placeCard(opppen, null, opppen.indexOf(playable[0]))
            console.log('Opponent played', playable[0])
        }
        //multiple playable cards case
        else {
            //find the lowest playable card that isn't special
            var lowest = playable[0]
            for (let card of playable) {
                if (vmap.get(card) < vmap.get(lowest) && !isSpecialCard(card)) {
                    lowest = card
                }
            }
            out = placeCard(opppen, null, opppen.indexOf(lowest))
            console.log('Opponent played', lowest)
        }
        updatePiles()
    }
    //opp final case
    else if ((opphand.length + opppen.length === 0) && drawEmpty && oppfinal.length > 0) {
        // blind placement - custom
        onOppFinal = true
        onOppHand = onOppPen = false
        console.log(onOppHand, onOppPen, onOppFinal)
        //chose a random index
        const chosenNum = Math.floor(Math.random() * 3) // = random num 0-2
        const outcome = placeCard(oppfinal, null, chosenNum)
        if (out === 1) {
            center.collectSingle(oppfinal[chosenNum])
            collectCenter()
        } else if (outcome === 4) {
            out = outcome
        }
    }
    if (out === 4) {
        oppTurn()
        if (oppWon) {
            playerWon = false
            oppWon = true
            //break game
           determineWinner()
        }
    }
    if ((opphand.length + opppen.length + oppfinal.length === 0) && drawEmpty) {
       playerWon = false
       oppWon = true
       //break game
        determineWinner()
    } else {
        turnOver = false
        oppWon = false
    }
    updatePiles()
}

function updateExtra() {
    var extra = document.querySelector('#extra')
    if (opphand.length >= 3) {
        extra.innerHTML = 'Opponent<br>has<br>' + (opphand.length - 3) + '<br>additional<br>cards'
    }
}

//ending sequence that occurs after the game is over
function determineWinner() {
    playerWon ? alert("You have bested the machine! Give yourself a pat on the back") : alert('You lost. Tough break, buddy. Reload the page to try again')
}

//starts and sets the flow of the game
//currently just deals the cards and gives the player a turn
function game() {
    dealCards()
    // game:
    // while(playerWon || oppWon){
    //     playerTurn()
    // }
    playerTurn()
}

game()