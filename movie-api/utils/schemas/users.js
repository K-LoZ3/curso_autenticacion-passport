const joi = require('@hapi/joi');

// Esquema de id.
const userIdSchema = joi.string().regex(/^[0-9a-fA-F]{24}$/);

// Esquema del usuario.
const userSchema = {
  name: joi.string().max(100).required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
}

// Este seria el user schema normal, El que usara todo usuario que cree uno.
const createUserSchema = {
  ...userSchema,
  isAdmin: joi.boolean(),
}

// Este es el schema para cuando inicien session con la cuenta de google o otros.
const createProviderUserSchema = {
  ...userSchema,
  apiKeyToken: joi.string().required(),
}

module.exports = {
  userIdSchema,
  createUserSchema,
  createProviderUserSchema,
}