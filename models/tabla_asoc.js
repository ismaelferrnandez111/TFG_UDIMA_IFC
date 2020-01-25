//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
        Mas_hombres:Number,
        Mas_hombres_Espanoles:Number,
        Mas_hombres_extranjeros :Number,
        desc_barrio_local:String,
        Muy_joven:Number,
        Adulto:Number,
        Joven:Number,
        Muy_mayor:Number,
        Mas_hombres_Espanoles_men18:Number,
        Mas_mujeres_Espanoles_men18:Number,
        Mas_hombres_extranjeros_men18:Number,
        Mas_mujeres_extranjeros_men18:Number,

        Mas_hombres_Espanoles_men30:Number,
        Mas_mujeres_Espanoles_men30:Number,
        Mas_hombres_extranjeros_men30:Number,
        Mas_mujeres_extranjeros_men30:Number,

        Mas_hombres_Espanoles_may30:Number,
        Mas_mujeres_Espanoles_may30:Number,
        Mas_hombres_extranjeros_may30:Number,
        Mas_mujeres_extranjeros_may30:Number,

        Mas_hombres_Espanoles_may40:Number,
        Mas_mujeres_Espanoles_may40:Number,
        Mas_hombres_extranjeros_may40:Number,
        Mas_mujeres_extranjeros_may40:Number,

        Mas_hombres_Espanoles_may51:Number,
        Mas_mujeres_Espanoles_may51:Number,
        Mas_hombres_extranjeros_may51:Number,
        Mas_mujeres_extranjeros_may51:Number,

        Mas_hombres_Espanoles_may65:Number,
        Mas_mujeres_Espanoles_may65:Number,
        Mas_hombres_extranjeros_may65:Number,
        Mas_mujeres_extranjeros_may65:Number,

        Mas_hombres_Espanoles_may75:Number,
        Mas_mujeres_Espanoles_may75:Number,
        Mas_hombres_extranjeros_may75:Number,
        Mas_mujeres_extranjeros_may75:Number,

        Numero_locutorios_men5 :Number, 
        Numero_estancos_men5 :Number,   
        Numero_autoescuelas_men5:Number,
        Numero_farmacias_men5   :Number, 
        Numero_inmobiliarias_men5:Number,
        
        
        Tipo_bares:Number,
        Tipo_autoescuelas:Number,
        Tipo_estancos:Number,
        Tipo_farmacias:Number,
        Tipo_inmobiliarias:Number,
        Tipo_locutorios:Number,
        Tipo_talleres:Number,
        Tipo_gimnasios:Number,
        Tipo_centros_esteticas:Number
});

module.exports = mongoose.model('tabla_asocis',TaskSchema);





















