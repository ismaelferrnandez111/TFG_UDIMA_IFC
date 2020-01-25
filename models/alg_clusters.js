//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
    centroid: [Number],
    cluster : new Array(),
    clusterInd: [String]

});

module.exports = mongoose.model('alg_clusters',TaskSchema);





















