import 'dotenv/config';

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';

import bundle, { makeBundle } from './bundle';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Ready to build something awesome?',
  });
});

if (process.env.NODE_ENV !== 'production') {
  const stream = makeBundle();
  stream.pipe(fs.createWriteStream('../bundle.tgz'));
  console.log('Regenerated bundle.tgz');
}

app.use(bundle);

const port = process.env.PORT || 3000;
app.listen(port , () =>
  console.log('App running at http://localhost:' + port));
