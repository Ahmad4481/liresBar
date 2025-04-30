const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: false },
  email: { type: String, required: true },
  password: { type: String, required: true },
  gameCount: { type: Number, required: false },
  date: { type: Number, required: false},
  tokenToReset: { type: Number, required: false},
  socketId: {type: String, required: false},
  status: {type: String, enum: ['online', 'offline'], required: false}
});

PlayerSchema.pre('save', async function (next) {
  const player = this;

  // إذا لم تتغير كلمة المرور، انتقل للخطوة التالية
  if (!player.isModified('password')) return next();

  try {
    // توليد الـ salt بشكل غير متزامن
    const salt = await bcrypt.genSalt(10);
    
    // تشفير كلمة المرور
    player.password = await bcrypt.hash(player.password, salt);

    // المتابعة بعد التشفير
    next();
  } catch (err) {
    next(err); // في حال حدوث خطأ
  }
})


module.exports = mongoose.model('Player', PlayerSchema);