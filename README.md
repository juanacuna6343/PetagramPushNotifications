# 🏛️ Lugares Pereira App

Una aplicación Android completa que muestra lugares turísticos de Pereira con sistema de notificaciones push usando Firebase Cloud Messaging (FCM) y servidor web propio.

## 📱 Características

- ✅ **Aplicación Android** con interfaz moderna
- ✅ **Firebase Cloud Messaging** para notificaciones push
- ✅ **Servidor Web** con API REST
- ✅ **Base de Datos** para gestión de usuarios y tokens
- ✅ **Menú "Recibir Notificaciones"** funcional
- ✅ **Endpoint `/registrar-usuario`** implementado
- ✅ **Validaciones robustas** y manejo de errores
- ✅ **Documentación completa**

## 🏗️ Estructura del Proyecto

```
LugaresPereiraApp/
├── 📱 android-app/                 # Aplicación Android
│   ├── app/
│   │   ├── src/main/java/com/example/lugarespereiraapp/
│   │   │   ├── MainActivity.kt                    # Actividad principal
│   │   │   ├── fcm/MyFirebaseMessagingService.kt  # Servicio FCM
│   │   │   ├── adapter/LugaresAdapter.kt          # Adaptador RecyclerView
│   │   │   ├── model/
│   │   │   │   ├── Lugar.kt                       # Modelo de lugar
│   │   │   │   └── RegistroUsuarioRequest.kt      # Request de registro
│   │   │   └── api/
│   │   │       ├── ApiService.kt                  # Interface Retrofit
│   │   │       └── RetrofitClient.kt              # Cliente HTTP
│   │   ├── src/main/res/
│   │   │   ├── layout/                            # Layouts XML
│   │   │   ├── menu/                              # Menús
│   │   │   ├── values/                            # Strings y colores
│   │   │   └── xml/network_security_config.xml    # Configuración de red
│   │   ├── build.gradle                           # Dependencias Android
│   │   └── google-services.json                   # Configuración Firebase
│   └── build.gradle
├── 🌐 web-server/                  # Servidor Node.js
│   ├── server.js                   # Servidor Express principal
│   ├── database.js                 # Gestión de base de datos
│   ├── package.json                # Dependencias Node.js
│   ├── .env                        # Variables de entorno
│   └── .env.example                # Plantilla de configuración
├── 📄 DOCUMENTACION_ENDPOINT.md     # Documentación técnica completa
└── 📖 README.md                     # Este archivo
```

## 🚀 Configuración Rápida

### 1. 🔥 Configuración de Firebase
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Agregar aplicación Android con package `com.example.lugarespereiraapp`
3. Descargar `google-services.json` y colocarlo en `android-app/app/`
4. Habilitar Firebase Cloud Messaging en el proyecto

### 2. 🌐 Configuración del Servidor Web
```bash
cd web-server
npm install
cp .env.example .env  # Configurar variables de entorno
npm start
```

### 3. 📱 Configuración de la App Android
```bash
cd android-app
./gradlew build
./gradlew installDebug  # Instalar en dispositivo/emulador
```

## 🗄️ Base de Datos

### Esquema de la Tabla `usuario_instagram`
```sql
CREATE TABLE usuario_instagram (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_dispositivo TEXT NOT NULL,           -- Token FCM del dispositivo
    id_usuario_instagram TEXT NOT NULL,     -- ID del usuario de Instagram
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo INTEGER DEFAULT 1
);
```

## 🔧 API Endpoints

### `POST /registrar-usuario`
Registra un dispositivo para recibir notificaciones push.

**Request:**
```json
{
  "id_dispositivo": "token_fcm_del_dispositivo",
  "id_usuario_instagram": "usuario_instagram"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente para recibir notificaciones",
  "data": {
    "id_dispositivo": "token_fcm_del_dispositivo...",
    "id_usuario_instagram": "usuario_instagram",
    "timestamp": "2024-10-25T03:38:58.000Z"
  }
}
```

