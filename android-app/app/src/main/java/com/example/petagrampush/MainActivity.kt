package com.example.petagrampush

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.messaging.FirebaseMessaging
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class MainActivity : AppCompatActivity() {
    private val client = OkHttpClient()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val tokenView = findViewById<TextView>(R.id.tokenView)
        val btnRegister = findViewById<Button>(R.id.btnRegister)
        val editUserId = findViewById<EditText>(R.id.editUserId)
        val statusView = findViewById<TextView>(R.id.statusView)

        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (!task.isSuccessful) {
                tokenView.text = "Error obteniendo token"
                return@addOnCompleteListener
            }
            val token = task.result
            tokenView.text = token

            btnRegister.setOnClickListener {
                val idUsuarioInstagram = editUserId.text.toString().trim()
                if (idUsuarioInstagram.isEmpty()) {
                    Toast.makeText(this, "Ingresa id_usuario_instagram antes de registrar", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
                // Run network call off the UI thread
                Thread {
                    val ok = registerDeviceToken(idUsuarioInstagram, token)
                    runOnUiThread {
                        if (ok) {
                            statusView.text = "Dispositivo registrado para $idUsuarioInstagram"
                        } else {
                            statusView.text = "Fallo al registrar dispositivo"
                        }
                    }
                }.start()
            }
        }
    }

    private fun registerDeviceToken(idUsuarioInstagram: String, token: String): Boolean {
        return try {
            val serverBaseUrl = getString(R.string.server_base_url)
            val url = "$serverBaseUrl/api/devices/register"
            val json = "{" +
                    "\"id_usuario_instagram\":\"$idUsuarioInstagram\"," +
                    "\"id_dispositivo\":\"$token\"" +
                    "}"
            val mediaType = "application/json; charset=utf-8".toMediaType()
            val body = json.toRequestBody(mediaType)
            val request = Request.Builder().url(url).post(body).build()
            client.newCall(request).execute().use { response ->
                response.isSuccessful
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}