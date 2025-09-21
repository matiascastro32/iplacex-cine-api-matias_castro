import { ObjectId } from 'mongodb';
import { getDb } from '../common/db.js';

export const peliculaCollection = { db: 'cine-db', collection: 'peliculas' };

function validatePeliculaPayload(body) {
  if (!body.nombre || !body.generos || !Array.isArray(body.generos) || typeof body.anioEstreno === 'undefined') {
    return false;
  }
  return true;
}

export async function handleInsertPeliculaRequest(req, res) {
  const payload = req.body;
  if (!validatePeliculaPayload(payload)) {
    return res.status(400).json({ error: 'Payload invalido. Campos requeridos: nombre, generos(array), anioEstreno' });
  }
  const pelicula = {
    nombre: payload.nombre,
    generos: payload.generos,
    anioEstreno: Number(payload.anioEstreno)
  };
  const collection = getDb(peliculaCollection.db).collection(peliculaCollection.collection);
  collection.insertOne(pelicula)
    .then(result => res.status(201).json({ message: 'Pelicula creada', id: result.insertedId }))
    .catch(err => {
      console.error('Error insertando pelicula:', err);
      res.status(500).json({ error: 'Error interno al insertar pelicula' });
    });
}

export async function handleGetPeliculasRequest(req, res) {
  const collection = getDb(peliculaCollection.db).collection(peliculaCollection.collection);
  collection.find({}).toArray()
    .then(docs => res.status(200).json(docs))
    .catch(err => {
      console.error('Error obteniendo peliculas:', err);
      res.status(500).json({ error: 'Error interno al obtener peliculas' });
    });
}

export async function handleGetPeliculaByIdRequest(req, res) {
  const id = req.params.id;
  let objId;
  try {
    objId = new ObjectId(id);
  } catch (err) {
    return res.status(400).json({ error: 'Id mal formado' });
  }
  const collection = getDb(peliculaCollection.db).collection(peliculaCollection.collection);
  collection.findOne({ _id: objId })
    .then(doc => {
      if (!doc) return res.status(404).json({ error: 'No se encontro la pelicula' });
      res.status(200).json(doc);
    })
    .catch(err => {
      console.error('Error buscando pelicula por id:', err);
      res.status(500).json({ error: 'Error interno' });
    });
}

export async function handleUpdatePeliculaByIdRequest(req, res) {
  const id = req.params.id;
  let objId;
  try {
    objId = new ObjectId(id);
  } catch (err) {
    return res.status(400).json({ error: 'Id mal formado' });
  }
  const updateDoc = { $set: req.body };
  const collection = getDb(peliculaCollection.db).collection(peliculaCollection.collection);
  collection.updateOne({ _id: objId }, updateDoc)
    .then(result => {
      if (result.matchedCount === 0) return res.status(404).json({ error: 'No se encontro la pelicula' });
      res.status(200).json({ message: 'Pelicula actualizada' });
    })
    .catch(err => {
      console.error('Error actualizando pelicula:', err);
      res.status(500).json({ error: 'Error interno' });
    });
}

export async function handleDeletePeliculaByIdRequest(req, res) {
  const id = req.params.id;
  let objId;
  try {
    objId = new ObjectId(id);
  } catch (err) {
    return res.status(400).json({ error: 'Id mal formado' });
  }
  const collection = getDb(peliculaCollection.db).collection(peliculaCollection.collection);
  collection.deleteOne({ _id: objId })
    .then(result => {
      if (result.deletedCount === 0) return res.status(404).json({ error: 'No se encontro la pelicula' });
      res.status(200).json({ message: 'Pelicula eliminada' });
    })
    .catch(err => {
      console.error('Error eliminando pelicula:', err);
      res.status(500).json({ error: 'Error interno' });
    });
}
