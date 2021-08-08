import Deck from "./deck.js";
import vmap from "./values.js";

// TODO: implement a collect center function:
    // user must be able to click on a tile or button
    // turn must end afterwards
    // inform user of rules 
    // collect from center and place into playhand including current hand
    // if a card from play final is played and the card cannot be placed, add the card to playhand along with the rest of teh deck

//TODO: final hand placement animation is different:
    // when placing a final card down, the card slot must have transparent/none background
    // if it is picked up, the card slot remains transparent until the game is finished

var oppfinal=new Array(3),opppen=new Array(3),playfinal=new Array(3),playpen=new Array(3);
var opphand=[], playhand=[],center=new Deck(),trash=new Deck();
var past7=false, drawEmpty = false, onPlayHand=false, onPlayPen=false, onPlayFinal=false, playerWon=false, onOppHand=false, onOppPen=false, onOppFinal=false;
var turnOver = false
center.emptyDeck();
console.log('center', center.cards, center.size)
trash.emptyDeck();
console.log('trash',trash.cards)
var varstrmap = new Map()
varstrmap.set(oppfinal,'oppfinal')
varstrmap.set(opppen,'opppen')
varstrmap.set(opphand,'opphand')
varstrmap.set(playhand,'playhand')
varstrmap.set(playpen,'playpen')
varstrmap.set(playfinal,'playfinal')

const draw = new Deck();
draw.shuffle();

