const app = require('./app');
const db = require('./db');
const PORT = 2727;

db.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Listening on port: ' + PORT);
    });
  });