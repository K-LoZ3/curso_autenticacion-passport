// Para conectarnos a mongoDB.
const MongoLib = require('../lib/mongo');

// El servicio.
class ApiKeysService {
  constructor() {
    this.collection = 'api-keys'; // La coleccion a la que nos conectaremos.
    this.mongoDB = new MongoLib(); // La clase para obtener las funciones.
  }

  // Para pedir las api-keys o lo que seria el alcance para cada tipo de user.
  async getApiKey({ token }) {
    // Buscamos dentro de la base de datos el token que queremos y lo retornamos.
    const [ apiKey ] = await this.mongoDB.getAll(this.collection, { token });
    return apiKey; // Devolvemos el apiKey.
  }
}

//exportamos.
module.exports = ApiKeysService;