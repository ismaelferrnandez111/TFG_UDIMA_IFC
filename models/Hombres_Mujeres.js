//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
DESC_BARRIO:String,
EspanolesHombres:Number,
ExtranjerosHombres:Number,
EspanolesMujeres:Number,
ExtranjerosMujeres:Number,
Hombres:Number,
Mujeres:Number
});

module.exports = mongoose.model('aux_hombres_mujeres',TaskSchema);















