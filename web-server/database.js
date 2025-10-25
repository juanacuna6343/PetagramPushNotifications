const Database = require('better-sqlite3');
const path = require('path');

function createDatabase(dbPath) {
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario_instagram TEXT UNIQUE,
      id_dispositivo TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_foto_instagram TEXT,
      id_usuario_instagram TEXT,
      device_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const insertDevice = db.prepare(
    'INSERT INTO devices (id_usuario_instagram, id_dispositivo) VALUES (?, ?) ON CONFLICT(id_usuario_instagram) DO UPDATE SET id_dispositivo=excluded.id_dispositivo'
  );
  const getDeviceByUser = db.prepare(
    'SELECT * FROM devices WHERE id_usuario_instagram = ?'
  );
  const insertLike = db.prepare(
    'INSERT INTO likes (id_foto_instagram, id_usuario_instagram, device_token) VALUES (?, ?, ?)'
  );

  return {
    insertOrUpdateDevice(idUsuario, token) {
      return insertDevice.run(idUsuario, token);
    },
    findDeviceByUser(idUsuario) {
      return getDeviceByUser.get(idUsuario);
    },
    saveLike(idFoto, idUsuario, deviceToken) {
      return insertLike.run(idFoto, idUsuario, deviceToken);
    }
  };
}

module.exports = { createDatabase };