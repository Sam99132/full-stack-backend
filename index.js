const express = require('express');
const cors = require('cors');
const prisma = require('./config/database');
require('dotenv').config();

const app = express();


const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
};


app.use(cors(corsOptions));
app.use(express.json());


app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));


app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});


const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    
    await prisma.$connect();
    console.log('Connected to Neon DB via Prisma');

    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}


process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

