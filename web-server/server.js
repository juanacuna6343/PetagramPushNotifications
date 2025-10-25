require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const { createDatabase } = require('./database');

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'db.sqlite');

// Init DB
const db = createDatabase(DB_PATH);

// Init Firebase Admin (expects GOOGLE_APPLICATION_CREDENTIALS env var)
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
  console.log('[FCM] Firebase Admin initialized');
} catch (err) {
  console.warn('[FCM] Firebase Admin not initialized. Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON.');
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Petagram Push API up' });
});

// Device registration: { id_usuario_instagram, id_dispositivo }
app.post('/api/devices/register', (req, res) => {
  const { id_usuario_instagram, id_dispositivo } = req.body || {};
  if (!id_usuario_instagram || !id_dispositivo) {
    return res.status(400).json({ ok: false, error: 'Faltan campos: id_usuario_instagram, id_dispositivo' });
  }
  try {
    db.insertOrUpdateDevice(id_usuario_instagram, id_dispositivo);
    return res.json({ ok: true, message: 'Dispositivo registrado' });
  } catch (err) {
    console.error('Error registrando dispositivo', err);
    return res.status(500).json({ ok: false, error: 'Error registrando dispositivo' });
  }
});

// Like endpoint that stores and notifies: { id_foto_instagram, id_usuario_instagram, id_dispositivo? }
app.post('/api/likes', async (req, res) => {
  const { id_foto_instagram, id_usuario_instagram, id_dispositivo } = req.body || {};
  if (!id_foto_instagram || !id_usuario_instagram) {
    return res.status(400).json({ ok: false, error: 'Faltan campos: id_foto_instagram, id_usuario_instagram' });
  }

  try {
    // Determine target device token
    let targetToken = id_dispositivo;
    if (!targetToken) {
      const device = db.findDeviceByUser(id_usuario_instagram);
      targetToken = device?.id_dispositivo;
    }

    // Save like in DB
    db.saveLike(id_foto_instagram, id_usuario_instagram, targetToken || null);

    // Send FCM notification if we have a token and admin initialized
    if (targetToken && admin.apps?.length) {
      const message = {
        token: targetToken,
        notification: {
          title: 'Nuevo like en tu foto',
          body: `Tu foto (${id_foto_instagram}) recibió un like`
        },
        data: {
          screen: 'profile',
          id_usuario_instagram: String(id_usuario_instagram)
        }
      };

      try {
        const response = await admin.messaging().send(message);
        console.log('[FCM] Notificación enviada:', response);
      } catch (err) {
        console.warn('[FCM] Error enviando notificación:', err.message);
      }
    } else {
      console.log('[FCM] No hay token o Firebase no inicializado; no se envía notificación');
    }

    return res.json({ ok: true, message: 'Like registrado y notificación procesada' });
  } catch (err) {
    console.error('Error procesando like', err);
    return res.status(500).json({ ok: false, error: 'Error procesando like' });
  }
});

// Instagram like endpoint (simulado / opcional)
// Nota: El API oficial de Instagram no permite likes con el Basic Display API.
// Si cuentas con permisos del Graph API adecuados, configura INSTAGRAM_ACCESS_TOKEN e IG_MEDIA_LIKES_ENDPOINT.
app.post('/api/instagram/like', async (req, res) => {
  const { id_foto_instagram, id_usuario_instagram } = req.body || {};
  if (!id_foto_instagram || !id_usuario_instagram) {
    return res.status(400).json({ ok: false, error: 'Faltan campos: id_foto_instagram, id_usuario_instagram' });
  }

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const endpointTemplate = process.env.IG_MEDIA_LIKES_ENDPOINT || 'https://graph.facebook.com/v19.0/%s/likes';

  if (!accessToken) {
    // Simulación: respondemos éxito sin llamar a Instagram (limitación del API)
    try {
      // Save like in DB and notify like in the same way as /api/likes
      const device = db.findDeviceByUser(id_usuario_instagram);
      const targetToken = device?.id_dispositivo || null;
      db.saveLike(id_foto_instagram, id_usuario_instagram, targetToken);

      if (targetToken && admin.apps?.length) {
        const message = {
          token: targetToken,
          notification: {
            title: 'Nuevo like en tu foto',
            body: `Tu foto (${id_foto_instagram}) recibió un like`
          },
          data: {
            screen: 'profile',
            id_usuario_instagram: String(id_usuario_instagram)
          }
        };
        try {
          const response = await admin.messaging().send(message);
          console.log('[FCM] Notificación enviada (simulada IG):', response);
        } catch (err) {
          console.warn('[FCM] Error enviando notificación (simulada IG):', err.message);
        }
      } else {
        console.log('[FCM] No hay token o Firebase no inicializado; no se envía notificación (simulada IG)');
      }

      return res.json({ ok: true, simulated: true, message: 'Like simulado en Instagram Graph API, like guardado y notificación procesada' });
    } catch (err) {
      console.error('Error procesando like simulado', err);
      return res.status(500).json({ ok: false, error: 'Error procesando like simulado' });
    }
  }

  const endpoint = endpointTemplate.replace('%s', encodeURIComponent(id_foto_instagram));

  try {
    // Usar fetch nativo de Node 18+
    const igRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ access_token: accessToken })
    });

    const igData = await igRes.json();
    if (!igRes.ok) {
      return res.status(502).json({ ok: false, error: 'Error en Instagram API', detail: igData });
    }
    
    // Instagram API call successful — also save like and notify device (if registered)
    try {
      const device = db.findDeviceByUser(id_usuario_instagram);
      const targetToken = device?.id_dispositivo || null;
      db.saveLike(id_foto_instagram, id_usuario_instagram, targetToken);

      if (targetToken && admin.apps?.length) {
        const message = {
          token: targetToken,
          notification: {
            title: 'Nuevo like en tu foto',
            body: `Tu foto (${id_foto_instagram}) recibió un like`
          },
          data: {
            screen: 'profile',
            id_usuario_instagram: String(id_usuario_instagram)
          }
        };
        try {
          const response = await admin.messaging().send(message);
          console.log('[FCM] Notificación enviada (IG):', response);
        } catch (err) {
          console.warn('[FCM] Error enviando notificación (IG):', err.message);
        }
      } else {
        console.log('[FCM] No hay token o Firebase no inicializado; no se envía notificación (IG)');
      }
    } catch (err) {
      console.error('Error guardando like o enviando notificación después de IG', err);
    }

    return res.json({ ok: true, instagram: igData });
  } catch (err) {
    console.error('Error llamando Instagram API', err);
    return res.status(500).json({ ok: false, error: 'Fallo al llamar Instagram API' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});