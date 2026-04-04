const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const cellsRouter = require('./routes/cells');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = ['http://localhost:5173'];
if (process.env.ALLOWED_ORIGIN) {
  allowedOrigins.push(process.env.ALLOWED_ORIGIN);
}

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '15mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/cells', cellsRouter);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Mongo connection error:', error.message);
    process.exit(1);
  });

