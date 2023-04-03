let deckId;
let playerScore = 0;
let dealerScore = 0;
let cardCount = 0;


startNewGame();

// get and set the Play Button in Title Screen
const playGameButton = document.getElementById('play-game-btn');
playGameButton.addEventListener('click', function() {
   addImgTest()
   addImgTest()
});


const  hitBtn = document.getElementById('btn-hit');

hitBtn.addEventListener('click', function(){
   if (cardCount < 3){
      addImgTest();
   }
});

function addImgTest(){
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
         dContainerCard[cardCount].appendChild(backImg);
      
      
         // add front card img
         const frontImg = document.createElement('img');
         frontImg.src = "./resource/playing-cards/" + newCardSuit + "/" + newCard;
         frontImg.style = ImgStyle;
         frontImg.classList.add("front-animation");
         dContainerCard[cardCount].appendChild(frontImg);

         const pCardScore = document.getElementById('pc-score');
         pCardScore.innerHTML = playerScore;
         cardCount += 1;
   });
   
}


// new game button function
const newGameBtn = document.getElementById('btn-newgame');

newGameBtn.addEventListener('click', startNewGame());

function startNewGame(){
   cardCount = 0;
   playerScore = 0;
   dealerScore = 0;

   const dealerContainer = document.getElementById('player-cards');
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

}


// check winning state
function checkWin(){
   if (playerScore > 21){
      console.log('You Lost')
   } else if (playerScore > 21){
      console.log('You Lost')
   }
   
}



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