const SUITS = ["♠","♥","♦","♣"];
const VALUES = "A,2,3,4,5,6,7,8,9,10,J,Q,K".split(",");

export default class Deck {
    constructor(cards = generateDeck()){
        this.cards = cards;
    }
    emptyDeck(){
        this.cards.splice(0,this.cards.length)
    }
    shuffle(){
        for (let i = this.size-1; i>0; i--){
            //get a random card to swap with
            const target = Math.floor(Math.random() * (i+1));
            //swap with the random card
            const oldValue = this.cards[target];//save the random card's value
            this.cards[target] = this.cards[i];//set the random card's value to this card's value
            this.cards[i] = oldValue;//set this card's value to the saved random card value
        }
    }
    //size of the deck tends to be referenced a lot, so this is a getter for that
    get size(){
        return this.cards.length;
    }
    get topCard(){
        return this.cards[0]
    }
    collectMultiple(cards){
        this.cards = [...this.cards,...cards]
    }
    collectSingle(card){
        this.cards.unshift(card)
    }
    remove(card){
        const index = this.cards.indexOf(card)
        if (index > -1){
            this.cards.splice(index,1)
        }
    }
}

class Card {
    constructor(suit, value){
        this.suit = suit;
        this.value = value;
    }
   
    get color(){
        if (this.value === "7" || this.value === "10" || this.value === "2") {
            return "golden";
        } else if (this.suit==="♠" || this.suit==="♣"){
            return "black";
        } else{
            return "red";
        } 
    }
    getHTML(){//return an card as an html element with this format: <div class="card ${color}" data-value="${value} ${suit}">${suit}</div>
        const cardElement = document.createElement('div');
        cardElement.innerText = this.suit;
        cardElement.classList.add('card',this.color);
        cardElement.dataset.value = `${this.value} ${this.suit}`;
        return cardElement;
    }
    get toString(){
        return this.value + " " + this.suit 
    }
}
function generateDeck(){
    return SUITS.flatMap(suit => {
        return VALUES.map(value => {
            return new Card(suit, value);
        });
    });
}
