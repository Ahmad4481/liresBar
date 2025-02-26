const game = require("../module/gameStatus");
const player = require("../module/player");
const database = require("../config/db");
// const { Socket } = require("socket.io");
// const io = new Socket();
function turn(length, type = "next") {
  if (type === "next") {
    if (game.turn === length - 1) {
      game.turn = 0;
    } else {
      game.turn++;
    }
  } else if (type === "prev") {
    if (game.turn === 0) {
      game.turn = length - 1;
    } else {
      game.turn--;
    }
  }
  game.save();
}

function distributionCard() {
  let index = 0;
  for (let i = 0; i < game.playerInGame.length; i++) {
    game.playerInGame[i].index = index;
    index++;
  }
  let card =
    `ACE KING QUEEN ACE KING QUEEN ACE KING QUEEN ACE KING QUEEN ACE KING QUEEN ACE KING QUEEN JOCKER JOCKER`.split(
      " "
    );
  let randomCard = [];
  for (let i = 0; i < card.length; i++) {
    let index = Math.floor(Math.random() * card.length);
    randomCard.push(card[index]);
    card.splice(index, index + 1);
  }
  let randomRole = ["ACE", "KING", "QUEEN"];
  let randomDeaths = [true, true, true, true, true, false];
  game.roleCardInTurn =
    randomRole[Math.floor(Math.random() * randomRole.length)];
  for (let i = 0; i < game.playerInGame.length; i++) {
    game.playerInGame[i].card = randomCard.splice(0, 6);
    let playerRandomDeaths = randomDeaths.sort(() => Math.random() - 0.5);
    game.playerInGame[i].randomDeaths = playerRandomDeaths;
  }
  game.save();
}

async function playCard(id, cardsIndexs, lireChuser) {
  if (lireChuser === true) {
    if (checkCard()) {
      let deather = await game.playerInGame.find({ index: game.turn });
      if (deather.randomDeaths[0] === false) deather.isAlive = false;
      else await deather.randomDeaths.splice(0, 1);
    } else {
      while (game.playerInGame.find({ index: game.turn }).isAlive === 'false') {
        turn(game.playerInGame.length,'prev')
      }
      let deather = await game.playerInGame.find({ index: game.turn });
      if (deather.randomDeaths[0] === false) deather.isAlive = false;
      else await deather.randomDeaths.splice(0, 1);
    }
    if (!game.playerInGame.length-1) {
      game.status = 'end'
    }
    return;
  }
  let arr = [];
  let card = game.playerInGame[id].card;
  for (let i = 0; i < cardsIndexs.length; i++) {
    let cardi = game.playerInGame[id].card[cardsIndexs[i]];
    game.cardInTable = cardi;
    arr.push(cardsIndexs[i]);
  }
  for (let i = 0; i < arr.length; i++) {
    card.splice(arr[i], arr[i] + 1);
  }
  turn(game.playerInGame.length);
  while (game.playerInGame[game.turn].isAlive === false) {
    turn(game.playerInGame.length);
  }
  game.save();
}

function checkCard() {
  let card = game.cardInTable;
  for (let i = 0; i > card.length; i++) {
    if (card[i] !== game.roleCardInTurn && card !== "JOCKER") return false;
  }
  return true;
}
