import { ObjectId } from 'mongodb';
import { getDb } from '../common/db.js';
import { peliculaCollection } from '../pelicula/controller.js';

export const actorCollection = { db: 'cine-db', collection: 'actores' };

function validateActorPayload(body) {
  if (!body.idPelicula || !body.nombre || typeof body.edad === 'undefined' || typeof body.estaRetirado === 'undefined') {
    return false;
  }
  return true;
}

export async function handleInsertActorRequest(req, res) {
  const payload = req.body;
  if (!validateActorPayload(payload)) {
    return res.status(400).json({ error: 'Payload invalido. Campos requeridos: idPelicula(nombre), nombre, edad, estaRetirado' });
  }
  const peliculasColl = getDb(peliculaCollection.db).collection(peliculaCollection.collection);
  const actoresColl = getDb(actorCollection.db).collection(actorCollection.collection);

  // Validacion: idPelicula en payload es el NOMBRE de la pelicula segun la pauta
  peliculasColl.findOne({ nombre: payload.idPelicula })
    .then(peliculaDoc => {
      if (!peliculaDoc) return res.status(400).json({ error: 'La pelicula indicada no existe (validacion por nombre fallida).' });
      const actor = {
        idPelicula: peliculaDoc._id.toString(),
        nombre: payload.nombre,
        edad: Number(payload.edad),
        estaRetirado: Boolean(payload.estaRetirado),
        premios: Array.isArray(payload.premios) ? payload.premios : []
      };
      actoresColl.insertOne(actor)
        .then(result => res.status(201).json({ message: 'Actor creado', id: result.insertedId }))
        .catch(err => {
          console.error('Error insertando actor:', err);
          res.status(500).json({ error: 'Error interno al insertar actor' });
        });
    })
    .catch(err => {
      console.error('Error buscando pelicula para validacion:', err);
      res.status(500).json({ error: 'Error interno durante validacion de pelicula' });
    });
}

export async function handleGetActoresRequest(req, res) {
  const collection = getDb(actorCollection.db).collection(actorCollection.collection);
  collection.find({}).toArray()
    .then(docs => res.status(200).json(docs))
    .catch(err => {
      console.error('Error obteniendo actores:', err);
      res.status(500).json({ error: 'Error interno al obtener actores' });
    });
}

export async function handleGetActorByIdRequest(req, res) {
  const id = req.params.id;
  let objId;
  try {
    objId = new ObjectId(id);
  } catch (err) {
    return res.status(400).json({ error: 'Id mal formado' });
  }
  const collection = getDb(actorCollection.db).collection(actorCollection.collection);
  collection.findOne({ _id: objId })
    .then(doc => {
      if (!doc) return res.status(404).json({ error: 'No se encontro el actor' });
      res.status(200).json(doc);
    })
    .catch(err => {
      console.error('Error buscando actor por id:', err);
      res.status(500).json({ error: 'Error interno' });
    });
}

export async function handleGetActoresByPeliculaIdRequest(req, res) {
  const idPelicula = req.params.idPelicula;
  // intentamos parsear como ObjectId para validar formato; si no se puede, buscaremos por nombre
  let peliculaObjId = null;
  try { peliculaObjId = new ObjectId(idPelicula); } catch (e) { peliculaObjId = null; }

  const collection = getDb(actorCollection.db).collection(actorCollection.collection);

  if (peliculaObjId) {
    collection.find({ idPelicula: peliculaObjId.toString() }).toArray()
      .then(docs => res.status(200).json(docs))
      .catch(err => {
        console.error('Error obteniendo actores por pelicula id:', err);
        res.status(500).json({ error: 'Error interno' });
      });
  } else {
    // buscar por nombre de pelicula
    const peliculasColl = getDb(peliculaCollection.db).collection(peliculaCollection.collection);
    peliculasColl.findOne({ nombre: idPelicula })
      .then(peliculaDoc => {
        if (!peliculaDoc) return res.status(404).json({ error: 'No se encontro la pelicula (por nombre)' });
        collection.find({ idPelicula: peliculaDoc._id.toString() }).toArray()
          .then(docs => res.status(200).json(docs))
          .catch(err => {
            console.error('Error obteniendo actores por pelicula:', err);
            res.status(500).json({ error: 'Error interno' });
          });
      })
      .catch(err => {
        console.error('Error buscando pelicula por nombre:', err);
        res.status(500).json({ error: 'Error interno' });
      });
  }
}
