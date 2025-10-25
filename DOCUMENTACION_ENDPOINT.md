# Documentación de Endpoints y Plataforma

## Plataforma Utilizada
- Backend: Node.js + Express
- Base de datos: SQLite (better-sqlite3)
- Notificaciones: Firebase Cloud Messaging (FCM) usando Firebase Admin SDK en el servidor
- App: Android (Kotlin), integración con FCM y navegación a pantalla de perfil

## Flujo General
1. El dispositivo obtiene su token FCM (app Android).
2. La app registra el token en el backend (`/api/devices/register`) junto al `id_usuario_instagram` dueño de ese dispositivo.
3. Cuando alguien da like a una foto, se llama al endpoint del servidor (`/api/likes`) con `id_foto_instagram` y `id_usuario_instagram` (dueño de la foto). El servidor:
   - Guarda el like en la BD.
   - Busca el token del dispositivo del dueño y envía una notificación FCM.
4. Al recibir la notificación, el dispositivo muestra el mensaje; al pulsarlo, abre la `ProfileActivity` con el `id_usuario_instagram` del dueño.

## Endpoints Detallados

### `POST /api/devices/register`
Registra o actualiza el token del dispositivo de un usuario.
- Body (JSON):
```
{
  "id_usuario_instagram": "<string>",
  "id_dispositivo": "<token FCM>"
}
```
- Respuesta:
```
{ "ok": true, "message": "Dispositivo registrado" }
```

### `POST /api/likes`
Registra un like y envía una notificación al dueño de la foto.
- Body (JSON):
```
{
  "id_foto_instagram": "<string>",
  "id_usuario_instagram": "<string>",
  "id_dispositivo": "<token FCM opcional>"
}
```
- Comportamiento:
  - Inserta el like en la tabla `likes`.
  - Si no se envía `id_dispositivo`, lo busca por `id_usuario_instagram` en `devices`.
  - Envía notificación FCM con `data` `{ screen: "profile", id_usuario_instagram: "..." }`.
- Respuesta:
```
{ "ok": true, "message": "Like registrado y notificación procesada" }
```

### `POST /api/instagram/like`
Simula (u opcionalmente intenta) enviar un like al API de Instagram.
- Body (JSON):
```
{
  "id_foto_instagram": "<string>",
  "id_usuario_instagram": "<string>"
}
```
- Nota: El Basic Display API no soporta likes. Si tienes permisos del Graph API y `INSTAGRAM_ACCESS_TOKEN`, se intenta llamar al endpoint `/{media-id}/likes`; de lo contrario, se devuelve una simulación.

## Modelo de Datos
- Tabla `devices(id_usuario_instagram UNIQUE, id_dispositivo TOKEN)`
- Tabla `likes(id_foto_instagram, id_usuario_instagram, device_token, created_at)`

## Pruebas Rápidas (cURL)
1. Registrar dispositivo:
```
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{"id_usuario_instagram":"owner_instagram_id","id_dispositivo":"<TOKEN_FCM>"}'
```
2. Enviar like:
```
curl -X POST http://localhost:3000/api/likes \
  -H "Content-Type: application/json" \
  -d '{"id_foto_instagram":"123","id_usuario_instagram":"owner_instagram_id"}'
```
3. (Opcional) Like en Instagram:
```
curl -X POST http://localhost:3000/api/instagram/like \
  -H "Content-Type: application/json" \
  -d '{"id_foto_instagram":"123","id_usuario_instagram":"owner_instagram_id"}'
```

## Consideraciones de Seguridad y Privacidad
- Almacena las credenciales del servicio Firebase de forma segura (`GOOGLE_APPLICATION_CREDENTIALS`).
- No expongas tokens FCM públicamente.
- Implementa autenticación en producción para evitar abuso de los endpoints.

## Cómo exportar a PDF
Puedes abrir este archivo `.md` en un editor y exportarlo a PDF (por ejemplo desde VS Code con extensiones de Markdown PDF, o cargándolo en Google Docs y exportando).