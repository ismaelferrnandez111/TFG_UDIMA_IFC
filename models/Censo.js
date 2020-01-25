//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema2=
new Schema({
    COD_DISTRITO:String,
	DESC_DISTRITO:String,
	COD_DIST_BARRIO:String,
	DESC_BARRIO:String,
	COD_BARRIO:String,
	COD_DIST_SECCION:String,
	COD_SECCION:String,
	COD_EDAD_INT:Number,
	EspanolesHombres:Number,
	EspanolesMujeres:Number,
	ExtranjerosHombres:Number,
	ExtranjerosMujeres:Number
});


module.exports = mongoose.model('censos',TaskSchema2);













