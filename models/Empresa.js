//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
id_distrito_local:String,
desc_distrito_local:String,
id_barrio_local:String,
desc_barrio_local:String,
desc_situacion_local:String,
rotulo:String,
id_seccion:String,
desc_seccion:String,
id_division:String,
desc_division:String,
id_epigrafe:String,
desc_epigrafe:String
});

module.exports = mongoose.model('empresas',TaskSchema);















