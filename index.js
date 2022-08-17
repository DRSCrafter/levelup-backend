const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require("multer");
const product = require('./routes/products');

const app = express();

mongoose.connect('mongodb://localhost/levelup')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(() => console.log('Connection failed!'));

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(cors({exposedHeaders: 'x-auth-token'}));
app.use('/api/products', product);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on Port ${port}...`));
