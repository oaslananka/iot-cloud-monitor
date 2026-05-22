const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      index: true
    },
    data: {
      type: Map,
      of: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      flattenMaps: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.owner = ret.owner.toString();
        ret.deviceId = ret.deviceId.toString();
        if (ret.data instanceof Map) {
          ret.data = Object.fromEntries(ret.data);
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

DataSchema.index({ owner: 1, deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('Data', DataSchema);
