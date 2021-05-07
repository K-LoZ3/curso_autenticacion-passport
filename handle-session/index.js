const express = require('express');
const session = require('express-session');

const app = express();

// Con esto creamos y hacemos uso de la session.
app.use(session({
  resave: false, // No guarde la coki cada que haya un cambio.
  saveUninitialized: false, // Por defecto si la coki no se ha inicializado no la guarde por defecto.
  secret: 'keyboard cat', // Esta es de ejemplo. Si la coke es segura la sifrara usando este secret.
}));

app.get('/', (req, res) => {
  // Si la session existe, suma uno al contador, de lo contrario inicializa en 1.
  req.session.count = req.session.count ? req.session.count + 1 : 1;
  // Mostramos en el navgador un json con el conador.
  res.status(200).json({ hello: 'world', counter: req.session.count });
});

// Lanzamos en el puerto 3000.
app.listen(3000, () => {
  console.log('Listen on port 3000');
});