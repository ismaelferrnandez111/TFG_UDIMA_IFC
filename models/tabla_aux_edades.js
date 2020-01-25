//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
desc_barrio_local	:String,
Edad_Mayoritaria:Number,
Contar:Number,
desc_distrito_local:String,
id_distrito_local:String


});

module.exports = mongoose.model('tabla_aux_edades',TaskSchema);



















