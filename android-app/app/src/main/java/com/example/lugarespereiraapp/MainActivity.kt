package com.example.lugarespereiraapp

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.lugarespereiraapp.adapter.LugaresAdapter
import com.example.lugarespereiraapp.api.ApiService
import com.example.lugarespereiraapp.api.RetrofitClient
import com.example.lugarespereiraapp.model.Lugar
import com.example.lugarespereiraapp.model.RegistroUsuarioRequest
import com.google.firebase.messaging.FirebaseMessaging
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "MainActivity"
    }

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: LugaresAdapter
    private lateinit var apiService: ApiService
    private val lugares = mutableListOf<Lugar>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        setupRecyclerView()
        setupApi()
        loadLugares()
        
        // Initialize Firebase Messaging
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (!task.isSuccessful) {
                Log.w(TAG, "Fetching FCM registration token failed", task.exception)
                return@addOnCompleteListener
            }

            // Get new FCM registration token
            val token = task.result
            Log.d(TAG, "FCM Registration Token: $token")
            
            // Save token locally
            saveTokenLocally(token)
        }
    }

    private fun setupRecyclerView() {
        recyclerView = findViewById(R.id.recyclerViewLugares)
        adapter = LugaresAdapter(lugares)
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter
    }

    private fun setupApi() {
        apiService = RetrofitClient.getApiService()
    }

    private fun loadLugares() {
        // Sample data for demonstration
        lugares.addAll(listOf(
            Lugar("1", "Parque Arboleda", "Hermoso parque en el centro de Pereira", "https://example.com/image1.jpg"),
            Lugar("2", "Catedral de Pereira", "Iglesia principal de la ciudad", "https://example.com/image2.jpg"),
            Lugar("3", "Plaza de Bolívar", "Plaza central histórica", "https://example.com/image3.jpg"),
            Lugar("4", "Zoológico Matecaña", "Zoológico con fauna local", "https://example.com/image4.jpg")
        ))
        adapter.notifyDataSetChanged()
    }

    private fun saveTokenLocally(token: String) {
        val sharedPref = getSharedPreferences("fcm_token", Context.MODE_PRIVATE)
        with(sharedPref.edit()) {
            putString("token", token)
            apply()
        }
    }

    private fun getStoredToken(): String? {
        val sharedPref = getSharedPreferences("fcm_token", Context.MODE_PRIVATE)
        return sharedPref.getString("token", null)
    }

    private fun getUserInstagramId(): String {
        // For demonstration, return a sample Instagram ID
        // In a real app, this would come from user login/preferences
        return "sample_instagram_user_123"
    }

    private fun registrarUsuarioParaNotificaciones() {
        val token = getStoredToken()
        if (token == null) {
            Toast.makeText(this, "Token FCM no disponible", Toast.LENGTH_SHORT).show()
            return
        }

        val instagramId = getUserInstagramId()
        val request = RegistroUsuarioRequest(token, instagramId)

        apiService.registrarUsuario(request).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(
                        this@MainActivity,
                        "Usuario registrado para notificaciones",
                        Toast.LENGTH_LONG
                    ).show()
                    Log.d(TAG, "Usuario registrado exitosamente")
                } else {
                    Toast.makeText(
                        this@MainActivity,
                        "Error al registrar usuario: ${response.code()}",
                        Toast.LENGTH_LONG
                    ).show()
                    Log.e(TAG, "Error al registrar usuario: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(
                    this@MainActivity,
                    "Error de conexión: ${t.message}",
                    Toast.LENGTH_LONG
                ).show()
                Log.e(TAG, "Error de conexión", t)
            }
        })
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_recibir_notificaciones -> {
                registrarUsuarioParaNotificaciones()
                true
            }
            R.id.action_configuracion -> {
                Toast.makeText(this, "Configuración", Toast.LENGTH_SHORT).show()
                true
            }
            R.id.action_acerca_de -> {
                Toast.makeText(this, "Lugares Pereira App v1.0", Toast.LENGTH_SHORT).show()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}