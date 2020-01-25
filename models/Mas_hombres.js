//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema2=
new Schema({

	Mas_hombres:String,
	Mas_hombres_espanoles:String,
	Mas_hombres_extranjeros :String,  
	desc_barrio_local:String
  
});


module.exports = mongoose.model('aux_mas_hombres',TaskSchema2);













