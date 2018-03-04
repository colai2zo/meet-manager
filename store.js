const knex = require('knex')(require('./knexfile'))
module.exports = {
  createUser ({ username, password }) {
    return knex('user').insert({
      username,
      password
    });
  }
}