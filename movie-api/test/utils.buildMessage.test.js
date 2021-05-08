// Esta clase se hizo con la metodologia TDD.
/* 
TDD es test driven development.

En otras palabras: crear primero las pruebas que hay que superar y después desarrollar el código.
El profesor considera magnífico usar esto cuando se tiene muy claro la lógica de negocio.
Si no lo tienes claro no es recomendable.
También es recomendable hacerlo cuando tienes un bug para que tu solución de él perdure en el tiempo.
*/

const assert = require('assert');
const buildMessage = require('../utils/buildMessage');

// Con .only() lo que hacemos es que solo se ejecute este test y no ejecute los demas.
// Esto para comprobar un solo test. la linea quedaria:
// describe.only('utils - buildMessage', function() {
describe('utils - buildMessage', function() {
  describe('when receives an entity and an action', function() {
    it('should return the respective message', function() {
      const result = buildMessage('movie', 'create');
      const expect = 'movie created';
      assert.strictEqual(result, expect);
    });
  });

  describe('when receives an entity and an action and is a list', function() {
    it('should return the respective message with the entity in plural', function() {
      const result = buildMessage('movie', 'list');
      const expected = 'movies listed';
      assert.strictEqual(result, expected);
    });
  });
});