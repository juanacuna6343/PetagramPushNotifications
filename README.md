# Petagram Push API y App

Este proyecto implementa:

- Backend Node.js con endpoints para registrar dispositivos, registrar likes y (opcional/simulado) enviar like al API de Instagram.
- App Android que recibe notificaciones push (FCM) y abre la pantalla de perfil al pulsarlas.

## Backend (web-server)

### Requisitos

- Node.js 18+
- Archivo de credenciales de Firebase Admin (service account JSON) y variable `GOOGLE_APPLICATION_CREDENTIALS` apuntando a ese archivo.

### Configuración

1. Copia `.env.example` a `.env` y ajusta variables:

```
PORT=3000
DATABASE_PATH=./db.sqlite
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
INSTAGRAM_ACCESS_TOKEN= # opcional si tienes permisos de Graph API
```

2. Instala dependencias y levanta servidor:

```
cd web-server
npm install
npm run start
```

### Endpoints

- `GET /api/health` → verificación del servidor
- `POST /api/devices/register` → registrar token FCM de un usuario
  - body: `{ id_usuario_instagram, id_dispositivo }`
- `POST /api/likes` → registrar un like y notificar al dueño de la foto
  - body: `{ id_foto_instagram, id_usuario_instagram, id_dispositivo? }`
  - si no se envía `id_dispositivo`, se busca por `id_usuario_instagram` en la BD
- `POST /api/instagram/like` → intento/simulación de like en Instagram Graph API
  - body: `{ id_foto_instagram, id_usuario_instagram }`
  - si `INSTAGRAM_ACCESS_TOKEN` no está configurado, se simula respuesta exitosa

# Petagram Push — Backend y App Android

Este repositorio contiene una API (Node.js + Express) y una app Android de ejemplo para la actividad "Creando, Recibiendo y Actuando Push Notifications".

Resumen:

- Servidor: `web-server/` (Node.js, Express)
- Base de datos: SQLite (`better-sqlite3`)
- Notificaciones push: Firebase Cloud Messaging (Firebase Admin SDK)
- App Android: `android-app/` — recibe notificaciones FCM y abre la pantalla de perfil al pulsarlas

## Contenido del repo

- `web-server/` — servidor Express, endpoints y base de datos sqlite
- `android-app/` — código fuente de la app Android (Kotlin)
- `docs/DOCUMENTACION_ENDPOINT_SUBMISSION.md` — documentación lista para exportar a PDF

---

## Ejecutar el servidor (web-server)

Requisitos mínimos:

- Node.js 18+
- (Opcional para FCM) un Service Account JSON de Firebase y la variable de entorno `GOOGLE_APPLICATION_CREDENTIALS` apuntando a ese archivo

1) Preparar entorno

Coloca las variables en un archivo `.env` dentro de `web-server/` o expórtalas en tu shell. Ejemplo de variables:

```
PORT=3000
DATABASE_PATH=./db.sqlite
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json   # opcional, necesario para enviar FCM desde el servidor
INSTAGRAM_ACCESS_TOKEN=   # opcional, solo si tienes permisos del Graph API
```

2) Instalar y levantar

PowerShell (Windows):

```powershell
cd c:\Users\JUAN\Desktop\PetagramPushNotifications\web-server
npm install
npm start
```

El servidor escuchará por defecto en `http://localhost:3000`.

Nota de seguridad: nunca subas el `service-account.json` ni tu `.env` al repositorio público.

---

## Endpoints principales

- GET /api/health
  - Respuesta: { ok: true }

- POST /api/devices/register
  - Propósito: registrar/actualizar token FCM de un usuario Instagram
  - Payload JSON: { "id_usuario_instagram": "usuario_destino", "id_dispositivo": "TOKEN_FCM" }

