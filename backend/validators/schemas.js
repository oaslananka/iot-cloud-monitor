const { z } = require('zod');

const { isValidObjectId } = require('../utils/ids');

const objectId = z.string().trim().refine(isValidObjectId, {
  message: 'Invalid ObjectId'
});

const registerUserBody = z
  .object({
    name: z.string().trim().min(1).max(80),
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(12).max(128)
  })
  .strict();

const loginUserBody = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(128)
  })
  .strict();

const deviceCreateBody = z
  .object({
    name: z.string().trim().min(1).max(120),
    type: z.string().trim().min(1).max(80),
    location: z.string().trim().min(1).max(160),
    status: z.enum(['offline', 'online', 'maintenance']).optional()
  })
  .strict();

const deviceUpdateBody = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    type: z.string().trim().min(1).max(80).optional(),
    location: z.string().trim().min(1).max(160).optional(),
    status: z.enum(['offline', 'online', 'maintenance']).optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required'
  });

const idParam = z.object({
  id: objectId
});

const deviceIdParam = z.object({
  deviceId: objectId
});

const telemetryBody = z
  .object({
    deviceId: objectId,
    data: z
      .record(z.string().min(1).max(80), z.number().finite())
      .refine((value) => Object.keys(value).length > 0, {
        message: 'Telemetry data must include at least one numeric reading'
      })
  })
  .strict();

module.exports = {
  deviceCreateBody,
  deviceIdParam,
  deviceUpdateBody,
  idParam,
  loginUserBody,
  registerUserBody,
  telemetryBody
};
