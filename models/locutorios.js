//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
desc_barrio_local	:String,
Numero_locutorios:Number


});

module.exports = mongoose.model('aux_locutorios',TaskSchema);



