function game(){
    dealCards()
    // game :
    // while(true){
        
    //     if(await playerTurn()){
    //         playerWon=true
    //         break
    //     }
    //     if(await oppTurn()){
    //         playerWon=false
    //         break
    //     }
    // } 
    playerTurn()
    
}
function clearCenter(){
    var centerPile = document.querySelector('#center')
    centerPile.style.backgroundColor = "";
        if(typeof centerPile.children[0] != 'undefined'){
            centerPile.children[0].replaceWith(document.createDocumentFragment())
        }
}
function searchCard(cardElement,hand){
    for(var i = 0; i<hand.length;i++){
        if (cardElement.children[0].getAttribute('data-value') === hand[i].toString){
            return i
        }
    }
    return -1
}
function updatePiles(){
    var drawSize = document.getElementById('draw');
    var trashSize = document.getElementById('trash');
    var centerPile = document.getElementById('center');
    if(center.size >2 && center.topCard.value === center.cards[1].value && center.topCard.suit === center.cards[1].suit){
        center.cards.shift()
    }
    console.log(center.cards, center.size)
    drawSize.innerHTML = draw.size;
    if(drawSize.innerHTML === "0"){
        drawEmpty = true
    }
    trashSize.innerHTML = trash.size;
    //change the top card only if the center pile isn't empty
    if(center.size>0){
        centerPile.style.backgroundColor = '#fff';
        if (centerPile.children.length>0){
            if (!(centerPile.children[0].dataset.value === center.topCard.toString)){
                centerPile.children[0].replaceWith(center.topCard.getHTML())
            }
        } else {
             centerPile.appendChild(center.topCard.getHTML());
        }
    } else{
        clearCenter()
    }
    
    //updateHand()
    updateArrows()
}
// function updateHand(context){
//     var card1 = document.getElementById(context + '1')
// }
function dealCards(){
    for (var i=0; i<18;i++){
        //deal off the top of the deck
        let dealtCard = draw.cards.shift();
        //cardSlots[i].appendChild(dealtCard.getHTML());
        if(i<=2){//oppfinal
            oppfinal[i] = dealtCard;
            document.querySelector('#oppfinal' + (i+1)).appendChild(oppfinal[i].getHTML())
        } else if(i>2 && i<6){ //opppen
            opppen[i-3] = dealtCard;
            document.querySelector('#opppen' + (i-3+1)).appendChild(opppen[i-3].getHTML())
        } else if (i>5 && i<9){//opphand
            opphand.push(dealtCard);
            document.querySelector('#opphand' + (i-6+1)).appendChild(opphand[i-6].getHTML())
        } else if (i>8 && i<12){
            playfinal[i-9] = dealtCard;
            document.querySelector('#playfinal' + (i-9+1)).appendChild(playfinal[i-9].getHTML())
        } else if (i>11 && i<15){
            playpen[i-12] = dealtCard;
            document.querySelector('#playpen' + (i-12+1)).appendChild(playpen[i-12].getHTML())
        } else {
            playhand.push(dealtCard);
            document.querySelector('#playhand' + (i-15+1)).appendChild(playhand[i-15].getHTML())   
        }
    }
    //ensure that starting card is not a special card
    var startingCard = draw.cards.shift();
    while (isSpecialCard(startingCard)) {
        draw.cards.push(startingCard)
        startingCard = draw.cards.shift()
    }
    //console.log(draw.size)
    center.collectSingle(startingCard);
    // for (let key of varstrmap.keys()){
    //     console.log(key)
    // }
    updatePiles();
}
function drawCard(handContext){
    if (!drawEmpty){
        handContext.push(draw.cards.shift())
        updatePiles()
    }
    return handContext
}
function endPlayerTurn(){
    console.log('Ending player turn')
    if(!turnOver){
        if (onPlayHand && !onPlayPen && !onPlayFinal){ // player hand case
        document.getElementById('left-arrow').removeEventListener('click',shiftLeft)
        document.getElementById('right-arrow').removeEventListener('click', shiftRight)
        document.getElementById('playhand1').removeEventListener('click', chooseCard1)
        document.getElementById('playhand2').removeEventListener('click', chooseCard2)
        document.getElementById('playhand3').removeEventListener('click', chooseCard3)
        } else if (onPlayPen && !onPlayHand && !onPlayFinal){// play penultimate case
        document.getElementById('playpen1').removeEventListener('click', chooseCard1)
        document.getElementById('playpen2').removeEventListener('click', chooseCard2)
        document.getElementById('playpen3').removeEventListener('click', chooseCard3)
        } else if (onPlayFinal && !onPlayHand && !onPlayPen){//finalhand case
        document.getElementById('playfinal1').removeEventListener('click', chooseCard1)
        document.getElementById('playpen2').removeEventListener('click', chooseCard2)
        document.getElementById('playpen3').removeEventListener('click', chooseCard3)
        }
        turnOver = true
    }
}
function collectCenter(){
    console.log('Collecting...',turnOver)
    if(!turnOver){
        playhand = playhand.concat(center.cards)
        endPlayerTurn()
    } else {
        opphand = opphand.concat(center.cards)
        turnOver= false
    }
    document.getElementById('collect-button').removeEventListener('click', collectCenter)
    center.emptyDeck()
    updatePiles()
}
function chooseCard1(){
    var out = 0
    console.log("picked card 1, which is", document.getElementById('playhand1').getAttribute('data-value'))
    console.log('Turn over = ' + turnOver)
    if (!turnOver){
        console.log(onPlayHand,onPlayPen,onPlayFinal)
        if (onPlayHand){
            out = placeCard(playhand,1)
            // if(outcome > 0){
            //     break game
            // }
        } else if (onPlayPen) {
            out = placeCard(playpen,1)
        } else if (onPlayFinal){
            out = placeCard(playfinal, 1)
        } 
    } else {
        if (onOppHand){
            out = placeCard(opphand,1)
            // if(outcome > 0){
            //     break game
            // }
        } else if (onOppPen) {
            out = placeCard(opppen,1)
        } else if (onOppFinal){
            out = placeCard(oppfinal, 1)
        } 
    }
    console.log('out = ', out)
    if(out === 1){
        if (onPlayFinal && !onPlayHand && !onPlayPen){// final card was rejected
            //remove the card slot
            var chosenCard = document.getElementById('playfinal1')
            chosenCard.style.backgroundColor = "";
            //push card to playhand
            const index = searchCard(chosenCard,playfinal)
            playhand.push(playfinal[index])
            // remove the card from playfinal
            playfinal.splice(index,1)
            //playhand collects center
            collectCenter()

        } else {
            console.log('card is less than center card!')
            // if (playerTurn()){
             //     break game
             // }
             playerTurn()
        }
    }
    if(out ===0 || out === 10){
        endPlayerTurn()
    }
    if(out===2){
        playerTurn()
        /*
        break game
        determineWinner()
         */
    }
    //choice1 = true
}
function chooseCard2(){
    var out = 0
    console.log("picked card 2, which is", document.getElementById('playhand2').getAttribute('data-value'))
    console.log('Turn over = ' + turnOver)
    if (!turnOver){
        console.log(onPlayHand,onPlayPen,onPlayFinal)
        if (onPlayHand){
            out = placeCard(playhand,2)
            // if(outcome > 0){
            //     break game
            // }
        } else if (onPlayPen) {
            out = placeCard(playpen,2)
        } else if (onPlayFinal){
            out = placeCard(playfinal, 2)
        } 
    } else {
        if (onOppHand){
            out = placeCard(opphand,2)
            // if(outcome > 0){
            //     break game
            // }
        } else if (onOppPen) {
            out = placeCard(opppen,2)
        } else if (onOppFinal){
            out = placeCard(oppfinal, 2)
        } 
    }
    console.log('out = ', out)
    if(out === 1){
        if (onPlayFinal && !onPlayHand && !onPlayPen){// final card was rejected
            //remove the card slot
            var chosenCard = document.getElementById('playfinal2')
            chosenCard.style.backgroundColor = "";
            //push card to playhand
            const index = searchCard(chosenCard,playfinal)
            playhand.push(playfinal[index])
            // remove the card from playfinal
            playfinal.splice(index,1)
            //playhand collects center
            collectCenter()

        } else {
            console.log('card is less than center card!')
            // if (playerTurn()){
             //     break game
             // }
             playerTurn()
        }
        
    }
    if(out ===0 || out === 10){
        endPlayerTurn()
    }
    if(out===2){
        playerTurn()
        
        /*
        break game
        determineWinner()
         */
    }
}
function chooseCard3(){
    var out = 0
    console.log("picked card 3, which is", document.getElementById('playhand3').getAttribute('data-value'))
    console.log('Turn over = ' + turnOver)
    if (!turnOver){
        console.log(onPlayHand,onPlayPen,onPlayFinal)
        if (onPlayHand){
            out = placeCard(playhand,3)
            // if(outcome > 0){
            //     break game
            // }
        } else if (onPlayPen) {
            out = placeCard(playpen,3)
        } else if (onPlayFinal){
            out = placeCard(playfinal, 3)
        } 
    } else {
        if (onOppHand){
            out = placeCard(opphand,3)
            // if(outcome > 0){
            //     break game
            // }
        } else if (onOppPen) {
            out = placeCard(opppen,3)
        } else if (onOppFinal){
            out = placeCard(oppfinal, 3)
        } 
    }
    console.log('out = ', out)
    if(out === 1){
        if (onPlayFinal && !onPlayHand && !onPlayPen){// final card was rejected
            //remove the card slot
            var chosenCard = document.getElementById('playfinal3')
            chosenCard.style.backgroundColor = "";
            //push card to playhand
            const index = searchCard(chosenCard,playfinal)
            playhand.push(playfinal[index])
            // remove the card from playfinal
            playfinal.splice(index,1)
            //playhand collects center
            collectCenter()

        } else {
            console.log('card is less than center card!')
            // if (playerTurn()){
             //     break game
             // }
             playerTurn()
        }
        
    }
    if(out ===0 || out === 10){
        endPlayerTurn()
    }
    if(out===2){
        playerTurn()
        /*
        break game
        determineWinner()
         */
    }
}
//created for event listener arg since it cannot take arguments itself
function placeCard(handContext, cardNum){
     //don't let player choose other cards 
     // console.log(handContext)
     const chosenCard = document.getElementById(varstrmap.get(handContext) + cardNum)
     //console.log("Player chose " + chosenCard.children[0].getAttribute('data-value'))
     const index = searchCard(chosenCard, handContext)
     var outcome = 3, rv = 0
     if(index>=0){
         !turnOver ? outcome = judgeCard(handContext[index], true) : outcome = judgeCard(handContext[index], false)
         if (outcome === 2){
             handContext.splice(index,1)
             rv = 2
         } else if (outcome === 1){
             return 1
         } else if(outcome === 10){
             console.log('back in place card now, center = ', center.cards)
             handContext.splice(index,1)
             rv = 10
         } else {
            center.collectSingle(handContext[index]) // place on center
            handContext.splice(index,1)//remove card from playhand
         }
         if (playhand.length<3 && onPlayHand && !onPlayPen && !onPlayFinal && !drawEmpty){
            playhand = drawCard(playhand)
         }
         //console.log(handContext)
     }
     //updates hand display
    chosenCard.children[0].replaceWith(playhand[index].getHTML())
    if (cardNum === 1){
         document.getElementById(varstrmap.get(handContext) + '2').children[0].replaceWith(playhand[index+1].getHTML())
         document.getElementById(varstrmap.get(handContext) + '3').children[0].replaceWith(playhand[index+2].getHTML())
     } else if(cardNum === 2){
        document.getElementById(varstrmap.get(handContext) + '3').children[0].replaceWith(playhand[index+1].getHTML())
     }
     updatePiles()
     return rv
}
function isSpecialCard(card){
    if (card.color === "golden"){
        return true
    }
    return false
}

