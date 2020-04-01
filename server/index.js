const keys = require('./keys');

// express setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// posgres setup
const { Pool } = require('pg');

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost PG connection!'));
pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => console.log(err));

// redis setup
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redistPort,
  retry_strategy: () => 1000
});

const pub = redisClient.duplicate();

// express api setup
app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values');
  res.send(values.rows);
});

app.get('/values/current', (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index, 10) > 40) {
    return res.status(422).send({
      working: false,
      message: 'Index too high.'
    });
  }

  redisClient.hset('values', index, 'Nothing yet');
  pub.publish('insert', index);
  pgClient.query('INSERT INTO values (number) VALUES ($1)', [index]);

  res.send({
    working: true
  });
});

app.listen(5000, err => {
  console.log('Listening');
});
