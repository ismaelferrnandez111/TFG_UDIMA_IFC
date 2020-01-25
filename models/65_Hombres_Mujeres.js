//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
DESC_BARRIO:String,
EspanolesHombres_may_65:Number,
ExtranjerosHombres_may_65:Number,
EspanolesMujeres_may_65:Number,
ExtranjerosMujeres_may_65:Number,
Hombres_may_65:Number,
Mujeres_may_65:Number
});

module.exports = mongoose.model('aux_65_Hombres_Mujeres',TaskSchema);















