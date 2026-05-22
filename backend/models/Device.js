const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120
    },
    type: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 80
    },
    location: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 160
    },
    status: {
      type: String,
      enum: ['offline', 'online', 'maintenance'],
      default: 'offline'
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.owner = ret.owner.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

DeviceSchema.index({ owner: 1, name: 1 });

module.exports = mongoose.model('Device', DeviceSchema);
