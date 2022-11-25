const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express(); // create express app

// add middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET'],
    allowedHeaders: ['X-Requested-With', 'Content-Type', 'Authorization'],
  }),
);
app.use(express.static(path.join(__dirname, '..', 'build')));
app.use(express.static('public'));

app.use((req, res, next) => {
  console.log('hello world');
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.listen(process.env.PORT || 3000, () => {
  console.log('server started on port 3000');
});
