//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
DESC_BARRIO:String,
EspanolesHombres_may_30:Number,
ExtranjerosHombres_may_30:Number,
EspanolesMujeres_may_30:Number,
ExtranjerosMujeres_may_30:Number,
Hombres_may_30:Number,
Mujeres_may_30:Number
});

module.exports = mongoose.model('aux_30_Hombres_Mujeres',TaskSchema);















