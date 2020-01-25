//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
DESC_BARRIO:String,
EspanolesHombres_men_18:Number,
ExtranjerosHombres_men_18:Number,
EspanolesMujeres_men_18:Number,
ExtranjerosMujeres_men_18:Number,
Hombres_men_18:Number,
Mujeres_men_18:Number
});

module.exports = mongoose.model('aux_18_men_Hombres_Mujeres',TaskSchema);















