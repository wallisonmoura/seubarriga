const bodyParser = require("body-parser");
//const knexlogger = require("knex-logger");

module.exports = app => {
  app.use(bodyParser.json());
  //app.use(knexlogger(app.db));
};
