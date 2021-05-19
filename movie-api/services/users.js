const MongoLib = require('../lib/mongo');
// Para encriptar las contraseñas.
const bcrypt = require('bcrypt');

class UsersService {
  // Inicializamos mongo.
  constructor() {
    // Definimos la coleccion a usar en este servicio para no hacer estas
    // peticiones a la coleccion de la movies.
    this.collection = 'users';
    this.mongoDB = new MongoLib();
  }

  // Para pedir el usuario a la base de datos.
  async getUser({ email }) {
    // Buscamos el email y de el sacamos todo el usuario.
    const [ user ] = await this.mongoDB.getAll(this.collection, { email });
    return user;
  }

  // Para crear el usuario.
  async createUser({ user }) {
    // Destructuramos el usuario.
    const { name, email, password } = user;
    // Encriptamos la contraseña.
    const hashedPassword = await bcrypt.hash(password, 10);
    // Creamos el usuario dentro de la coleccion 'user' que es la que tenemos en el constructor.
    const createUserId = await this.mongoDB.create(this.collection, {
      name,
      email,
      password: hashedPassword,
    });

    // Devolvemos el id del usuario que es el que nos devuelve mongo al crear un usuario.
    return createUserId;
  }

  async getOrCreateUser({ user }) {
    // Buscamos si el usuario esta en la base de datos.
    const queriedUser = await this.getUser({ email: user.email });

    // Si este existe retornamos el resultado.
    if (queriedUser) {
      return queriedUser;
    }

    // Creamos el user si este no existe.
    await this.createUser({ user });
    return await this.getUser({ email: user.email }); // Buscamos el user recien creado y retornamos su resultado.
  }
}

module.exports = UsersService;