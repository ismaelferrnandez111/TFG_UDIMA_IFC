//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
desc_barrio_local	:String,
desc_distrito_local	:String,
id_distrito_local	:String,
Edad_Mayoritaria:Number,
Contar:Number,
Tramo_edad	:String
});

module.exports = mongoose.model('aux_edades2',TaskSchema);



