function execute7(){
    past7 = true
}
function execute10(){
    for(let card of center.cards){
        console.log(card.toString)
    }
    trash.collectMultiple(center.cards)
    center.emptyDeck()
}
function judgeCard(card, isPlayer){
    const top = center.topCard
    console.log('Comparing top card ' + top.toString + ' to ' + card.toString) 
    if (past7){//last card was a 7 case
        //console.log("7 is in effect")
        if (vmap.get(card.value) < vmap.get("7")){
            //console.log('incoming card is < 7')
            center.collectSingle(card)
            past7 = false
            return 0
        } else if (isSpecialCard(card)){
            center.collectSingle(card)
            updatePiles()
            if (card.value === "2"){
                return execute2(isPlayer)
            } else if (card.value === "7"){
                execute7()
                return 0
            } else {
                execute10(card)
                return 10;
            }
        } else if (vmap.get(card.value) > vmap.get("7")){
            //console.log('incoming card is > 7, which should be blocked')
            return 1
        }
    }
    // special case trumps all
    if (isSpecialCard(card)){
        center.collectSingle(card)
        updatePiles()
        if (card.value === "2"){
            return execute2(isPlayer)
        } else if (card.value === "7"){
            execute7()
            return 0
        } else if (card.value === "10"){
            execute10()
            return 10
        }    
    }
    else if (vmap.get(card.value) > vmap.get(top.value)){ // ok
        //console.log(card.toString + ' > ' + top.toString)
        center.collectSingle(card)
        return 0
    } 
    else if (vmap.get(card.value) <= vmap.get(top.value)){
        //console.log(card.toString + ' < ' + top.toString + ' and be blocked')
        return 1
    }
}
function shiftLeft(){
    var card1 = document.getElementById('playhand1'), card2 = document.getElementById('playhand2'), card3 = document.getElementById('playhand3')
    var prev = searchCard(card1,playhand) - 1
    if (prev >= 0){
        card3.children[0].replaceWith(card2.children[0])
        card2.appendChild(card1.children[0])
        card1.appendChild(playhand[prev].getHTML())
        updateArrows()
    }
    document.getElementById('playhand1').addEventListener('click', chooseCard1)
    document.getElementById('playhand2').addEventListener('click', chooseCard2)
    document.getElementById('playhand3').addEventListener('click', chooseCard3)
}
function shiftRight(){
    var card1 = document.getElementById('playhand1'), card2 = document.getElementById('playhand2'), card3 = document.getElementById('playhand3')
    var next = searchCard(card3,playhand) + 1
    if (playhand.length-next >= 1){
        card1.children[0].replaceWith(card2.children[0])
        card2.appendChild(card3.children[0])
        card3.appendChild(playhand[next].getHTML())
        updateArrows()
    }
    document.getElementById('playhand1').addEventListener('click', chooseCard1)
    document.getElementById('playhand2').addEventListener('click', chooseCard2)
    document.getElementById('playhand3').addEventListener('click', chooseCard3)
}
function updateArrows(){
    var leftcounter = document.getElementById('cards-left-left'), rightcounter = document.getElementById('cards-left-right');
    var card1 = document.getElementById('playhand1'), card3 = document.getElementById('playhand3')
    var leftindex = searchCard(card1, playhand), rightindex = searchCard(card3, playhand)
    rightcounter.innerHTML = "&nbsp;" + (playhand.length - rightindex-1)
    leftcounter.innerHTML = leftindex
}
async function playerTurn(){
    if (playfinal.length + playpen.length + playhand.length + draw.size == 0){ // done
        playerWon=true
    } else {
        // console.log(playhand)
        // console.log(playpen)
        // console.log(playfinal)
        turnOver = false
        document.getElementById('collect-button').addEventListener('click',collectCenter)
        if (playhand.length>0){ // player hand case
            onPlayHand=true
            onPlayFinal=false
            onPlayPen=false
            document.getElementById('left-arrow').addEventListener('click',shiftLeft)
            document.getElementById('right-arrow').addEventListener('click', shiftRight)
            document.getElementById('playhand1').addEventListener('click', chooseCard1)
            document.getElementById('playhand2').addEventListener('click', chooseCard2)
            document.getElementById('playhand3').addEventListener('click', chooseCard3)
        } else if (drawEmpty && playhand.length ===0 && playpen.length>0 && playfinal.length>0){// play penultimate case
            onPlayHand=false
            onPlayFinal=false
            onPlayPen=true
            document.getElementById('playpen1').addEventListener('click', chooseCard1)
            document.getElementById('playpen2').addEventListener('click', chooseCard2)
            document.getElementById('playpen3').addEventListener('click', chooseCard3)
        } else if (drawEmpty && playhand.length ===0 && playpen.length === 0 && playfinal.length>0){//finalhand case
            onPlayHand=false
            onPlayPen=false
            onPlayFinal=true
            document.getElementById('playfinal1').addEventListener('click', chooseCard1)
            document.getElementById('playfinal2').addEventListener('click', chooseCard2)
            document.getElementById('playfinal3').addEventListener('click', chooseCard3)
        }
        playerWon=false
    }
}
function execute2(isPlayer){
    if(isPlayer && !turnOver){
        return 2
    } else {
        return 4
    }
    // else {
    //     if(oppTurn()){
    //         playerWon = false
    //         return 2;// someone won
    //     } else {
    //         return 0 
    //     }
    // }
}
function determineWinner(){
    playerWon ? alert("You have bested the machine! Give yourself a pat on the back") : alert('You lost. Tough break, buddy. Reload the page to try again')
}
game()

