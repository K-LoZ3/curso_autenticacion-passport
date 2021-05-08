// Importamos mongo para poder usar las configuraciones de cliente de mongo db.
// ObjectId sera usado en la siguiente clase.
const { MongoClient, ObjectId } = require('mongodb');
const { config } = require('../config'); // Importamos las configuraciones para tener acceso a las variables de entorno.

// Con encodeURIComponent aseguramos que si hay algunos caracteres expeciales no tengamos problemas al conectarnos.
const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const DB_NAME = config.dbName;

const MONGO_URI = `mongodb+srv://${USER}:${PASSWORD}@${config.dbHost}:${config.port}/${DB_NAME}?retryWrites=true&w=majority`;

class MongoLib {
  constructor() {
    // Definimos el cliente.
    this.client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    this.dbName = DB_NAME; // Definimos el nombre de la base de datos.
  }

  // Usamos un singleton para la coneccion.
  // De esta manera, si hay una coneccion, esto devolvera la misma coneccion o creara una de lo contrario.
  connect() {
    // Como .connection no lo definimos dentro de la clase, esta funciona como una variable estatica.
    if (!MongoLib.connection) {
      // Con promesas hacemos la peticion de conneccion y esperamos que connecte.
      MongoLib.connection = new Promise((resolve, reject) => {
        this.client.connect(err => {
          if (err) {
            reject(err); // Manejamos el error si lo hay.
          }

          // Dejamos un mensaje si conecta.
          console.log('Connected succesfully to mongo.');
          // Retornamos la coneccion.
          resolve(this.client.db(this.dbName));
        });
      });
    }

    // Retornamos la coneccion si existe o si esta es creada.
    return MongoLib.connection;
  }

  // Creamos las funciones para trabajar con la base de datos.
  getAll(collection, query) { // devuelve toda la coleccion.
    // El connect o coneccion es una promesa.
    return this.connect().then(db => {
      // Usando la base de datos accedemos a la coleccion, le pasamos la coleccion para que sepa cual usamos
      // y buscamos con query en la base de datos o coleccion, por ultimo convertimos a array para trabajarlo
      // con json.
      return db.collection(collection).find(query).toArray();
    });
  }

  get(collection, id) {
    return this.connect().then(db => {
      // Dentro de la coleccion buscamos por la id.
      return db.collection(collection).findOne({ _id: ObjectId(id) });
    });
  }

  create(collection, data) {
    return this.connect().then(db => {
      // Insertamos la data.
      return db.collection(collection).insertOne(data);
    }).then(result => result.insertedId);
  }

  update(collection, id, data) {
    return this.connect().then(db => {
      // Para actualizar lo hacemos buscando por la id, son $set actualizamos el valor con la data y con
      // upsert le decimos que actualize o inserte dependiendo de la necesidad.
      return db.collection(collection).updateOne({ _id: ObjectId(id) }, { $set: data }, { upsert: true });
    }).then(result => result.insertedId || id);
  }

  delete(collection, id) {
    return this.connect().then(db => {
      // Borramos con ayuda del id.
      return db.collection(collection).deleteOne({ _id: ObjectId(id) });
    }).then(() => id);
  }
}

// Exportamos la clase.
module.exports = MongoLib; 