- POST /api/likes
  - Propósito: registrar un like en la BD y notificar al dueño de la foto
  - Payload JSON: { "id_foto_instagram": "12345", "id_usuario_instagram": "usuario_destino", "id_dispositivo": "TOKEN_FCM" } (id_dispositivo opcional)
  - Comportamiento: guarda en tabla `likes` y envia FCM si existe token y Firebase Admin está inicializado

- POST /api/instagram/like
  - Propósito: intentar dar like en Instagram (Graph API) y además guardar/notificar localmente
  - Payload JSON: { "id_foto_instagram": "12345", "id_usuario_instagram": "usuario_destino" }
  - Si `INSTAGRAM_ACCESS_TOKEN` no está configurado, el servidor simula la llamada a Instagram pero igualmente guarda el like y notifica al dispositivo registrado

---

## Ejecutar y probar la app Android (android-app)

Requisitos:

- Android Studio
- `google-services.json` del proyecto Firebase (añadir en `android-app/app/`)

Pasos rápidos:

1. Abre `android-app` en Android Studio.
2. Añade `google-services.json` en `android-app/app/` y sincroniza.
3. Ejecuta la app en un dispositivo físico (recomendado) o emulador con Google Play services.
4. En la pantalla principal ingresa el `id_usuario_instagram` del propietario del dispositivo y pulsa "Registrar dispositivo". Esto llamará a `/api/devices/register` y guardará el token FCM en la BD del servidor.

Cuando llegue una notificación, `MyFirebaseMessagingService` la crea con un `PendingIntent` que abre `ProfileActivity` y pasa `id_usuario_instagram` como extra.

---

## Pruebas (PowerShell / Windows)

1) Registrar dispositivo (si tienes el token FCM):

```powershell
$body = @{ id_usuario_instagram='usuario_destino'; id_dispositivo='TOKEN_FCM' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/devices/register -Method Post -Body $body -ContentType 'application/json'
```

2) Simular/realizar like (endpoint Instagram que también guarda y notifica):

```powershell
$body = @{ id_foto_instagram='12345'; id_usuario_instagram='usuario_destino' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/instagram/like -Method Post -Body $body -ContentType 'application/json'
```

3) Alternativa: llamar a `/api/likes` directamente:

```powershell
$body = @{ id_foto_instagram='12345'; id_usuario_instagram='usuario_destino' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/likes -Method Post -Body $body -ContentType 'application/json'
```

Verifica:

- Que la respuesta sea OK.
- Que en `web-server/db.sqlite` se inserte la fila en `likes`.
- Que el dispositivo del usuario reciba la notificación. Al pulsarla, la app debe abrir `ProfileActivity` mostrando el id.

---

## Entregables para la actividad

1. PDF con explicación del endpoint y la plataforma (usa `web-server/DOCUMENTACION_ENDPOINT_SUBMISSION.md` como base).
2. Video demostrativo: pasos mínimos
   - Registrar el token desde la app (mostrar token y pulsar registrar)
   - Ejecutar POST a `/api/instagram/like` desde PowerShell o Postman
   - Mostrar la notificación en el dispositivo y abrirla
   - Mostrar la tabla `likes` en la DB con el nuevo registro
3. Enlace al repositorio en GitHub

---

## Notas y limitaciones

- El API de Instagram tiene restricciones: el Basic Display API no permite likes. Si no tienes permisos del Graph API, el endpoint `/api/instagram/like` simula el like pero cumple con guardar el registro y notificar.
- Para que FCM funcione desde el servidor debes proveer un `service-account.json` y establecer `GOOGLE_APPLICATION_CREDENTIALS` en el entorno donde se ejecuta el servidor.
- No subas credenciales ni `google-services.json` a repositorios públicos.

---

Si quieres, puedo:

- Generar el PDF desde el Markdown y agregarlo al repo (si tu entorno lo permite).
- Preparar un script PowerShell automatizado para la demo (registro + like + verificación).
- Ayudarte a preparar el README en inglés para publicar en GitHub.
