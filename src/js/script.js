import Deck from "./deck.js";
import vmap from "./values.js";

var cardSlots = document.getElementsByClassName('computer-card-slot');
var oppfinal=new Array(3),opppen=new Array(3),playfinal=new Array(3),playpen=new Array(3);
var opphand=[], playhand=[],center=new Deck(),trash=new Deck();
var past7=false, drawEmpty = true;
center.emptyDeck();
trash.emptyDeck();

const draw = new Deck();
draw.shuffle();

function game(){
    dealCards()
    // while(true){
    //     if(playerTurn()){
    //         console.log("Player Wins! :)")
    //         break
    //     }
    //     if(oppTurn()){
    //         console.log("Player Loses! :(")
    //     }
    // } 
    playerTurn()
}

function searchCard(cardElement,hand){
    for(var i = 0; i<hand.length;i++){
        if (cardElement.children[0].dataset.value === hand[i].toString){
            return i
        }
    }
}
function updatePiles(){
    var drawSize = document.getElementById('draw');
    var trashSize = document.getElementById('trash');
    var centerPile = document.getElementById('center');
    drawSize.innerHTML = draw.size;
    if(drawSize.innerHTML === "0"){
        drawEmpty = true
    }
    trashSize.innerHTML = trash.size;
    centerPile.appendChild(center.topCard.getHTML());
    updateArrows()
}
function dealCards(){
    for (var i=0; i<18;i++){
        //deal off the top of the deck
        let dealtCard = draw.cards.shift();
        //cardSlots[i].appendChild(dealtCard.getHTML());
        if(i<=2){//oppfinal
            oppfinal[i] = dealtCard;
        } else if(i>2 && i<6){ //opppen
            opppen[i-3] = dealtCard;
        } else if (i>5 && i<9){//opphand
            opphand.push(dealtCard);
        } else if (i>8 && i<12){
            playfinal[i-9] = dealtCard;
        } else if (i>11 && i<15){
            playpen[i-12] = dealtCard;
        } else {
            playhand.push(dealtCard);   
        }
    }
    for (var i=0;i<3;i++){
        document.getElementById('oppfinal' + (i+1)).appendChild(oppfinal[i].getHTML())
        
    }
    console.log(oppfinal)
    for (var i=0;i<3;i++){
        document.getElementById('opppen' + (i+1)).appendChild(opppen[i].getHTML())
        
    }
    console.log(opppen)
    for (var i=0;i<3;i++){
        document.getElementById('opphand' + (i+1)).appendChild(opphand[i].getHTML())
        
    }
    console.log(opphand)
    for (var i=0;i<3;i++){
        document.getElementById('playhand' + (i+1)).appendChild(playhand[i].getHTML())
        
    }
    console.log(playhand)
    for (var i=0;i<3;i++){
        document.getElementById('playpen' + (i+1)).appendChild(playpen[i].getHTML())
        
    }
    console.log(playpen)
    for (var i=0;i<3;i++){
        document.getElementById('playfinal' + (i+1)).appendChild(playfinal[i].getHTML())
        
    }
    console.log(playfinal)
    const startingCard = draw.cards.shift();
    center.cards.unshift(startingCard);
    updatePiles();
}
//created for event listener arg since it cannot take arguments itself
function placeCard1(name){
     console.log('clicked card1')
     //don't let player choose other cards 
     document.getElementById('playhand2').removeEventListener('click',placeCard2)
     document.getElementById('playhand3').removeEventListener('click',placeCard3)
     //remove card from playhand
     const chosenCard = document.getElementById('playhand1').children[0]
     console.log()
     const outcome = judgeCard(chosenCard)
     const index = playhand.indexOf(chosenCard)
     if(index>=0){
         center.collect(playhand.splice(index,1)[0])
     }
     if (playhand.length<3){
         if (!drawEmpty){
             playhand.push(draw.cards.shift())
             updatePiles()  
         }
     }
     return
}
//created for event listener arg since it cannot take arguments itself
function placeCard3(){
     console.log('clicked card3')
     //don't let player choose other cards 
     document.getElementById('playhand2').removeEventListener('click',placeCard2)
     document.getElementById('playhand1').removeEventListener('click',placeCard1)
}
//created for event listener arg since it cannot take arguments itself
function placeCard2(){
    console.log('clicked card2')
     //don't let player choose other cards 
     document.getElementById('playhand1').removeEventListener('click',placeCard1)
     document.getElementById('playhand3').removeEventListener('click',placeCard3)
}
function isSpecialCard(card){
    if (card.color === "golden"){
        return true
    }
    return false
}
function execute2(){
    if (isPlayer){
        if(playerTurn()){
            return 2;// someone won
        } else {
            return 0
        }
    } else {
        if(oppTurn()){
            return 2;// someone won
        } else {
            return 0 
        }
    }
}
function execute7(){
    past7 = true
}
function execute10(){
    trash.collect(center)
    center = emptyDeck()
}
function judgeCard(card, isPlayer){
    let top = center.topCard
    if (past7){//last card was a 7 case
        if (vmap.get(card.value) > vmap.get("7")){
            center.collect(card)
            past7 = false
            return 0
        } else if (isSpecialCard(card)){
            center.collect(card)
            if (card.value === "2"){
                return execute2()
            } else if (card.value === "7"){
                execute7()
                return 0
            } else {
                execute10()
                return 0;
            }
        }
    }
    // special case trumps all
    if (isSpecialCard(card)){
        center.collect(card)
        if (card.value() === "2"){
            return execute2()
        } else if (card.value === "7"){
            execute7()
            return 0
        } else if (card.value === "10"){
            execute10()
            return 0
        }    
    }
    else if (vmap.get(card.value) > vmap.get(top.value)){ // ok
        center.collect(card)
        return 0
    }
}
function shiftLeft(){
    var leftcounter = document.getElementById('card-left-left'), rightcounter = document.getElementById('card-left-right'),card1 = document.getElementById('playhand1'), card2 = document.getElementById('playhand2'), card3 = document.getElementById('playhand3')
    //find index of card 1 in playhand
    const index = playhand.indexOf(card1.children[0])

    if (index <0){
        console.log("card 1 not in playhand!")
    } else if (index === 0){
        alert("No more cards on the left!")
    } else {
        card3.children[0] = card2.children[0]
        card2.children[0] = card1.children[0]
        card1.children[0] = playhand[index-1]
        leftcounter--
        rightcounter++
    }
}
function shiftRight(){
    var card1 = document.getElementById('playhand1'), card2 = document.getElementById('playhand2'), card3 = document.getElementById('playhand3')
    //find index of card 1 in playhand
    for(var i = 0; i<playhand.length-1;i++){
        if (card3.children[0].dataset.value === playhand[i].toString){
            console.log( card3.children[0].dataset.value + " in playhand!")
            if(playhand.length-i>=1){
                card1.children[0].replaceWith(card2.children[0])
                card2.appendChild(card3.children[0])
                card3.appendChild(playhand[i+1].getHTML())
                updateArrows()
                break
            }
        }
    }
    updateArrows()
}
function updateArrows(){
    var leftcounter = document.getElementById('cards-left-left'), rightcounter = document.getElementById('cards-left-right');
    var card1 = document.getElementById('playhand1'), card3 = document.getElementById('playhand3')
    var leftindex = searchCard(card1, playhand), rightindex = searchCard(card3, playhand)
    rightcounter.innerHTML = "&nbsp;" + (playhand.length - rightindex)
    console.log(rightcounter.innerHTML)
    leftcounter.innerHTML = leftindex
}
function playerTurn(){
    if (playfinal.length + playpen.length + playhand.length + draw.size == 0){ // done
        return 
    } else {

        // TODO: after identifying hand, check if they can even play a card,
    
        var done = false, canPlay = true, card1=false, card2=false,card3=false;
        // identify which hand player is playing with
        // then set event listeners on the 3 card slots
        if (playhand.length>0){ // player hand case
            playhand.push(draw.cards.shift())
            playhand.forEach((card)=>{
                console.log(card)
            })
            
            //check if player can play a card
            for(var i = 0; i<playhand.length; i++){
                if (vmap.get(playhand[i].value) > vmap.get(center.topCard.value)){
                    canPlay = true
                    break
                }
            }
            if(canPlay){
                console.log("player can play! " + playhand.length)
                document.getElementById('left-arrow').addEventListener('click',shiftLeft)
                document.getElementById('right-arrow').addEventListener('click', shiftRight)
                document.getElementById('playhand1').addEventListener('click', placeCard1)
            } else {
                console.log("collected " + center.size + " cards into player's hand")
                playhand = playhand.concat(center.cards)
                updateHand('playhand', playhand)
                center.emptyDeck()
                updatePiles()
                done = true
            }
            
            
        }

        // } else if (draw.size===0 && playhand.length ===0 && playpen.length>0 && playfinal>0){// play penultimate case

        // }
        //finalhand case
        //
        //set event listeners
        if(done){
            updatePiles()
        }
        
    }
}
game()