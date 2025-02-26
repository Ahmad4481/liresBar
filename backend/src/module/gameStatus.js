const mongoose = require("mongoose");
const player = require("./player");

const GameStatusSchema = new mongoose.Schema({
  turn: { type: String, required: true },
  cardInTable: { type: Array },
  pause: { type: Boolean },
  playerInGame: [
    {
      id: { type: String, required: true },
      card: { type: Array },
      randomDeaths: { type: [Boolean], required: true, length: 6 },
      micStatus: { type: Boolean },
      index: { type: Number },
      isAlive: { type: Boolean, default: true }
    },
  ],
  roleCardInTurn: { type: Array, enum: ["ACE", "KING", "QUEEN"] },
});

const GameStatus = mongoose.model("GameStatus", GameStatusSchema);

// GameStatus.pre("save", async function (next) {
//   if (!this.id) {
//     const lastUser = await GameStatus.playerInGame.findOne().sort({ id: -1 });
//     this.index = lastUser ? lastUser.id + 1 : 0; // إذا كان أول إدخال، يبدأ من 0
//   }
//   next();
// });

module.exports = GameStatus;
