package com.example.petagrampush

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class ProfileActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        val userId = intent.getStringExtra("id_usuario_instagram") ?: "(sin id)"
        val textView = findViewById<TextView>(R.id.profileInfo)
        textView.text = "Perfil de usuario Instagram: $userId"
    }
}