//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
DESC_BARRIO:String,
EspanolesHombres_may_51:Number,
ExtranjerosHombres_may_51:Number,
EspanolesMujeres_may_51:Number,
ExtranjerosMujeres_may_51:Number,
Hombres_may_51:Number,
Mujeres_may_51:Number
});

module.exports = mongoose.model('aux_51_Hombres_Mujeres',TaskSchema);















