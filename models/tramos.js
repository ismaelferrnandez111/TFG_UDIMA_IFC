//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
    Muy_joven: String,
    Adulto: String,
    Joven :  String,
    Muy_mayor:String,
    desc_barrio_local:String


});

module.exports = mongoose.model('aux_tramos',TaskSchema);



















