//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
    IdBarrio: Number,
    DESC_BARRIO:String,
    EspanolesHombres:Number,
    EspanolesMujeres:Number,
    ExtranjerosHombres:Number,
    ExtranjerosMujeres:Number,
    Hombres:Number,
    Mujeres:Number,
    Numero_autoescuelas:Number,
    Numero_bares:Number,
    Numero_estancos:Number,
    Numero_farmacias:Number,
    Numero_inmobiliarias:Number,
    Numero_locutorios:Number,
    Numero_talleres:Number,
    Numero_gimnasios:Number,
    Numero_centros_esteticas:Number

});

module.exports = mongoose.model('clusters',TaskSchema);





















