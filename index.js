const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require("multer");
const product = require('./routes/products');
const user = require('./routes/users');
const config = require('config');

const app = express();

if (!config.get('jwtPrivateKey')){
    console.error('Private Key not defined!')
    process.exit(1);
}

mongoose.connect('mongodb://localhost/levelup', {ignoreUndefined: true})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(() => console.log('Connection failed!'));

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(cors({exposedHeaders: 'x-auth-token'}));
app.use('/api/products', product);
app.use('/api/users', user);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on Port ${port}...`));
