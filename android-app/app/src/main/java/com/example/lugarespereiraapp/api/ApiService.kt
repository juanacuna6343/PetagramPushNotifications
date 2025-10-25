package com.example.lugarespereiraapp.api

import com.example.lugarespereiraapp.model.RegistroUsuarioRequest
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    
    @POST("registrar-usuario")
    fun registrarUsuario(@Body request: RegistroUsuarioRequest): Call<Void>
}