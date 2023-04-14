
let deckId;
let playerScore = 0;
let dealerScore = 0;
let playerCardCount = 0;
let dealerCardCount = 0;
let gameState = false;

let won = false;
let lost = false;
let tie = false;
let playerCurrentMoney = 200;
let onBetMoney = 0;


async function drawDeck(){
   fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then(response => response.json())
      .then(async data => {
         deckId = await data.deck_id;
   });
}

drawDeck();


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
   }
});

window.addEventListener('load', function() {
   const highestScore = localStorage.getItem('highest-score');
   updateHighscore(highestScore);
});


// ====================================================================
// ====================================================================
// PLAYER
function drawPlayerCard(){
   // Draw a card from the deck
   fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
      .then(response => response.json())
      .then(async data => {
         const newCard = await data.cards[0].value + '_of_' + data.cards[0].suit + '.png';
         const newCardSuit = await data.cards[0].suit;

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
   const highestScore = localStorage.getItem('highest-score');
   updateHighscore(highestScore);
   
   conditionVisibility(false);
   gameState = false;
   won = false;
   
   playerCardCount = 0;
   dealerCardCount = 0;
   playerScore = 0;
   dealerScore = 0;
   btnBetValue.value = '';


   // get and deletes all the cards of the PLAYER
   const playerContainer = document.getElementById('player-cards');
   const pContainerCard = playerContainer.getElementsByClassName('container-card');
   for (newImg of pContainerCard){
      const imgId = newImg.querySelectorAll('img');
      if (imgId === null){
         break;
      }
      for (i of imgId){
         newImg.removeChild(i);
      }
   }

   // get and deletes all the cards of the DEALER
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

   // draw a new set of cards
   drawDeck();

   // every start, draw 2 cards for player and dealer
   drawPlayerCard();
   drawPlayerCard();
   drawDealerCard();
   drawDealerCard();

   updateResetBet();
}


// =====
// Check Winning State
// =====
function checkWin(){
   conditionVisibility(true)
   
   const winningSection = document.getElementById('who-won');
   winningSection.innerHTML = getCondition();
   gameState = false;
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
   disableHitStandButton();
   if (playerScore === dealerScore) {
      won = true;
      tie = true;
      updateWonBet();
      return "It's a tie! The Game Will Continue.";
   } else if (playerScore > 21) {
      won = false;
      updateResetBet();
      if (playerCurrentMoney === 0){
         lost = true;
         return "Dealer wins! Start A New Game";
      }
      return "You're Busted! Dealer wins!";
   } else if (dealerScore > 21) {
      won = true;
      updateWonBet();
      return "Player wins! Dealer busts! The Game Will Continue.";
   } else if (playerScore > dealerScore) {
      won = true;
      updateWonBet();
      return "Player wins! The Game Will Continue.";
   } else {
      won = false;
      updateResetBet();
      if (playerCurrentMoney === 0){
         lost = true;
         return "Dealer wins! Start A New Game";
      }
      return "Dealer wins!";
   }
} 

// set the value of bet and current money
const btnBet = document.getElementById('btn-bet');
const btnBetInput = document.getElementById('btn-bet-input');
const btnBetValue = document.getElementById('btn-bet-value');

const moneyValue = document.getElementById('money-value');

function updateMaxBet(){
   btnBetInput.setAttribute("max", playerCurrentMoney);
}

function updatePlaceBet(){
   onBetMoney = btnBetInput.value;
   playerCurrentMoney -= onBetMoney;
   btnBetInput.value = 0;
   moneyValue.innerText = playerCurrentMoney;
   btnBetValue.innerText = onBetMoney;
   updateMaxBet();
}

function updateWonBet(){
   if (!tie){
      playerCurrentMoney += (onBetMoney * 2);
   } else {
      playerCurrentMoney += onBetMoney;
      tie = false;
   }
   updateResetBet();
}

function updateResetBet(){
   onBetMoney = 0;
   btnBetInput.value = 0;
   moneyValue.innerText = playerCurrentMoney;
   btnBetValue.innerText = onBetMoney;
   updateMaxBet();
}

function resetMoneyBet(){
   onBetMoney = 0;
   playerCurrentMoney = 200;
   btnBetInput.value = 0;
   moneyValue.innerText = playerCurrentMoney;
   btnBetValue.innerText = onBetMoney;
   updateMaxBet();
}

function enableBetButtons(){
   const controlBtn = document.querySelectorAll('.control-btn');
   for (btn of controlBtn){
      btn.disabled = true;
      btn.classList.add('disabled-btn');
   }
   btnBet.disabled = false;
   btnBet.classList.remove('disabled-btn');
   btnBetInput.disabled = false;
}

function disableHitStandButton(){
   hitBtn.disabled = true;
   hitBtn.classList.add('disabled-btn');
   standBtn.disabled = true;
   standBtn.classList.add('disabled-btn');
}

// storage api usage ===
function updateHighscore(highscore){
   const scoreText = document.getElementById('highest-value');
   scoreText.textContent = `${highscore}`;
}

function getScore(){
   const highscoreTemp = localStorage.getItem('highest-score') || 0;
   console.log(highscoreTemp);;
   const scoreTemp = playerCurrentMoney;
   if (scoreTemp > highscoreTemp){
      localStorage.setItem('highest-score', scoreTemp);
      updateHighscore(scoreTemp);
   }
}

// ====================================================================
// ====================================================================
// get and set the Play Button in Title Screen
const playGameButton = document.getElementById('play-game-btn');
playGameButton.addEventListener('click', function() {
   playerCurrentMoney = 200;
   startNewGame();
});

// hit button function
const  hitBtn = document.getElementById('btn-hit');
hitBtn.addEventListener('click', function(){
   if (gameState){
      drawPlayerCard();
      drawDealerCard(true)
      newGameBtn.disabled = false;
      newGameBtn.classList.remove('disabled-btn');
   }
});

// stand button function
const  standBtn = document.getElementById('btn-stand');
standBtn.addEventListener('click', function(){
   newGameBtn.disabled = false;
   newGameBtn.classList.remove('disabled-btn');
   if (gameState){
      gameState = false;
      if (dealerScore < 17){
         drawDealerCard(true);
      } else {
         revealDealerCard();
         checkWin();
      } return;
   }
});

// new game button function
const newGameBtn = document.getElementById('btn-reset');
newGameBtn.addEventListener('click', function(){
   getScore();
   if (playerCurrentMoney === 0){
      alert('NEW GAME');
      navigate('landing-page');
   }
   if (dealerCardCount >= 2 && playerCardCount >= 2){
      startNewGame();
      enableBetButtons();
   }
});

btnBet.addEventListener('click', function(){
   if (btnBetInput.value <= playerCurrentMoney && btnBetInput.value > 0){
      updatePlaceBet();
      // enable play buttons and disable bet-btn after betting
      const controlBtn = document.querySelectorAll('.control-btn');
      for (btn of controlBtn){
         btn.disabled = false;
         btn.classList.remove('disabled-btn');
      }
      newGameBtn.disabled = true;
      newGameBtn.classList.add('disabled-btn');
      btnBet.disabled = true;
      btnBet.classList.add('disabled-btn');
      btnBetInput.disabled = true;
      gameState = true;
   }
});

// ====================================================================
// ====================================================================



