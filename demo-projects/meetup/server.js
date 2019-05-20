require('dotenv').config();

const express = require('express');

const { keystone, apps } = require('./index');

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/keystonejs-meetup';

keystone
  .prepare({ apps, port, dev: process.env.NODE_ENV !== 'production' })
  .then(async ({ middlewares }) => {
    await keystone.connect(mongoUri);

    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      const initialData = require('./initialData');
      Object.values(keystone.adapters).forEach(async adapter => {
        await adapter.dropDatabase();
      });
      await keystone.createItems(initialData);
    }

    const app = express();

    app.use(middlewares);

    app.listen(port, error => {
      if (error) throw error;
    });
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
