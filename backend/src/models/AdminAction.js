const mongoose = require('mongoose');

/**
 * Audit log for sensitive admin actions.
 * Used for compliance and security review.
 */
const adminActionSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    targetRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookRequest',
      default: null,
    },
    targetBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

adminActionSchema.index({ admin: 1, createdAt: -1 });
adminActionSchema.index({ action: 1, createdAt: -1 });

const AdminAction = mongoose.model('AdminAction', adminActionSchema);
module.exports = AdminAction;
