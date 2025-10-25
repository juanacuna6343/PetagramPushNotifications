package com.example.lugarespereiraapp.model

import com.google.gson.annotations.SerializedName

data class RegistroUsuarioRequest(
    @SerializedName("id_dispositivo")
    val idDispositivo: String,
    
    @SerializedName("id_usuario_instagram")
    val idUsuarioInstagram: String
)