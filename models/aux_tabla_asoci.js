//utilizaremos para manejar la base de datos mongodb
//Es un esquema sobre los campo que se van a manejar.
//Cargamos el esquema mongoose

const mongoose=require('mongoose');
//Usaremos el esquema.
const Schema =mongoose.Schema;
const TaskSchema=
new Schema({
    Tramo_edad:String,
    DESC_BARRIO:String,
    EspanolesHombres:Number,
    EspanolesMujeres:Number,
    ExtranjerosHombres:Number,
    ExtranjerosMujeres:Number,
    Hombres:Number,
    Mujeres:Number,
    Numero_autoescuelas:Number,
    Numero_bares:Number,
    Numero_estancos:Number,
    Numero_farmacias:Number,
    Numero_inmobiliarias:Number,
    Numero_locutorios:Number,
    Numero_talleres:Number,
    Numero_gimnasios:Number,
    Numero_centros_esteticas:Number,
    EspanolesHombres_men_18 :Number,     
    EspanolesMujeres_men_18  :Number,    
    ExtranjerosMujeres_men_18  :Number,  
    ExtranjerosHombres_men_18  :Number,  
    Hombres_men_18    :Number,           
    Mujeres_men_18 :Number,              
    EspanolesHombres_may_30  :Number,    
    EspanolesMujeres_may_30  :Number,    
    ExtranjerosMujeres_may_30 :Number,   
    ExtranjerosHombres_may_30  :Number,  
    Hombres_may_30 :Number,              
    Mujeres_may_30   :Number,            
    EspanolesHombres_men_30   :Number,   
    EspanolesMujeres_men_30 :Number,     
    ExtranjerosMujeres_men_30  :Number,  
    ExtranjerosHombres_men_30  :Number,  
    Hombres_men_30    :Number,           
    Mujeres_men_30  :Number,             
    EspanolesHombres_may_65   :Number,   
    EspanolesMujeres_may_65 :Number,      
    ExtranjerosMujeres_may_65  :Number,  
    ExtranjerosHombres_may_65  :Number,  
    Hombres_may_65  :Number,             
    Mujeres_may_65  :Number    ,

    EspanolesHombres_may_75   :Number,   
    EspanolesMujeres_may_75 :Number,      
    ExtranjerosMujeres_may_75  :Number,  
    ExtranjerosHombres_may_75  :Number,  
    Hombres_may_75  :Number,             
    Mujeres_may_75  :Number    ,
    EspanolesHombres_may_51   :Number,   
    EspanolesMujeres_may_51 :Number,      
    ExtranjerosMujeres_may_51  :Number,  
    ExtranjerosHombres_may_51  :Number,  
    Hombres_may_51  :Number,             
    Mujeres_may_51 :Number  ,
    EspanolesHombres_may_40   :Number,   
    EspanolesMujeres_may_40 :Number,      
    ExtranjerosMujeres_may_40  :Number,  
    ExtranjerosHombres_may_40  :Number,  
    Hombres_may_40  :Number,             
    Mujeres_may_40 :Number         
    


});

module.exports = mongoose.model('aux_tabla_asoci',TaskSchema);





