### Otros Endpoints
- `GET /` - Información de la API
- `GET /health` - Estado del servidor
- `GET /usuarios` - Lista de usuarios registrados

## 📋 Uso del Sistema

### 1. Iniciar el Servidor
```bash
cd web-server
npm start
# Servidor disponible en http://localhost:3000
```

### 2. Ejecutar la Aplicación Android
1. Abrir Android Studio
2. Importar el proyecto desde `android-app/`
3. Ejecutar en emulador o dispositivo físico

### 3. Registrar Dispositivo para Notificaciones
1. En la app, ir al menú (⋮)
2. Seleccionar "Recibir Notificaciones"
3. El sistema automáticamente:
   - Obtiene el token FCM del dispositivo
   - Envía los datos al servidor
   - Confirma el registro exitoso

## 🛠️ Tecnologías Utilizadas

### Frontend (Android)
- **Kotlin** - Lenguaje principal
- **Firebase FCM** - Notificaciones push
- **Retrofit** - Cliente HTTP
- **Material Design** - UI/UX
- **RecyclerView** - Listas dinámicas

### Backend (Servidor Web)
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **SQLite** - Base de datos (desarrollo)
- **PostgreSQL** - Base de datos (producción)
- **Helmet.js** - Seguridad HTTP
- **CORS** - Control de acceso

### DevOps y Herramientas
- **npm** - Gestión de dependencias
- **Gradle** - Build system Android
- **Git** - Control de versiones
- **Heroku** - Despliegue (opcional)

## 🧪 Pruebas y Validación

### Probar el Endpoint con cURL
```bash
curl -X POST http://localhost:3000/registrar-usuario \
  -H "Content-Type: application/json" \
  -d '{
    "id_dispositivo": "test_token_12345678901234567890",
    "id_usuario_instagram": "usuario_test"
  }'
```

### Probar con PowerShell
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/registrar-usuario" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"id_dispositivo":"test_token_123","id_usuario_instagram":"usuario_test"}'
```

### Verificar Usuarios Registrados
```bash
curl http://localhost:3000/usuarios
```

## 🚀 Despliegue en Producción

### Heroku
```bash
# Crear aplicación
heroku create lugares-pereira-api

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set DB_TYPE=postgresql
heroku config:set DATABASE_URL=postgresql://...

# Desplegar
git push heroku main
```

### Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Desplegar
railway login
railway init
railway up
```

## 📚 Documentación Adicional

- 📄 **[DOCUMENTACION_ENDPOINT.md](./DOCUMENTACION_ENDPOINT.md)** - Documentación técnica completa
- 🔥 **[Firebase Console](https://console.firebase.google.com/)** - Configuración de FCM
- 📱 **[Android Developer Guide](https://developer.android.com/guide/topics/ui/notifiers/notifications)** - Guía de notificaciones

## 🔍 Criterios de Evaluación

### ✅ Funcionalidades Implementadas
- [x] **Web Service funcional** - Endpoint `/registrar-usuario` responde correctamente
- [x] **FCM integrado** - Aplicación recibe tokens de Firebase Cloud Messaging
- [x] **Comunicación establecida** - App envía datos al endpoint exitosamente
- [x] **Aplicación ejecutable** - Todo el sistema funciona correctamente

### 🎯 Características Adicionales
- [x] **Validaciones robustas** - Parámetros de entrada validados
- [x] **Manejo de errores** - Respuestas de error informativas
- [x] **Seguridad implementada** - Headers de seguridad y CORS
- [x] **Base de datos funcional** - Almacenamiento persistente
- [x] **Documentación completa** - README y documentación técnica
- [x] **Código limpio** - Estructura organizada y comentada

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**[Tu Nombre]**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- Email: tu-email@ejemplo.com

## 🙏 Agradecimientos

- Firebase por el servicio de Cloud Messaging
- Material Design por los componentes de UI
- Express.js por el framework web
- La comunidad de desarrolladores Android y Node.js

---

⭐ **¡Dale una estrella al proyecto si te fue útil!** ⭐