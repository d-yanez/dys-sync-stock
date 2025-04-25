// src/app.js
import express    from 'express';
import cors       from 'cors';
import helmet     from 'helmet';
import dotenv     from 'dotenv';

dotenv.config();  

import { connectDb } from './infrastructure/config/db.js';
import routes        from './infrastructure/routes/index.js';

const app = express();

// Middlewares de seguridad y parseo
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rutas
app.use('/', routes);

// Puerto
const PORT = process.env.PORT || 8080;

// Conectar a MongoDB y arrancar servidor
connectDb()
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });
