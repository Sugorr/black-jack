let deckId;
let playerScore = 0;
let dealerScore = 0;
let playerCardCount = 0;
let dealerCardCount = 0;
let gameState = false;



fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
   .then(response => response.json())
   .then(data => {
      deckId = data.deck_id;
});

// ====================================================================
// ====================================================================
// navigation buttons //
window.history.replaceState({ page: 'landing-page' }, 'landing-page', '#landing-page');
function updateContent(pageName) {
   const pages = document.getElementsByClassName('page');
   for (let p of pages) {
   p.classList.add('visually-hidden');
   }
      const currentPage = document.getElementById(pageName);
      currentPage.classList.remove('visually-hidden');
}

function navigate(pageName) {
   window.history.pushState({ page: pageName }, pageName, `#${pageName}`);
   updateContent(pageName);
}

window.addEventListener('popstate', function(e) {
   if (e.state) {
      updateContent(e.state.page);
      startNewGame();
   }
});


// ====================================================================
// ====================================================================
// PLAYER
function drawPlayerCard(){
   // Draw a card from the deck
   fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
      .then(response => response.json())
      .then(data => {
         const newCard = data.cards[0].value + '_of_' + data.cards[0].suit + '.png';
         const newCardSuit = data.cards[0].suit;

         if (data.cards[0].value === "JACK" || data.cards[0].value === "QUEEN" || data.cards[0].value === "KING"){
            playerScore += 10;
         } else if (data.cards[0].value === "ACE"){
            playerScore += 11;
         } else{
            playerScore += parseInt(data.cards[0].value);
         }

         const dealerContainer = document.getElementById('player-cards');
         const dContainerCard = dealerContainer.getElementsByClassName('container-card');
         const ImgStyle = "position: absolute; width: 140px; height: 180px; border-radius: 12px; transition: all 0.5s";
         
         // add back card img
         const backImg = document.createElement('img');
         backImg.src = "./resource/playing-cards/back-of-card.png";
         backImg.style = ImgStyle;
         backImg.classList.add("back-animation");
         dContainerCard[playerCardCount].appendChild(backImg);
      
      
         // add front card img
         const frontImg = document.createElement('img');
         frontImg.src = "./resource/playing-cards/" + newCardSuit + "/" + newCard;
         frontImg.style = ImgStyle;
         frontImg.classList.add("front-animation");
         dContainerCard[playerCardCount].appendChild(frontImg);

         const pCardScore = document.getElementById('pc-score');
         pCardScore.innerHTML = playerScore;

         playerCardCount += 1;

   });
}


// DEALER
function drawDealerCard(show = false){
   // Draw a card from the deck
   fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
      .then(response => response.json())
      .then(data => {
         const newCard = data.cards[0].value + '_of_' + data.cards[0].suit + '.png';
         const newCardSuit = data.cards[0].suit;

         if (data.cards[0].value === "JACK" || data.cards[0].value === "QUEEN" || data.cards[0].value === "KING"){
            dealerScore += 10;
         } else if (data.cards[0].value === "ACE"){
            dealerScore += 11;
         } else{
            dealerScore += parseInt(data.cards[0].value);
         }

         const dealerContainer = document.getElementById('dealer-cards');
         const dContainerCard = dealerContainer.getElementsByClassName('container-card');
         const ImgStyle = "position: absolute; width: 140px; height: 180px; border-radius: 12px; transition: all 0.5s";
         
         // add back card img
         const backImg = document.createElement('img');
         backImg.src = "./resource/playing-cards/back-of-card.png";
         backImg.style = ImgStyle;
         backImg.setAttribute("id", "back-card");
         dContainerCard[dealerCardCount].appendChild(backImg);
      
      
         // add front card img
         const frontImg = document.createElement('img');
         frontImg.src = "./resource/playing-cards/" + newCardSuit + "/" + newCard;
         frontImg.style = ImgStyle;
         frontImg.setAttribute("id", "front-card");
         dContainerCard[dealerCardCount].appendChild(frontImg);

         dealerCardCount += 1;

         if (show){
            revealDealerCard();
            checkWin();
         }
   });
}

function revealDealerCard(){
   const dCardScore = document.getElementById('dc-score');
   dCardScore.innerHTML = dealerScore;

   const dealerContainer = document.getElementById('dealer-cards');
   const dContainerCard = dealerContainer.getElementsByClassName('container-card');
   for (newImg of dContainerCard){
      const qImg = newImg.querySelectorAll('img');
      for (let i = 0; i < qImg.length; i++) {
         if (i === 0) {
            qImg[i].setAttribute('class','back-animation');
         } else if (i === 1) {
            qImg[i].removeAttribute('id');
            qImg[i].setAttribute('class','front-animation');
         }
         }
   }

}

function startNewGame(){
   conditionVisibility(false);
   gameState = false

   playerCardCount = 0;
   dealerCardCount = 0;
   playerScore = 0;
   dealerScore = 0;


   const playerContainer = document.getElementById('player-cards');
   const pContainer = playerContainer.getElementsByClassName('container-card');
   for (newImg of pContainer){
      const imgId = newImg.querySelectorAll('img');
      if (imgId === null){
         break;
      }
      for (i of imgId){
         newImg.removeChild(i);
      }
   }

   const dealerContainer = document.getElementById('dealer-cards');
   const dContainerCard = dealerContainer.getElementsByClassName('container-card');
   for (newImg of dContainerCard){
      const imgId = newImg.querySelectorAll('img');
      if (imgId === null){
         break;
      }
      for (i of imgId){
         newImg.removeChild(i);
      }
   }
   fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then(response => response.json())
      .then(data => {
         deckId = data.deck_id;
   });
   // every start, draw 2 cards for player and dealer
   drawPlayerCard();
   drawDealerCard();
   drawPlayerCard();
   drawDealerCard();

   // set game state to true
   gameState = true;
}



// check winning state
function checkWin(){
   conditionVisibility(true)

   const winningSection = document.getElementById('who-won');
   winningSection.innerHTML = getCondition();
}

function conditionVisibility(show = false){
   if (show){
      const winningContainer = document.getElementById('condition-container');
      winningContainer.classList.remove('visually-hidden');
      return
   }
   const winningContainer = document.getElementById('condition-container');
   winningContainer.classList.add('visually-hidden');
}

function getCondition() {
   if (playerScore === dealerScore) {
     return "It's a tie!";
   } else if (playerScore > 21) {
     return "Bust! Dealer wins!";
   } else if (dealerScore > 21) {
     return "Dealer busts! Player wins!";
   } else if (playerScore > dealerScore) {
     return "Player wins!";
   } else {
     return "Dealer wins!";
   }
}
 

// ====================================================================
// ====================================================================
// ====================================================================
// get and set the Play Button in Title Screen
const playGameButton = document.getElementById('play-game-btn');
playGameButton.addEventListener('click', function() {
   startNewGame();
});


const  hitBtn = document.getElementById('btn-hit');
hitBtn.addEventListener('click', function(){
   if (playerCardCount < 3 && gameState){
      drawPlayerCard();
      drawDealerCard(true);
   }
});

const  standBtn = document.getElementById('btn-stand');
standBtn.addEventListener('click', function(){
   if (gameState){
      gameState = false;
      if (dealerScore < 17){
         drawDealerCard(true);
      } else {
         revealDealerCard();
         checkWin();
      }
   }
});

// new game button function
const newGameBtn = document.getElementById('btn-newgame');
newGameBtn.addEventListener('click', function(){
   if (dealerCardCount >= 2 && playerCardCount >= 2){
      startNewGame();
   }
});
