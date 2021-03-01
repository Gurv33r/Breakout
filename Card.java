
public class Card implements Comparable{
    //instance variables
    private String suit="", cardName="";
    private int value=0;
    private boolean isFaceCard, faceDown;

    //Nested Exception class meant to enforce difference between face up and face down cards
    private class FacedownCardException extends Exception{
        public FacedownCardException() {
            super("Card is face down!");
        }
        public FacedownCardException(String err){
            super(err);
        }
    }

    //constructors
    /**
     * Empty constuctor, not meant to be used in code, but to deter JVM from calling Object()
     * Do not create a Card without supplying values
     * @throws IllegalArgumentException
     */
    public Card() throws IllegalArgumentException{
        throw new IllegalArgumentException("You can't create a Card that doesn't have any values!");
    }

    /**
     * Main constructor for a Card. Will print what the Card was.
     * @param suit
     * @param value
     */
    public Card(String suit, String value){
        String suitName="", valueName="";
        //Assign fields
        this.suit = suit;
        if(value.compareTo("K")==0){
            isFaceCard = true;
            this.value = 13;
            valueName = "King";
        }
        if(value.compareTo("Q")==0){
            isFaceCard = true;
            this.value = 12;
            valueName = "Queen";
        }
        if(value.compareTo("J")==0){
            isFaceCard = true;
            this.value = 11;
            valueName = "Jack";
        }
        if(value.compareTo("A")==0){
            this.value = 14;
            valueName = "Ace";
        }
        else{
            this.value = Integer.parseInt(value);
        }

        //Print out Card Name
        if(this.suit.compareTo("C")==0){
            suitName = "Clubs";
        }
        if(this.suit.compareTo("H")==0){
            suitName = "Hearts";
        }
        if(this.suit.compareTo("S")==0){
            suitName = "Spades";
        }
        if(this.suit.compareTo("D")==0){
            suitName = "Diamonds";
        }
        this.cardName = suitName + " of " + valueName;
        System.out.println("Created a " + cardName);
    }

    //immutable encapsulation
    /**
     * Getter for value instance of Card. Will not return the value if the card is face down
     * @return value
     * @throws FacedownCardException
     */
    public int getValue() throws FacedownCardException{
        if(faceDown)
            throw new FacedownCardException();
        return value;
    }

    /**
     * Getter for suit instance of Card. Will not return the suit if the card is face down
     * @return suit
     * @throws FacedownCardException
     */
    public String getSuit() throws FacedownCardException {
        if(faceDown)
            throw new FacedownCardException();
        return suit;
    }

    /**
     * Sets facedown to opposite of its current value, essentially flipping the card
     */
    public void flipCard() {
        this.faceDown = !faceDown;
    }

    /**
     * Getter for isFaceCard, mainly used for how the card will appear
     * @return isFaceCard
     */
    public boolean isFaceCard() {
        return isFaceCard;
    }

    /**
     * Getter for facedown, i.e. checks if card is face down or not
     * @return faceDown
     */
    public boolean isFaceDown() {
        return faceDown;
    }

    //helper methods

    /**
     * Word form of the card. Meant for debugging and how the card will appear
     * @return cardName
     */
    public String toString(){
        return cardName;
    }

    /**
     * Implementation of compareTo(), meant for sorting/shuffling and comparing in game
     * @param o
     * @return
     */
    public int compareTo(Object o){
        Card that = (Card) o;
        try{
            if(this.getValue() > that.getValue())
                return 1;
            else if (this.getValue() < that.getValue())
                return -1;
        }
        catch (FacedownCardException e){
            throw new RuntimeException("One of these cards are face down and thus, they cannot be compared!", e);
        }
        return 0;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Card)) return false;
        Card that = (Card) o;

        try{
            return this.getValue() == that.getValue();
        }
        catch(FacedownCardException e){
            throw new RuntimeException("One of these cards are face down and thus, they cannot be compared!", e);
        }
    }
}
