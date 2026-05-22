const Data = require('../models/Data');
const { findOwnedDevice } = require('./deviceController');
const { asyncHandler } = require('../utils/asyncHandler');

const addData = asyncHandler(async (req, res) => {
  const { deviceId, data } = req.body;
  const device = await findOwnedDevice(deviceId, req.user.id);

  const record = await Data.create({
    owner: req.user.id,
    deviceId: device._id,
    data
  });

  device.lastSeen = new Date();
  if (device.status === 'offline') {
    device.status = 'online';
  }
  await device.save();

  res.status(201).json({ record: record.toJSON() });
});

const getData = asyncHandler(async (req, res) => {
  await findOwnedDevice(req.params.deviceId, req.user.id);

  const records = await Data.find({
    owner: req.user.id,
    deviceId: req.params.deviceId
  }).sort({ timestamp: -1 });

  res.status(200).json({ records: records.map((record) => record.toJSON()) });
});

module.exports = { addData, getData };
