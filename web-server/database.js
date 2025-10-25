const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');

class Database {
    constructor() {
        this.db = null;
        this.dbType = process.env.DB_TYPE || 'sqlite';
        this.init();
    }

    async init() {
        try {
            if (this.dbType === 'postgres') {
                await this.initPostgreSQL();
            } else {
                await this.initSQLite();
            }
            await this.createTables();
            console.log('✅ Base de datos inicializada correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar la base de datos:', error);
            throw error;
        }
    }

    async initSQLite() {
        const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error al conectar con SQLite:', err.message);
                throw err;
            }
            console.log('📁 Conectado a la base de datos SQLite');
        });
    }

    async initPostgreSQL() {
        this.db = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        await this.db.connect();
        console.log('🐘 Conectado a la base de datos PostgreSQL');
    }

    async createTables() {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS usuario_instagram (
                id INTEGER PRIMARY KEY ${this.dbType === 'postgres' ? 'SERIAL' : 'AUTOINCREMENT'},
                id_dispositivo VARCHAR(255) NOT NULL UNIQUE,
                id_usuario_instagram VARCHAR(255) NOT NULL,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                activo BOOLEAN DEFAULT TRUE
            )
        `;

        if (this.dbType === 'postgres') {
            await this.db.query(createTableSQL);
        } else {
            await new Promise((resolve, reject) => {
                this.db.run(createTableSQL, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        console.log('📋 Tabla usuario_instagram creada/verificada');
    }

    async registrarUsuario(idDispositivo, idUsuarioInstagram) {
        const insertSQL = `
            INSERT OR REPLACE INTO usuario_instagram (id_dispositivo, id_usuario_instagram)
            VALUES (?, ?)
        `;
        
        const insertPostgresSQL = `
            INSERT INTO usuario_instagram (id_dispositivo, id_usuario_instagram)
            VALUES ($1, $2)
            ON CONFLICT (id_dispositivo) 
            DO UPDATE SET 
                id_usuario_instagram = EXCLUDED.id_usuario_instagram,
                fecha_registro = CURRENT_TIMESTAMP,
                activo = TRUE
        `;

        try {
            if (this.dbType === 'postgres') {
                const result = await this.db.query(insertPostgresSQL, [idDispositivo, idUsuarioInstagram]);
                return { success: true, rowsAffected: result.rowCount };
            } else {
                return new Promise((resolve, reject) => {
                    this.db.run(insertSQL, [idDispositivo, idUsuarioInstagram], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ success: true, rowsAffected: this.changes });
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            throw error;
        }
    }

    async obtenerUsuarios() {
        const selectSQL = 'SELECT * FROM usuario_instagram WHERE activo = TRUE ORDER BY fecha_registro DESC';
        
        try {
            if (this.dbType === 'postgres') {
                const result = await this.db.query(selectSQL);
                return result.rows;
            } else {
                return new Promise((resolve, reject) => {
                    this.db.all(selectSQL, [], (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(rows);
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    }

    async obtenerTokensDispositivos() {
        const selectSQL = 'SELECT id_dispositivo FROM usuario_instagram WHERE activo = TRUE';
        
        try {
            if (this.dbType === 'postgres') {
                const result = await this.db.query(selectSQL);
                return result.rows.map(row => row.id_dispositivo);
            } else {
                return new Promise((resolve, reject) => {
                    this.db.all(selectSQL, [], (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(rows.map(row => row.id_dispositivo));
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Error al obtener tokens:', error);
            throw error;
        }
    }

    close() {
        if (this.db) {
            if (this.dbType === 'postgres') {
                this.db.end();
            } else {
                this.db.close();
            }
            console.log('🔒 Conexión a la base de datos cerrada');
        }
    }
}

module.exports = Database;