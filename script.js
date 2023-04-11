let deckId;
let playerScore = 0;
let dealerScore = 0;
let playerCardCount = 0;
let dealerCardCount = 0;
let gameState = false;


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
      startNewGame();
   }
});

function startGameContainer() {
   let playerInfoContainer = document.getElementById("player-info-container");
   let startGameContainer = document.getElementById("startGame");
   
   playerInfoContainer.style.display = "none";
   startGameContainer.style.display = "block";
}

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
   conditionVisibility(false);
   gameState = false;
   
   playerCardCount = 0;
   dealerCardCount = 0;
   playerScore = 0;
   dealerScore = 0;


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

   // set game state to true
   gameState = true;
}



// check winning state
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
   if (gameState){
      drawPlayerCard();
      drawDealerCard(true)
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
      } return;
   }
});

// new game button function
const newGameBtn = document.getElementById('btn-newgame');
newGameBtn.addEventListener('click', function(){
   if (dealerCardCount >= 2 && playerCardCount >= 2){

      startNewGame();
   }
});

//////////////////////////////////
////////// reset button //////////
/////////////////////////////////
// function resetGame() {
//    // Reset game variables
//    playerScore = 0;
//    dealerScore = 0;
//    playerCardCount = 0;
//    dealerCardCount = 0;
//    gameState = false;

//    // Clear player cards
//    const playerContainer = document.getElementById('player-cards');
//    const pContainer = playerContainer.getElementsByClassName('container-card');
//    for (newImg of pContainer){
//       const imgId = newImg.querySelectorAll('img');
//       if (imgId === null){
//          break;
//       }
//       for (i of imgId){
//          newImg.removeChild(i);
//       }
//    }


//    // Clear dealer cards
//    const dealerContainer = document.getElementById('dealer-cards');
//    const dContainerCard = dealerContainer.getElementsByClassName('container-card');
//    for (newImg of dContainerCard){
//       const imgId = newImg.querySelectorAll('img');
//       if (imgId === null){
//          break;
//       }
//       for (i of imgId){
//          newImg.removeChild(i);
//       }
//    }

//    // Reset player score
//    const pCardScore = document.getElementById('pc-score');
//    pCardScore.innerHTML = '0';

//    // Reset dealer score
//    const dCardScore = document.getElementById('dc-score');
//    dCardScore.innerHTML = '0';

//    // Show start game container
//    startGameContainer();

// }

// function init() {

//    // Add event listener to reset button
//    const resetButton = document.getElementById('btn-reset');
//    resetButton.addEventListener('click', resetGame);
// }

// init();



////////////////////////////////////////////
//    Storage API for names and bets      //
////////////////////////////////////////////





////////////////////////////////////////////
//              Leaderboards              //
////////////////////////////////////////////
function getLeaderboardData() {
   const leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];
   return leaderboardData;
}

function renderLeaderboard() {
   const leaderboardData = getLeaderboardData();

   // Sort the array by score in descending order
   leaderboardData.sort((a, b) => b.score - a.score);

   // Clear the table body before re-rendering
   document.querySelector('#leaderboard tbody').innerHTML = '';

   // Iterate through the sorted array and dynamically create rows in the table
   leaderboardData.forEach((player, index) => {
      const row = document.createElement('tr');
      const rankCell = document.createElement('td');
      const nameCell = document.createElement('td');
      const scoreCell = document.createElement('td');

      rankCell.innerText = index + 1;
      nameCell.innerText = player.name;
      scoreCell.innerText = player.score;

      row.appendChild(rankCell);
      row.appendChild(nameCell);
      row.appendChild(scoreCell);

      document.querySelector('#leaderboard tbody').appendChild(row);
   });
}

function addPlayerToLeaderboard(playerName, playerScore) {
   const leaderboardData = getLeaderboardData();
   const newPlayer = {
      name: playerName,
      score: playerScore
   };
   leaderboardData.push(newPlayer);
   localStorage.setItem('leaderboard', JSON.stringify(leaderboardData));
   renderLeaderboard();
}

const newPlayerForm = document.querySelector('#new-player-form');
newPlayerForm.addEventListener('submit', event => {
   event.preventDefault();
   const playerName = document.querySelector('#name-input').value;
   const playerScore = document.querySelector('#score-input').value;
   addPlayerToLeaderboard(playerName, playerScore);
   newPlayerForm.reset();
});

// Render the leaderboard on page load
renderLeaderboard();


