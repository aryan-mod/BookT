const mongoose = require('mongoose');
const crypto = require('crypto');

const REFRESH_TOKEN_DAYS =
  parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS, 10) || 7;

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.statics.createToken = async function (userId) {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  );
  await this.create({ token, userId, expiresAt });
  return { token, expiresAt };
};

refreshTokenSchema.statics.verifyAndDelete = async function (token) {
  const doc = await this.findOne({ token, expiresAt: { $gt: new Date() } });
  if (!doc) return null;
  await this.deleteOne({ _id: doc._id });
  return doc.userId;
};

refreshTokenSchema.statics.revokeByUserId = async function (userId) {
  await this.deleteMany({ userId });
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken;
