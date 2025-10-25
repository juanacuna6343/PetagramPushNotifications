require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar base de datos
const database = new Database();

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',') 
            : ['http://localhost:3000'];
        
        // Permitir requests sin origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));

// Middleware para parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Middleware para validación de JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ 
            error: 'JSON inválido',
            message: 'El formato del JSON enviado no es válido'
        });
    }
    next();
});

// Ruta de salud del servidor
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: '🏛️ Servidor Lugares Pereira API',
        version: '1.0.0',
        endpoints: {
            'POST /registrar-usuario': 'Registra un dispositivo para notificaciones',
            'GET /usuarios': 'Lista todos los usuarios registrados',
            'GET /health': 'Estado del servidor'
        },
        documentation: 'Ver README.md para más información'
    });
});

// ENDPOINT PRINCIPAL: Registrar usuario para notificaciones
app.post('/registrar-usuario', async (req, res) => {
    try {
        const { id_dispositivo, id_usuario_instagram } = req.body;

        // Validación de parámetros
        if (!id_dispositivo || !id_usuario_instagram) {
            return res.status(400).json({
                error: 'Parámetros faltantes',
                message: 'Se requieren id_dispositivo e id_usuario_instagram',
                received: { id_dispositivo: !!id_dispositivo, id_usuario_instagram: !!id_usuario_instagram }
            });
        }

        // Validación de formato
        if (typeof id_dispositivo !== 'string' || typeof id_usuario_instagram !== 'string') {
            return res.status(400).json({
                error: 'Formato inválido',
                message: 'Los parámetros deben ser strings'
            });
        }

        // Validación de longitud
        if (id_dispositivo.length < 10 || id_dispositivo.length > 255) {
            return res.status(400).json({
                error: 'Token inválido',
                message: 'El id_dispositivo debe tener entre 10 y 255 caracteres'
            });
        }

        if (id_usuario_instagram.length < 1 || id_usuario_instagram.length > 255) {
            return res.status(400).json({
                error: 'Usuario inválido',
                message: 'El id_usuario_instagram debe tener entre 1 y 255 caracteres'
            });
        }

        // Registrar en la base de datos
        const result = await database.registrarUsuario(id_dispositivo, id_usuario_instagram);

        console.log(`✅ Usuario registrado: ${id_usuario_instagram} con token: ${id_dispositivo.substring(0, 20)}...`);

        res.status(200).json({
            success: true,
            message: 'Usuario registrado exitosamente para recibir notificaciones',
            data: {
                id_dispositivo: id_dispositivo.substring(0, 20) + '...', // Mostrar solo parte del token por seguridad
                id_usuario_instagram,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Error al registrar usuario:', error);
        
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo registrar el usuario',
            timestamp: new Date().toISOString()
        });
    }
});

// Endpoint para obtener usuarios registrados (para debugging/admin)
app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await database.obtenerUsuarios();
        
        // Ocultar tokens completos por seguridad
        const usuariosSeguro = usuarios.map(usuario => ({
            ...usuario,
            id_dispositivo: usuario.id_dispositivo.substring(0, 20) + '...'
        }));

        res.json({
            success: true,
            count: usuarios.length,
            usuarios: usuariosSeguro
        });
    } catch (error) {
        console.error('❌ Error al obtener usuarios:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener los usuarios'
        });
    }
});

// Endpoint para obtener tokens (para envío de notificaciones)
app.get('/tokens', async (req, res) => {
    try {
        const tokens = await database.obtenerTokensDispositivos();
        
        res.json({
            success: true,
            count: tokens.length,
            message: 'Tokens obtenidos exitosamente'
            // No devolvemos los tokens por seguridad, solo el conteo
        });
    } catch (error) {
        console.error('❌ Error al obtener tokens:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudieron obtener los tokens'
        });
    }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.method} ${req.originalUrl} no existe`,
        availableEndpoints: [
            'GET /',
            'POST /registrar-usuario',
            'GET /usuarios',
            'GET /health'
        ]
    });
});

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);
    
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Base de datos: ${process.env.DB_TYPE || 'sqlite'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    database.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando servidor...');
    database.close();
    process.exit(0);
});

module.exports = app;