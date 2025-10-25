package com.example.lugarespereiraapp.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.lugarespereiraapp.R
import com.example.lugarespereiraapp.model.Lugar

class LugaresAdapter(private val lugares: List<Lugar>) : 
    RecyclerView.Adapter<LugaresAdapter.LugarViewHolder>() {

    class LugarViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val imageView: ImageView = itemView.findViewById(R.id.imageViewLugar)
        val textViewNombre: TextView = itemView.findViewById(R.id.textViewNombre)
        val textViewDescripcion: TextView = itemView.findViewById(R.id.textViewDescripcion)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): LugarViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_lugar, parent, false)
        return LugarViewHolder(view)
    }

    override fun onBindViewHolder(holder: LugarViewHolder, position: Int) {
        val lugar = lugares[position]
        
        holder.textViewNombre.text = lugar.nombre
        holder.textViewDescripcion.text = lugar.descripcion
        
        // Load image with Glide
        Glide.with(holder.itemView.context)
            .load(lugar.imagenUrl)
            .placeholder(R.drawable.ic_placeholder)
            .error(R.drawable.ic_error)
            .into(holder.imageView)
    }

    override fun getItemCount(): Int = lugares.size
}