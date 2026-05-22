const Device = require('../models/Device');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/errors');

async function findOwnedDevice(deviceId, ownerId) {
  const device = await Device.findById(deviceId);

  if (!device) {
    throw new AppError(404, 'device_not_found', 'Device not found');
  }

  if (device.owner.toString() !== ownerId) {
    throw new AppError(403, 'forbidden', 'You do not have access to this device');
  }

  return device;
}

const registerDevice = asyncHandler(async (req, res) => {
  const device = await Device.create({
    ...req.body,
    owner: req.user.id
  });

  res.status(201).json({ device: device.toJSON() });
});

const getDevices = asyncHandler(async (req, res) => {
  const devices = await Device.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({ devices: devices.map((device) => device.toJSON()) });
});

const getDevice = asyncHandler(async (req, res) => {
  const device = await findOwnedDevice(req.params.id, req.user.id);
  res.status(200).json({ device: device.toJSON() });
});

const updateDevice = asyncHandler(async (req, res) => {
  const device = await findOwnedDevice(req.params.id, req.user.id);

  for (const [key, value] of Object.entries(req.body)) {
    device[key] = value;
  }
  device.lastSeen = new Date();

  await device.save();
  res.status(200).json({ device: device.toJSON() });
});

const deleteDevice = asyncHandler(async (req, res) => {
  const device = await findOwnedDevice(req.params.id, req.user.id);
  await device.deleteOne();

  res.status(204).send();
});

module.exports = {
  deleteDevice,
  findOwnedDevice,
  getDevice,
  getDevices,
  registerDevice,
  updateDevice
};
