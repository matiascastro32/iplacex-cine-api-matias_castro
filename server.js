import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectToMongo } from './src/common/db.js';
import peliculaRoutes from './src/pelicula/routes.js';
import actorRoutes from './src/actor/routes.js';

const app = express();
const PORT = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
  res.status(200).send('Bienvenido al cine Iplacex');
});

app.use('/api', peliculaRoutes);
app.use('/api', actorRoutes);

connectToMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor Express levantado en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error conectando a MongoDB Atlas:', err.message);
    process.exit(1);
  });
