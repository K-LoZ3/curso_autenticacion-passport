const express = require('express');
const supertest = require('supertest'); // 

// Este sera el servidor de pruebas.
// Funcionara como si fura el index.js principal ya que estariamos evitando ejecutar:
/* 
// Usamos la funcion para manejar el router o ruta /api/movies
moviesApi(app); // Routes.
*/
// Con esto no levantamos todo lo que tiene el server original, sino que solo sera un
// server muy pequeño que tendra lo necesario para hacer los test.
function testServer(route) {
  const app = express(); // Esta es una nueva app que sera diferente de la principal.
  route(app); // A esta app le pasamos o incluimos la ruta que usaremos en el test que vendra por parametro.
  return supertest(app); // Envolvemos la app con la utilidad de supertest.
}

module.exports = testServer; // Exportamos para su uso.