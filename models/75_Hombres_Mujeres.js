//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
DESC_BARRIO:String,
EspanolesHombres_may_75:Number,
ExtranjerosHombres_may_75:Number,
EspanolesMujeres_may_75:Number,
ExtranjerosMujeres_may_75:Number,
Hombres_may_75:Number,
Mujeres_may_75:Number
});

module.exports = mongoose.model('aux_75_Hombres_Mujeres',TaskSchema);















