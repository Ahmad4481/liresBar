const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  players: { type: Array, required: true },
})