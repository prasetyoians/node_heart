const { Pool } = require('pg');

module.exports = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'alkes',
  password: 'ianprast1234567',
  port: 5432 // Default port for PostgreSQL
});


// const { Pool } = require('pg');

// module.exports = new Pool({
//   connectionString: process.env.POSTGRES_URL + "?sslmode=require", 
// });

