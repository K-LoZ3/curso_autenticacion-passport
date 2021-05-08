const joi = require('@hapi/joi');

// Esquema de id.
const userIdSchema = joi.string().regex(/^[0-9a-fA-F]{24}$/);

// Esquema del usuario.
const createUserSchema = {
  name: joi.string().max(100).required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  isAdmin: joi.boolean(),
}

module.exports = {
  userIdSchema,
  createUserSchema,
}