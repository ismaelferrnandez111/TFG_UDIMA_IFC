const express = require('express');
const router = express.Router();
const empresas = require('../models/Empresa');
const censos = require('../models/Censo');
const aux_edades2 = require('../models/aux_edades2');
const tabla_aux_edades = require('../models/tabla_aux_edades');
const Aux_Hombres_Mujeres = require('../models/Hombres_Mujeres');
const aux_bares = require('../models/bares');
const aux_gimnasios = require('../models/gimnasios');
const aux_talleres = require('../models/talleres');
const aux_farmacias = require('../models/farmacias');
const aux_locutorios = require('../models/locutorios');
const aux_centros_esteticas = require('../models/centros_esteticas');
const aux_estancos = require('../models/estancos');
const aux_autoescuelas = require('../models/autoescuelas');
const aux_inmobiliarias = require('../models/inmobiliarias');
const clusters = require('../models/clusters');
const aux_tramos = require('../models/tramos');
const aux_mas_hombres = require('../models/Mas_hombres');
const aux_30_Hombres_Mujeres = require('../models/30_Hombres_Mujeres');
const aux_40_Hombres_Mujeres = require('../models/40_Hombres_Mujeres');
const aux_51_Hombres_Mujeres = require('../models/51_Hombres_Mujeres');
const aux_65_Hombres_Mujeres = require('../models/65_Hombres_Mujeres');
const aux_75_Hombres_Mujeres = require('../models/75_Hombres_Mujeres');
const aux_30_men_Hombres_Mujeres = require('../models/Menores_30_Hombres_Mujeres');
const aux_18_men_Hombres_Mujeres = require('../models/Menores_18_Hombres_Mujeres');
const aux_tabla_asoci = require('../models/aux_tabla_asoci');
const tabla_asocis = require('../models/tabla_asoc');
const alg_clusters = require('../models/alg_clusters');
const alg_asociaciones = require('../models/alg_asociaciones');
const aux_barrios = require('../models/barrios');




var path = require('path');
/*Variables para la carga del fichero*/
const app = require('express')();
var str = require('string-to-stream');
var toArray = require("to-array");
const csv = require('csv-parser');
const fileUpload = require('express-fileupload');
const server = require('http').Server(app);


app.use(fileUpload());
server.listen(80);


/* GET Pagina de inicio */
router.get('/', (req, res) => {
  res.render('index');
});

/*Pagina cargar fichero*/
router.get('/Carga_fichero.ejs', async (req, res) => {
  const task = await empresas.find().limit(5);
  const task1 = await censos.find().limit(5);
  console.log(task);
  console.log(task1);
  res.render('Carga_fichero.ejs', { task: task, task1: task1 });
});

//Pagina con el mensaje de cargar censo
router.post('/CargarCenso.ejs', async (req, res, next) => {

  let headers = Object.keys(censos.schema.paths).filter(k => ['_id', '__v'].indexOf(k) === -1);
  await new Promise((resolve, reject) => {
    let buffer = [],
      counter = 1;
    let stream = str(req.body.censoContent)
      .pipe(
        csv({ headers }))
      .on("error", reject)
      .on("data", async doc => {
        if (doc.COD_BARRIO != "COD_BARRIO") {
          doc.DESC_BARRIO = doc.DESC_BARRIO.trimEnd();
          doc.DESC_DISTRITO = doc.DESC_DISTRITO.trimEnd();
          stream.pause();
          buffer.push(doc);
          counter++;
          try {
            if (counter > 150000) {
              await censos.insertMany(buffer);
              buffer = [];
              counter = 1;
            }
          } catch (e) {
            stream.destroy(e);
          }

          stream.resume();
        }
      })
      .on("end", async () => {
        try {
          if (counter > 0) {
            await censos.insertMany(buffer);
            buffer = [];
            counter = 1;
            resolve();
          }
        } catch (e) {
          stream.destroy(e);
        }
        res.render('CargarCenso.ejs');
      }

      );

  });
});



//Pagina con el mensaje de cargar censo
router.post('/CargarEmpresa.ejs', async (req, res, next) => {

  let headers = Object.keys(empresas.schema.paths).filter(k => ['_id', '__v'].indexOf(k) === -1);
  await new Promise((resolve, reject) => {
    let buffer = [],
      counter = 1;
    let stream = str(req.body.empresaContent)
      .pipe(
        csv({ headers }))
      .on("error", reject)
      .on("data", async doc => {
        if (doc.desc_barrio_local != "desc_barrio_local") {
          doc.desc_distrito_local = doc.desc_distrito_local.trimEnd();
          doc.desc_barrio_local = doc.desc_barrio_local.trimEnd();
          stream.pause();
          buffer.push(doc);
          counter++;
          try {
            if (counter > 100000) {
              await empresas.insertMany(buffer);
              buffer = [];
              counter = 1;
            }
          } catch (e) {
            stream.destroy(e);
          }

          stream.resume();
        }
      })
      .on("end", async () => {
        try {
          if (counter > 1) {
            await empresas.insertMany(buffer);
            buffer = [];
            counter = 1;
            resolve();
          }
        } catch (e) {
          stream.destroy(e);
        }
        res.render('CargarEmpresa.ejs');
      }

      );

  });
});




const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});


//Pagina Posproceso , en este parte se realiza todo el posproceso de las tablas

router.post('/Posproceso.ejs', async (req, res) => {


  //Actualizamos los campos para que 0 aparezcan a nulo
  await censos.updateMany({ ExtranjerosHombres: null }, { "$set": { ExtranjerosHombres: 0 } })
  await censos.updateMany({ ExtranjerosMujeres: null }, { "$set": { ExtranjerosMujeres: 0 } })
  await censos.updateMany({ EspanolesHombres: null }, { "$set": { EspanolesHombres: 0 } })
  await censos.updateMany({ EspanolesMujeres: null }, { "$set": { EspanolesMujeres: 0 } })


  //Eliminamos de la tabla empresas los estados que 0 se van analizar
  await empresas.deleteMany({ desc_situacion_local: "Baja PC Asociado" })
  await empresas.deleteMany({ desc_situacion_local: "Baja" })
  await empresas.deleteMany({ desc_situacion_local: "Uso vivienda" })
  await empresas.deleteMany({ desc_situacion_local: "En obras" });

  //ELIMINAMOS TABLAS PARA PODER REEJECUTAR
  await tabla_aux_edades.deleteMany();
  await Aux_Hombres_Mujeres.deleteMany();
  await aux_bares.deleteMany();
  await aux_talleres.deleteMany();
  await aux_farmacias.deleteMany();
  await aux_locutorios.deleteMany();
  await aux_estancos.deleteMany();
  await aux_autoescuelas.deleteMany();
  await aux_gimnasios.deleteMany();
  await aux_inmobiliarias.deleteMany();
  await aux_centros_esteticas.deleteMany();
  await aux_mas_hombres.deleteMany();
  await aux_30_Hombres_Mujeres.deleteMany();
  await aux_51_Hombres_Mujeres.deleteMany();
  await aux_65_Hombres_Mujeres.deleteMany();
  await aux_30_men_Hombres_Mujeres.deleteMany();
  await aux_18_men_Hombres_Mujeres.deleteMany();
  await aux_40_Hombres_Mujeres.deleteMany();
  await aux_75_Hombres_Mujeres.deleteMany();
  await tabla_asocis.deleteMany();



  //const censo2 =  await censos.find({}).select('COD_DISTRITO DESC_DISTRITO DESC_BARRION').limit(5);
  //Tres primeros campos de nuestra tabla de hechos desc_barrio ,desc_distrito,cod_distrito

  //Generamos la variable edad_mayoritaria por barrio que luego utilizaremos para el tramo edad

  var query = censos.aggregate([

    {
      "$group": {
        "_id": {
          "COD_DISTRITO": "$COD_DISTRITO",
          "DESC_DISTRITO": "$DESC_DISTRITO",
          "COD_EDAD_INT": "$COD_EDAD_INT",
          "DESC_BARRIO": "$DESC_BARRIO"
        },
        "COUNT(COD_EDAD_INT)": {
          "$sum": 1
        }
      }
    },
    {
      "$project": {
        "COD_DISTRITO": "$_id.COD_DISTRITO",
        "DESC_DISTRITO": "$_id.DESC_DISTRITO",
        "CONTAR": "$COUNT(COD_EDAD_INT)",
        "COD_EDAD_INT": "$_id.COD_EDAD_INT",
        "DESC_BARRIO": "$_id.DESC_BARRIO",
        "_id": 0
      }
    },
    {
      "$sort": {
        "DESC_BARRIO": 1,
        "COUNT(COD_EDAD_INT)": -1
      }
    }

  ]);


  await query.exec((err, censoData2) => {
    //console.log(censoData2);
    const groupByDESC_BARRIO = groupBy('DESC_BARRIO');
    const groupped = groupByDESC_BARRIO(censoData2);

    function compare(a, b) {
      if (a.CONTAR < b.CONTAR) {
        return 1;
      }
      if (a.CONTAR > b.CONTAR) {
        return -1;
      }
      return 0;
    }
    var result = [];
    for (var [key, value] of Object.entries(groupped)) {
      var sorted = value.sort(compare);
      result.push(sorted[0]);
    };
    // console.log(result);


    for (const censos of result) {

      tabla_aux_edades.create({

        desc_barrio_local: censos.DESC_BARRIO,
        Edad_Mayoritaria: censos.COD_EDAD_INT,
        Contar: censos.CONTAR,
        desc_distrito_local: censos.DESC_DISTRITO,
        id_distrito_local: censos.COD_DISTRITO

      }
        , function (err, res) {

        })
    }
  });
  //Generamos las variables hombres y las guardamos en la tabla.


  var hombres = censos.aggregate([

    {
      "$group": {
        "_id": {
          "DESC_BARRIO": "$DESC_BARRIO"
        },

        "EspanolesHombres": {
          "$sum": "$EspanolesHombres"
        },
        "ExtranjerosHombres": {
          "$sum": "$ExtranjerosHombres"
        },
        "Hombres":
        {
          "$sum": { "$add": ["$EspanolesHombres", "$ExtranjerosHombres"] }
        },
        "EspanolesMujeres": {
          "$sum": "$EspanolesMujeres"
        },
        "ExtranjerosMujeres": {
          "$sum": "$ExtranjerosMujeres"
        },
        "Mujeres":
        {
          "$sum": { "$add": ["$EspanolesMujeres", "$ExtranjerosMujeres"] }
        }

      }
    },
    {
      "$project": {
        "DESC_BARRIO": "$_id.DESC_BARRIO",
        "EspanolesHombres": "$EspanolesHombres",
        "ExtranjerosHombres": "$ExtranjerosHombres",
        "Hombres": "$Hombres",
        "EspanolesMujeres": "$EspanolesMujeres",
        "ExtranjerosMujeres": "$ExtranjerosMujeres",
        "Mujeres": "$Mujeres",
        "_id": 0
      }
    }
  ]);
  await hombres.exec((err, cantidad) => {

    //console.log(cantidad);

    for (const censos of cantidad) {

      Aux_Hombres_Mujeres.create({

        DESC_BARRIO: censos.DESC_BARRIO,
        EspanolesHombres: censos.EspanolesHombres,
        ExtranjerosHombres: censos.ExtranjerosHombres,
        EspanolesMujeres: censos.EspanolesMujeres,
        ExtranjerosMujeres: censos.ExtranjerosMujeres,
        Hombres: censos.Hombres,
        Mujeres: censos.Mujeres

      }
        , function (err, res) {

        })
    }

  });


  var hombres_75 = censos.aggregate([
    {
      "$match": {
        "COD_EDAD_INT": { "$gte": 75, }

      }
    },

    {
      "$group": {
        "_id": {
          "DESC_BARRIO": "$DESC_BARRIO"
        },
        "EspanolesHombres": {
          "$sum": "$EspanolesHombres"
        },
        "ExtranjerosHombres": {
          "$sum": "$ExtranjerosHombres"
        },
        "Hombres":
        {
          "$sum": { "$add": ["$EspanolesHombres", "$ExtranjerosHombres"] }
        },
        "EspanolesMujeres": {
          "$sum": "$EspanolesMujeres"
        },
        "ExtranjerosMujeres": {
          "$sum": "$ExtranjerosMujeres"
        },
        "Mujeres":
        {
          "$sum": { "$add": ["$EspanolesMujeres", "$ExtranjerosMujeres"] }
        }

      }
    },
    {
      "$project": {
        "DESC_BARRIO": "$_id.DESC_BARRIO",
        "EspanolesHombres_may_75": "$EspanolesHombres",
        "ExtranjerosHombres_may_75": "$ExtranjerosHombres",
        "Hombres_may_75": "$Hombres",
        "EspanolesMujeres_may_75": "$EspanolesMujeres",
        "ExtranjerosMujeres_may_75": "$ExtranjerosMujeres",
        "Mujeres_may_75": "$Mujeres",
        "_id": 0
      }
    }
  ]); await hombres_75.exec((err, cantidad) => {

    //console.log(cantidad);

    for (const censos of cantidad) {

      aux_75_Hombres_Mujeres.create({

        DESC_BARRIO: censos.DESC_BARRIO,
        EspanolesHombres_may_75: censos.EspanolesHombres_may_75,
        ExtranjerosHombres_may_75: censos.ExtranjerosHombres_may_75,
        EspanolesMujeres_may_75: censos.EspanolesMujeres_may_75,
        ExtranjerosMujeres_may_75: censos.ExtranjerosMujeres_may_75,
        Hombres_may_75: censos.Hombres_may_75,
        Mujeres_may_75: censos.Mujeres_may_75

      }
        , function (err, res) {

        })
    }

  });

  //Cantidad de hombres y mujeres mayores e iguales de 65 años y menores de 75


  var hombres_65 = censos.aggregate([
    {
      "$match": {
        "COD_EDAD_INT": { "$gte": 65, "$lt": 75 }

      }
    },

    {
      "$group": {
        "_id": {
          "DESC_BARRIO": "$DESC_BARRIO"
        },
        "EspanolesHombres": {
          "$sum": "$EspanolesHombres"
        },
        "ExtranjerosHombres": {
          "$sum": "$ExtranjerosHombres"
        },
        "Hombres":
        {
          "$sum": { "$add": ["$EspanolesHombres", "$ExtranjerosHombres"] }
        },
        "EspanolesMujeres": {
          "$sum": "$EspanolesMujeres"
        },
        "ExtranjerosMujeres": {
          "$sum": "$ExtranjerosMujeres"
        },
        "Mujeres":
        {
          "$sum": { "$add": ["$EspanolesMujeres", "$ExtranjerosMujeres"] }
        }

      }
    },
    {
      "$project": {
        "DESC_BARRIO": "$_id.DESC_BARRIO",
        "EspanolesHombres_may_65": "$EspanolesHombres",
        "ExtranjerosHombres_may_65": "$ExtranjerosHombres",
        "Hombres_may_65": "$Hombres",
        "EspanolesMujeres_may_65": "$EspanolesMujeres",
        "ExtranjerosMujeres_may_65": "$ExtranjerosMujeres",
        "Mujeres_may_65": "$Mujeres",
        "_id": 0
      }
    }
  ]); await hombres_65.exec((err, cantidad) => {

    //console.log(cantidad);

    for (const censos of cantidad) {

      aux_65_Hombres_Mujeres.create({

        DESC_BARRIO: censos.DESC_BARRIO,
        EspanolesHombres_may_65: censos.EspanolesHombres_may_65,
        ExtranjerosHombres_may_65: censos.ExtranjerosHombres_may_65,
        EspanolesMujeres_may_65: censos.EspanolesMujeres_may_65,
        ExtranjerosMujeres_may_65: censos.ExtranjerosMujeres_may_65,
        Hombres_may_65: censos.Hombres_may_65,
        Mujeres_may_65: censos.Mujeres_may_65

      }
        , function (err, res) {

        })
    }

  });
  //Cantidad de hombres y mujeres mayores e iguales de 51 años 



  var hombres_51 = censos.aggregate([
    {
      "$match": {
        "COD_EDAD_INT": { "$gte": 51, "$lt": 65 }

      }
    },

    {
      "$group": {
        "_id": {
          "DESC_BARRIO": "$DESC_BARRIO"
        },
        "EspanolesHombres": {
          "$sum": "$EspanolesHombres"
        },
        "ExtranjerosHombres": {
          "$sum": "$ExtranjerosHombres"
        },
        "Hombres":
        {
          "$sum": { "$add": ["$EspanolesHombres", "$ExtranjerosHombres"] }
        },
        "EspanolesMujeres": {
          "$sum": "$EspanolesMujeres"
        },
        "ExtranjerosMujeres": {
          "$sum": "$ExtranjerosMujeres"
        },
        "Mujeres":
        {
          "$sum": { "$add": ["$EspanolesMujeres", "$ExtranjerosMujeres"] }
        }

      }
    },
    {
      "$project": {
        "DESC_BARRIO": "$_id.DESC_BARRIO",
        "EspanolesHombres_may_51": "$EspanolesHombres",
        "ExtranjerosHombres_may_51": "$ExtranjerosHombres",
        "Hombres_may_51": "$Hombres",
        "EspanolesMujeres_may_51": "$EspanolesMujeres",
        "ExtranjerosMujeres_may_51": "$ExtranjerosMujeres",
        "Mujeres_may_51": "$Mujeres",
        "_id": 0
      }
    }
  ]); await hombres_51.exec((err, cantidad) => {

    //console.log(cantidad);

    for (const censos of cantidad) {

      aux_51_Hombres_Mujeres.create({

        DESC_BARRIO: censos.DESC_BARRIO,
        EspanolesHombres_may_51: censos.EspanolesHombres_may_51,
        ExtranjerosHombres_may_51: censos.ExtranjerosHombres_may_51,
        EspanolesMujeres_may_51: censos.EspanolesMujeres_may_51,
        ExtranjerosMujeres_may_51: censos.ExtranjerosMujeres_may_51,
        Hombres_may_51: censos.Hombres_may_51,
        Mujeres_may_51: censos.Mujeres_may_51

      }
        , function (err, res) {

        })
    }

  });

  //Mayores que 40 y menor 51

  var hombres_40 = censos.aggregate([
    {
      "$match": {
        "COD_EDAD_INT": { "$gte": 40, "$lt": 51 }

      }
    },

    {
      "$group": {
        "_id": {
          "DESC_BARRIO": "$DESC_BARRIO"
        },
        "EspanolesHombres": {
          "$sum": "$EspanolesHombres"
        },
        "ExtranjerosHombres": {
          "$sum": "$ExtranjerosHombres"
        },
        "Hombres":
        {
          "$sum": { "$add": ["$EspanolesHombres", "$ExtranjerosHombres"] }
        },
        "EspanolesMujeres": {
          "$sum": "$EspanolesMujeres"
        },
        "ExtranjerosMujeres": {
          "$sum": "$ExtranjerosMujeres"
        },
        "Mujeres":
        {
          "$sum": { "$add": ["$EspanolesMujeres", "$ExtranjerosMujeres"] }
        }

      }
    },
    {
      "$project": {
        "DESC_BARRIO": "$_id.DESC_BARRIO",
        "EspanolesHombres_may_40": "$EspanolesHombres",
        "ExtranjerosHombres_may_40": "$ExtranjerosHombres",
        "Hombres_may_40": "$Hombres",
        "EspanolesMujeres_may_40": "$EspanolesMujeres",
        "ExtranjerosMujeres_may_40": "$ExtranjerosMujeres",
        "Mujeres_may_40": "$Mujeres",
        "_id": 0
      }
    }
  ]); await hombres_40.exec((err, cantidad) => {

    //  console.log(cantidad);

    for (const censos of cantidad) {

      aux_40_Hombres_Mujeres.create({

        DESC_BARRIO: censos.DESC_BARRIO,
        EspanolesHombres_may_40: censos.EspanolesHombres_may_40,
        ExtranjerosHombres_may_40: censos.ExtranjerosHombres_may_40,
        EspanolesMujeres_may_40: censos.EspanolesMujeres_may_40,
        ExtranjerosMujeres_may_40: censos.ExtranjerosMujeres_may_40,
        Hombres_may_40: censos.Hombres_may_40,
        Mujeres_may_40: censos.Mujeres_may_40

      }
        , function (err, res) {

        })
    }

  });

  //Cantidad de hombres y mujeres mayores e iguales de 30 años y Menores que 40



  var hombres_30 = censos.aggregate([
    {
      "$match": {
        "COD_EDAD_INT": { "$gte": 30, "$lt": 40 }

      }
    },

    {
      "$group": {
        "_id": {
          "DESC_BARRIO": "$DESC_BARRIO"
        },
        "EspanolesHombres": {
          "$sum": "$EspanolesHombres"
        },
        "ExtranjerosHombres": {
          "$sum": "$ExtranjerosHombres"
        },
        "Hombres":
        {
          "$sum": { "$add": ["$EspanolesHombres", "$ExtranjerosHombres"] }
        },
        "EspanolesMujeres": {
          "$sum": "$EspanolesMujeres"
        },
        "ExtranjerosMujeres": {
          "$sum": "$ExtranjerosMujeres"
        },
        "Mujeres":
        {
          "$sum": { "$add": ["$EspanolesMujeres", "$ExtranjerosMujeres"] }
        }

      }
    },
    {
      "$project": {
        "DESC_BARRIO": "$_id.DESC_BARRIO",
        "EspanolesHombres_may_30": "$EspanolesHombres",
        "ExtranjerosHombres_may_30": "$ExtranjerosHombres",
        "Hombres_may_30": "$Hombres",
        "EspanolesMujeres_may_30": "$EspanolesMujeres",
        "ExtranjerosMujeres_may_30": "$ExtranjerosMujeres",
        "Mujeres_may_30": "$Mujeres",
        "_id": 0
      }
    }
  ]); await hombres_30.exec((err, cantidad) => {

    //console.log(cantidad);

    for (const censos of cantidad) {

      aux_30_Hombres_Mujeres.create({

        DESC_BARRIO: censos.DESC_BARRIO,
        EspanolesHombres_may_30: censos.EspanolesHombres_may_30,
        ExtranjerosHombres_may_30: censos.ExtranjerosHombres_may_30,
        EspanolesMujeres_may_30: censos.EspanolesMujeres_may_30,
        ExtranjerosMujeres_may_30: censos.ExtranjerosMujeres_may_30,
        Hombres_may_30: censos.Hombres_may_30,
        Mujeres_may_30: censos.Mujeres_may_30

      }
        , function (err, res) {

        })
    }

  });

  //Cantidad de hombres y mujeres Menores de 30 años mayores que 18



  var Menores_30 = censos.aggregate([
    {
      "$match": {
        "COD_EDAD_INT": { "$gt": 18, "$lt": 31 }

      }
    },

    {
      "$group": {
        "_id": {
          "DESC_BARRIO": "$DESC_BARRIO"
        },
        "EspanolesHombres": {
          "$sum": "$EspanolesHombres"
        },
        "ExtranjerosHombres": {
          "$sum": "$ExtranjerosHombres"
        },
        "Hombres":
        {
          "$sum": { "$add": ["$EspanolesHombres", "$ExtranjerosHombres"] }
        },
        "EspanolesMujeres": {
          "$sum": "$EspanolesMujeres"
        },
        "ExtranjerosMujeres": {
          "$sum": "$ExtranjerosMujeres"
        },
        "Mujeres":
        {
          "$sum": { "$add": ["$EspanolesMujeres", "$ExtranjerosMujeres"] }
        }

      }
    },
    {
      "$project": {
        "DESC_BARRIO": "$_id.DESC_BARRIO",
        "EspanolesHombres_men_30": "$EspanolesHombres",
        "ExtranjerosHombres_men_30": "$ExtranjerosHombres",
        "Hombres_men_30": "$Hombres",
        "EspanolesMujeres_men_30": "$EspanolesMujeres",
        "ExtranjerosMujeres_men_30": "$ExtranjerosMujeres",
        "Mujeres_men_30": "$Mujeres",
        "_id": 0
      }
    }
  ]); await Menores_30.exec((err, cantidad) => {

    //console.log(cantidad);

    for (const censos of cantidad) {

      aux_30_men_Hombres_Mujeres.create({

        DESC_BARRIO: censos.DESC_BARRIO,
        EspanolesHombres_men_30: censos.EspanolesHombres_men_30,
        ExtranjerosHombres_men_30: censos.ExtranjerosHombres_men_30,
        EspanolesMujeres_men_30: censos.EspanolesMujeres_men_30,
        ExtranjerosMujeres_men_30: censos.ExtranjerosMujeres_men_30,
        Hombres_men_30: censos.Hombres_men_30,
        Mujeres_men_30: censos.Mujeres_men_30

      }
        , function (err, res) {

        })
    }

  });


  //Cantidad de hombres y mujeres Menores o iguales de 18

  var Menores_18 = censos.aggregate([
    {
      "$match": {
        "COD_EDAD_INT": { "$lte": 18, "$gte": 0 }

      }
    },

    {
      "$group": {
        "_id": {
          "DESC_BARRIO": "$DESC_BARRIO"
        },
        "EspanolesHombres": {
          "$sum": "$EspanolesHombres"
        },
        "ExtranjerosHombres": {
          "$sum": "$ExtranjerosHombres"
        },
        "Hombres":
        {
          "$sum": { "$add": ["$EspanolesHombres", "$ExtranjerosHombres"] }
        },
        "EspanolesMujeres": {
          "$sum": "$EspanolesMujeres"
        },
        "ExtranjerosMujeres": {
          "$sum": "$ExtranjerosMujeres"
        },
        "Mujeres":
        {
          "$sum": { "$add": ["$EspanolesMujeres", "$ExtranjerosMujeres"] }
        }

      }
    },
    {
      "$project": {
        "DESC_BARRIO": "$_id.DESC_BARRIO",
        "EspanolesHombres_men_18": "$EspanolesHombres",
        "ExtranjerosHombres_men_18": "$ExtranjerosHombres",
        "Hombres_men_18": "$Hombres",
        "EspanolesMujeres_men_18": "$EspanolesMujeres",
        "ExtranjerosMujeres_men_18": "$ExtranjerosMujeres",
        "Mujeres_men_18": "$Mujeres",
        "_id": 0
      }
    }
  ]); await Menores_18.exec((err, cantidades) => {

    //console.log(cantidades);

    for (const censos of cantidades) {

      aux_18_men_Hombres_Mujeres.create({

        DESC_BARRIO: censos.DESC_BARRIO,
        EspanolesHombres_men_18: censos.EspanolesHombres_men_18,
        ExtranjerosHombres_men_18: censos.ExtranjerosHombres_men_18,
        EspanolesMujeres_men_18: censos.EspanolesMujeres_men_18,
        ExtranjerosMujeres_men_18: censos.ExtranjerosMujeres_men_18,
        Hombres_men_18: censos.Hombres_men_18,
        Mujeres_men_18: censos.Mujeres_men_18

      }
        , function (err, res) {

        })
    }

  });





  //Cantidad de negocios por tipo de negocio y barrio en estado abierto
  //Tipo de negocio bar id_division=56

  /*
  var bares = empresas.aggregate([
    
    {
      "$match": {
          "id_division": "56",
          "desc_situacion_local": "Abierto"
      }
    },
  
    {
      "$group": {
        "_id": {
         "desc_barrio_local":"$desc_barrio_local"},
          "Numero_bares": { 
            "$sum": 1 
        }
      }
    },
  {
      "$project": {
        "desc_barrio_local":"$_id.desc_barrio_local",
        "Numero_bares":"$Numero_bares",
        "_id": 0
      }
    }
  
  ]);
  await bares.exec((err, bares) => {
    console.log(bares);
    for  (const empresas of bares) {
      aux_bares.create({
       desc_barrio_local:empresas.desc_barrio_local,
        Numero_bares:empresas.Numero_bares
   }
   
    , function (err, res) {
   
   })
    }
  });*/


  //Tipo de negocio talleres

  //Cantidad de negocios por tipo de negocio y barrio en estado abierto
  //Tipo de negocio Taller  id_epigrafe 452001 ,452002,452003
  //Tipo escuela infantil






  //Tipo de negocio farmacia "desc_epigrafe": "FARMACIA"


  var farmacias = empresas.aggregate([

    {
      "$match": {
        "desc_epigrafe": "FARMACIA",
        "desc_situacion_local": "Abierto"
      }
    },

    {
      "$group": {
        "_id": {
          "desc_barrio_local": "$desc_barrio_local"
        },
        "Numero_farmacias": {
          "$sum": 1
        }
      }
    },
    {
      "$project": {
        "desc_barrio_local": "$_id.desc_barrio_local",
        "Numero_farmacias": "$Numero_farmacias",
        "_id": 0
      }
    }

  ]);
  await farmacias.exec((err, farmacias) => {

    for (const empresas of farmacias) {
      aux_farmacias.create({
        desc_barrio_local: empresas.desc_barrio_local,
        Numero_farmacias: empresas.Numero_farmacias
      }

        , function (err, res) {

        })
    }
  });

  //Tipo de negocio locutorios desc_epigrafe  "LOCUTORIOS"



  var locutorios = empresas.aggregate([

    {
      "$match": {
        "desc_epigrafe": "LOCUTORIOS",
        "desc_situacion_local": "Abierto"
      }
    },

    {
      "$group": {
        "_id": {
          "desc_barrio_local": "$desc_barrio_local"
        },
        "Numero_locutorios": {
          "$sum": 1
        }
      }
    },
    {
      "$project": {
        "desc_barrio_local": "$_id.desc_barrio_local",
        "Numero_locutorios": "$Numero_locutorios",
        "_id": 0
      }
    }

  ]);
  await locutorios.exec((err, locutorios) => {


    for (const empresas of locutorios) {
      aux_locutorios.create({
        desc_barrio_local: empresas.desc_barrio_local,
        Numero_locutorios: empresas.Numero_locutorios
      }

        , function (err, res) {

        })
    }
  });

  //Tipo de negocio estanco id_epigrafe =472601




  var estancos = empresas.aggregate([

    {
      "$match": {
        "id_epigrafe": "472601",
        "desc_situacion_local": "Abierto"
      }
    },

    {
      "$group": {
        "_id": {
          "desc_barrio_local": "$desc_barrio_local"
        },
        "Numero_estancos": {
          "$sum": 1
        }
      }
    },
    {
      "$project": {
        "desc_barrio_local": "$_id.desc_barrio_local",
        "Numero_estancos": "$Numero_estancos",
        "_id": 0
      }
    }

  ]);
  await estancos.exec((err, estancos) => {


    for (const empresas of estancos) {
      aux_estancos.create({
        desc_barrio_local: empresas.desc_barrio_local,
        Numero_estancos: empresas.Numero_estancos
      }

        , function (err, res) {

        })
    }
  });

  // Tipo de negocio autoescuelas id_epigrafe": "855001


  var autoescuelas = empresas.aggregate([

    {
      "$match": {
        "id_epigrafe": "855001",
        "desc_situacion_local": "Abierto"
      }
    },

    {
      "$group": {
        "_id": {
          "desc_barrio_local": "$desc_barrio_local"
        },
        "Numero_autoescuelas": {
          "$sum": 1
        }
      }
    },
    {
      "$project": {
        "desc_barrio_local": "$_id.desc_barrio_local",
        "Numero_autoescuelas": "$Numero_autoescuelas",
        "_id": 0
      }
    }

  ]);
  await autoescuelas.exec((err, autoescuelas) => {


    for (const empresas of autoescuelas) {
      aux_autoescuelas.create({
        desc_barrio_local: empresas.desc_barrio_local,
        Numero_autoescuelas: empresas.Numero_autoescuelas
      }

        , function (err, res) {

        })
    }
  });

  // Tipo de negocio inmobiliaria id_division": "68"


  var inmobiliarias = empresas.aggregate([

    {
      "$match": {
        "id_division": "68",
        "desc_situacion_local": "Abierto"
      }
    },

    {
      "$group": {
        "_id": {
          "desc_barrio_local": "$desc_barrio_local"
        },
        "Numero_inmobiliarias": {
          "$sum": 1
        }
      }
    },
    {
      "$project": {
        "desc_barrio_local": "$_id.desc_barrio_local",
        "Numero_inmobiliarias": "$Numero_inmobiliarias",
        "_id": 0
      }
    }

  ]);
  await inmobiliarias.exec((err, inmobiliarias) => {

    //console.log(inmobiliarias);
    for (const empresas of inmobiliarias) {
      aux_inmobiliarias.create({
        desc_barrio_local: empresas.desc_barrio_local,
        Numero_inmobiliarias: empresas.Numero_inmobiliarias
      }

        , function (err, res) {

        })
    }
  });

  res.render('Posproceso.ejs');

});





//Petición cluster
router.post('/clustering.ejs', async (req, res) => {

  //Aprovechamos la peticion de clusterin para calcular la variable tramo edad


  await aux_edades2.deleteMany();

  var query = tabla_aux_edades.aggregate([
    {
      "$project": {
        "desc_barrio_local": "$desc_barrio_local",
        "Edad_Mayoritaria": "$Edad_Mayoritaria",
        "Contar": "$Contar",
        "desc_distrito_local": "$desc_distrito_local",
        "id_distrito_local": "$id_distrito_local",
        "_id": 0,
        "tramo_edad":
        {
          "$switch":
          {
            "branches": [
              {
                case: { $lt: ["$Edad_Mayoritaria", 18] },
                then: "Muy Joven"
              },
              {
                case: {
                  $and: [{ $gte: ["$Edad_Mayoritaria", 18] },
                  { $lt: ["$Edad_Mayoritaria", 31] }]
                },
                then: "Joven"
              },
              {
                case: {
                  $and: [{ $gte: ["$Edad_Mayoritaria", 30] },
                  { $lt: ["$Edad_Mayoritaria", 51] }]
                },
                then: "Adulto"
              },
              {
                case: { $gt: ["$Edad_Mayoritaria", 50] },
                then: "Muy Mayor"
              }
            ],
            default: "No informado"
          }
        }
      }
    }
  ]);
  await query.exec((err, censoData2) => {

    // console.log(censoData2);


    for (const tabla_aux_edades of censoData2) {



      aux_edades2.create({

        desc_barrio_local: tabla_aux_edades.desc_barrio_local,
        desc_distrito_local: tabla_aux_edades.desc_distrito_local,
        id_distrito_local: tabla_aux_edades.id_distrito_local,
        Edad_Mayoritaria: tabla_aux_edades.Edad_Mayoritaria,
        Tramo_edad: tabla_aux_edades.tramo_edad,
        Contar: tabla_aux_edades.Contar


      }

        , function (err, res) {

        })
    }

  })

  //Realizamos todas las uniones de las tablas para tabla de cluster
  await clusters.deleteMany();
  var tabla_clusters = Aux_Hombres_Mujeres.aggregate([
    /*
    {
      "$lookup": {
         from: "aux_bares",
          localField: "DESC_BARRIO",
          foreignField: "desc_barrio_local",
          as: "bares"
      }
  },
  
  {"$unwind":
  
  {path:'$bares',preserveNullAndEmptyArrays: true}
  
  },*/

    {
      "$lookup": {
        from: "aux_farmacias",
        localField: "DESC_BARRIO",
        foreignField: "desc_barrio_local",
        as: "farmacias"
      }
    },
    {
      "$unwind":

        { path: '$farmacias', preserveNullAndEmptyArrays: true }

    },
    {
      "$lookup": {
        from: "aux_inmobiliarias",
        localField: "DESC_BARRIO",
        foreignField: "desc_barrio_local",
        as: "inmobiliarias"
      }
    },
    {
      "$unwind":

        { path: '$inmobiliarias', preserveNullAndEmptyArrays: true }

    },
    {
      "$lookup": {
        from: "aux_autoescuelas",
        localField: "DESC_BARRIO",
        foreignField: "desc_barrio_local",
        as: "autoescuelas"
      }
    },
    {
      "$unwind":

        { path: '$autoescuelas', preserveNullAndEmptyArrays: true }

    },
    {
      "$lookup": {
        from: "aux_estancos",
        localField: "DESC_BARRIO",
        foreignField: "desc_barrio_local",
        as: "estancos"
      }
    },
    {
      "$unwind":

        { path: '$estancos', preserveNullAndEmptyArrays: true }

    },
    {
      "$lookup": {
        from: "aux_locutorios",
        localField: "DESC_BARRIO",
        foreignField: "desc_barrio_local",
        as: "locutorios"
      }
    },
    {
      "$unwind":

        { path: '$locutorios', preserveNullAndEmptyArrays: true }

    },
    {
      "$project": {
        "EspanolesHombres": "$EspanolesHombres",
        "EspanolesMujeres": "$EspanolesMujeres",
        "ExtranjerosMujeres": "$ExtranjerosMujeres",
        "ExtranjerosHombres": "$ExtranjerosHombres",
        "Hombres": "$Hombres",
        "Mujeres": "$Mujeres",
        "DESC_BARRIO": "$DESC_BARRIO",
        /* "Numero_bares": "$bares.Numero_bares",*/
        "Numero_farmacias": "$farmacias.Numero_farmacias",
        "Numero_inmobiliarias": "$inmobiliarias.Numero_inmobiliarias",
        "Numero_autoescuelas": "$autoescuelas.Numero_autoescuelas",
        "Numero_estancos": "$estancos.Numero_estancos",
        "Numero_locutorios": "$locutorios.Numero_locutorios",




      }
    }

  ]);
  await tabla_clusters.exec((err, tabla_clusters) => {

    console.log(tabla_clusters);
    var idBarrio = 0;
    for (const Aux_Hombres_Mujeres of tabla_clusters) {



      clusters.create({
        IdBarrio: idBarrio,
        DESC_BARRIO: Aux_Hombres_Mujeres.DESC_BARRIO,
        EspanolesHombres: Aux_Hombres_Mujeres.EspanolesHombres,
        EspanolesMujeres: Aux_Hombres_Mujeres.EspanolesMujeres,
        ExtranjerosHombres: Aux_Hombres_Mujeres.ExtranjerosHombres,
        ExtranjerosMujeres: Aux_Hombres_Mujeres.ExtranjerosMujeres,
        Hombres: Aux_Hombres_Mujeres.Hombres,
        Mujeres: Aux_Hombres_Mujeres.Mujeres,
        Numero_autoescuelas: Aux_Hombres_Mujeres.Numero_autoescuelas,
        /*Numero_bares:Aux_Hombres_Mujeres.Numero_bares,*/
        Numero_estancos: Aux_Hombres_Mujeres.Numero_estancos,
        Numero_farmacias: Aux_Hombres_Mujeres.Numero_farmacias,
        Numero_inmobiliarias: Aux_Hombres_Mujeres.Numero_inmobiliarias,
        Numero_locutorios: Aux_Hombres_Mujeres.Numero_locutorios,





      }
        , function (err, res) {

        });
      idBarrio = idBarrio + 1;
    }

  });



  res.render('Posproceso.ejs');
});

//petición variables asociacion

router.post('/asociacion.ejs', async (req, res) => {





  //Unimos las tablas de asociación que se calcularon en las tablas genericas por el desc_barrio
  await aux_tabla_asoci.deleteMany();
  var aux_asoci = aux_18_men_Hombres_Mujeres.aggregate([
    {
      "$lookup": {
        from: "aux_30_hombres_mujeres",
        localField: "DESC_BARRIO",
        foreignField: "DESC_BARRIO",
        as: "mayores_30"
      }
    },
    {
      "$unwind":

        { path: '$mayores_30', preserveNullAndEmptyArrays: true }

    },
    {
      "$lookup": {
        from: "aux_40_hombres_mujeres",
        localField: "DESC_BARRIO",
        foreignField: "DESC_BARRIO",
        as: "mayores_40"
      }
    },
    {
      "$unwind":

        { path: '$mayores_40', preserveNullAndEmptyArrays: true }

    },
    {
      "$lookup": {
        from: "aux_edades2",
        localField: "DESC_BARRIO",
        foreignField: "desc_barrio_local",
        as: "aux_edades2"
      }
    },
    {
      "$unwind":

        { path: '$aux_edades2', preserveNullAndEmptyArrays: true }

    },
    {
      "$lookup": {
        from: "aux_30_men_hombres_mujeres",
        localField: "DESC_BARRIO",
        foreignField: "DESC_BARRIO",
        as: "Menores_30"
      }
    },
    {
      "$unwind":

        { path: '$Menores_30', preserveNullAndEmptyArrays: true }

    },
    {
      "$lookup": {
        from: "aux_51_hombres_mujeres",
        localField: "DESC_BARRIO",
        foreignField: "DESC_BARRIO",
        as: "mayores_51"
      }
    },

    {
      "$unwind":

        { path: '$mayores_51', preserveNullAndEmptyArrays: true }

    },
    {
      "$lookup": {
        from: "aux_65_hombres_mujeres",
        localField: "DESC_BARRIO",
        foreignField: "DESC_BARRIO",
        as: "mayores_65"
      }
    },

    {
      "$unwind":

        { path: '$mayores_65', preserveNullAndEmptyArrays: true }

    },
    {
      "$lookup": {
        from: "aux_75_hombres_mujeres",
        localField: "DESC_BARRIO",
        foreignField: "DESC_BARRIO",
        as: "mayores_75"
      }
    },

    {
      "$unwind":

        { path: '$mayores_75', preserveNullAndEmptyArrays: true }

    },
    {
      "$lookup": {
        from: "clusters",
        localField: "DESC_BARRIO",
        foreignField: "DESC_BARRIO",
        as: "clusters"
      }
    },

    {
      "$unwind":

        { path: '$clusters', preserveNullAndEmptyArrays: true }

    },
    {
      "$project": {
        "DESC_BARRIO": "$DESC_BARRIO",
        "EspanolesHombres_men_18": "$EspanolesHombres_men_18",
        "EspanolesMujeres_men_18": "$EspanolesMujeres_men_18",
        "ExtranjerosMujeres_men_18": "$ExtranjerosMujeres_men_18",
        "ExtranjerosHombres_men_18": "$ExtranjerosHombres_men_18",
        "Hombres_men_18": "$Hombres_men_18",
        "Mujeres_men_18": "$Mujeres_men_18",

        "EspanolesHombres_may_30": "$mayores_30.EspanolesHombres_may_30",
        "EspanolesMujeres_may_30": "$mayores_30.EspanolesMujeres_may_30",
        "ExtranjerosMujeres_may_30": "$mayores_30.ExtranjerosMujeres_may_30",
        "ExtranjerosHombres_may_30": "$mayores_30.ExtranjerosHombres_may_30",
        "Hombres_may_30": "$mayores_30.Hombres_may_30",
        "Mujeres_may_30": "$mayores_30.Mujeres_may_30",

        "EspanolesHombres_men_30": "$Menores_30.EspanolesHombres_men_30",
        "EspanolesMujeres_men_30": "$Menores_30.EspanolesMujeres_men_30",
        "ExtranjerosMujeres_men_30": "$Menores_30.ExtranjerosMujeres_men_30",
        "ExtranjerosHombres_men_30": "$Menores_30.ExtranjerosHombres_men_30",
        "Hombres_men_30": "$Menores_30.Hombres_men_30",
        "Mujeres_men_30": "$Menores_30.Mujeres_men_30",

        "EspanolesHombres_may_40": "$mayores_40.EspanolesHombres_may_40",
        "EspanolesMujeres_may_40": "$mayores_40.EspanolesMujeres_may_40",
        "ExtranjerosMujeres_may_40": "$mayores_40.ExtranjerosMujeres_may_40",
        "ExtranjerosHombres_may_40": "$mayores_40.ExtranjerosHombres_may_40",
        "Hombres_may_40": "$mayores_40.Hombres_may_40",
        "Mujeres_may_40": "$mayores_40.Mujeres_may_40",

        "EspanolesHombres_may_51": "$mayores_51.EspanolesHombres_may_51",
        "EspanolesMujeres_may_51": "$mayores_51.EspanolesMujeres_may_51",
        "ExtranjerosMujeres_may_51": "$mayores_51.ExtranjerosMujeres_may_51",
        "ExtranjerosHombres_may_51": "$mayores_51.ExtranjerosHombres_may_51",
        "Hombres_may_51": "$mayores_51.Hombres_may_51",
        "Mujeres_may_51": "$mayores_51.Mujeres_may_51",

        "EspanolesHombres_may_65": "$mayores_65.EspanolesHombres_may_65",
        "EspanolesMujeres_may_65": "$mayores_65.EspanolesMujeres_may_65",
        "ExtranjerosMujeres_may_65": "$mayores_65.ExtranjerosMujeres_may_65",
        "ExtranjerosHombres_may_65": "$mayores_65.ExtranjerosHombres_may_65",
        "Hombres_may_65": "$mayores_65.Hombres_may_65",
        "Mujeres_may_65": "$mayores_65.Mujeres_may_65",

        "EspanolesHombres_may_75": "$mayores_75.EspanolesHombres_may_75",
        "EspanolesMujeres_may_75": "$mayores_75.EspanolesMujeres_may_75",
        "ExtranjerosMujeres_may_75": "$mayores_75.ExtranjerosMujeres_may_75",
        "ExtranjerosHombres_may_75": "$mayores_75.ExtranjerosHombres_may_75",
        "Hombres_may_75": "$mayores_75.Hombres_may_75",
        "Mujeres_may_75": "$mayores_75.Mujeres_may_75",




        /* "Numero_bares": "$clusters.Numero_bares",*/
        "Numero_farmacias": "$clusters.Numero_farmacias",
        "Numero_inmobiliarias": "$clusters.Numero_inmobiliarias",
        "Numero_autoescuelas": "$clusters.Numero_autoescuelas",
        "Numero_estancos": "$clusters.Numero_estancos",
        "Numero_locutorios": "$clusters.Numero_locutorios",


        "EspanolesHombres": "$clusters.EspanolesHombres",
        "EspanolesMujeres": "$clusters.EspanolesMujeres",
        "ExtranjerosHombres": "$clusters.ExtranjerosHombres",
        "ExtranjerosMujeres": "$clusters.ExtranjerosMujeres",
        "Hombres": "$clusters.Hombres",
        "Mujeres": "$clusters.Mujeres",
        "Tramo_edad": "$aux_edades2.Tramo_edad"


      }
    }

  ]); await aux_asoci.exec((err, aux_tabla) => {

    console.log(aux_tabla);
    for (const aux_18_men_Hombres_Mujeres of aux_tabla) {

      aux_tabla_asoci.create({
        Tramo_edad: aux_18_men_Hombres_Mujeres.Tramo_edad,
        DESC_BARRIO: aux_18_men_Hombres_Mujeres.DESC_BARRIO,
        EspanolesHombres: aux_18_men_Hombres_Mujeres.EspanolesHombres,
        EspanolesMujeres: aux_18_men_Hombres_Mujeres.EspanolesMujeres,
        ExtranjerosHombres: aux_18_men_Hombres_Mujeres.ExtranjerosHombres,
        ExtranjerosMujeres: aux_18_men_Hombres_Mujeres.ExtranjerosMujeres,
        Hombres: aux_18_men_Hombres_Mujeres.Hombres,
        Mujeres: aux_18_men_Hombres_Mujeres.Mujeres,
        Numero_autoescuelas: aux_18_men_Hombres_Mujeres.Numero_autoescuelas,
        /* Numero_bares:aux_18_men_Hombres_Mujeres.Numero_bares,*/
        Numero_estancos: aux_18_men_Hombres_Mujeres.Numero_estancos,
        Numero_farmacias: aux_18_men_Hombres_Mujeres.Numero_farmacias,
        Numero_inmobiliarias: aux_18_men_Hombres_Mujeres.Numero_inmobiliarias,
        Numero_locutorios: aux_18_men_Hombres_Mujeres.Numero_locutorios,



        EspanolesHombres_men_18: aux_18_men_Hombres_Mujeres.EspanolesHombres_men_18,
        EspanolesMujeres_men_18: aux_18_men_Hombres_Mujeres.EspanolesMujeres_men_18,
        ExtranjerosMujeres_men_18: aux_18_men_Hombres_Mujeres.ExtranjerosMujeres_men_18,
        ExtranjerosHombres_men_18: aux_18_men_Hombres_Mujeres.ExtranjerosHombres_men_18,
        Hombres_men_18: aux_18_men_Hombres_Mujeres.Hombres_men_18,
        Mujeres_men_18: aux_18_men_Hombres_Mujeres.Mujeres_men_18,

        EspanolesHombres_may_30: aux_18_men_Hombres_Mujeres.EspanolesHombres_may_30,
        EspanolesMujeres_may_30: aux_18_men_Hombres_Mujeres.EspanolesMujeres_may_30,
        ExtranjerosMujeres_may_30: aux_18_men_Hombres_Mujeres.ExtranjerosMujeres_may_30,
        ExtranjerosHombres_may_30: aux_18_men_Hombres_Mujeres.ExtranjerosHombres_may_30,
        Hombres_may_30: aux_18_men_Hombres_Mujeres.Hombres_may_30,
        Mujeres_may_30: aux_18_men_Hombres_Mujeres.Mujeres_may_30,

        EspanolesHombres_men_30: aux_18_men_Hombres_Mujeres.EspanolesHombres_men_30,
        EspanolesMujeres_men_30: aux_18_men_Hombres_Mujeres.EspanolesMujeres_men_30,
        ExtranjerosMujeres_men_30: aux_18_men_Hombres_Mujeres.ExtranjerosMujeres_men_30,
        ExtranjerosHombres_men_30: aux_18_men_Hombres_Mujeres.ExtranjerosHombres_men_30,
        Hombres_men_30: aux_18_men_Hombres_Mujeres.Hombres_men_30,
        Mujeres_men_30: aux_18_men_Hombres_Mujeres.Mujeres_men_30,

        EspanolesHombres_may_40: aux_18_men_Hombres_Mujeres.EspanolesHombres_may_40,
        EspanolesMujeres_may_40: aux_18_men_Hombres_Mujeres.EspanolesMujeres_may_40,
        ExtranjerosMujeres_may_40: aux_18_men_Hombres_Mujeres.ExtranjerosMujeres_may_40,
        ExtranjerosHombres_may_40: aux_18_men_Hombres_Mujeres.ExtranjerosHombres_may_40,
        Hombres_may_40: aux_18_men_Hombres_Mujeres.Hombres_may_40,
        Mujeres_may_40: aux_18_men_Hombres_Mujeres.Mujeres_may_40,

        EspanolesHombres_may_51: aux_18_men_Hombres_Mujeres.EspanolesHombres_may_51,
        EspanolesMujeres_may_51: aux_18_men_Hombres_Mujeres.EspanolesMujeres_may_51,
        ExtranjerosMujeres_may_51: aux_18_men_Hombres_Mujeres.ExtranjerosMujeres_may_51,
        ExtranjerosHombres_may_51: aux_18_men_Hombres_Mujeres.ExtranjerosHombres_may_51,
        Hombres_may_51: aux_18_men_Hombres_Mujeres.Hombres_may_51,
        Mujeres_may_51: aux_18_men_Hombres_Mujeres.Mujeres_may_51,

        EspanolesHombres_may_65: aux_18_men_Hombres_Mujeres.EspanolesHombres_may_65,
        EspanolesMujeres_may_65: aux_18_men_Hombres_Mujeres.EspanolesMujeres_may_65,
        ExtranjerosMujeres_may_65: aux_18_men_Hombres_Mujeres.ExtranjerosMujeres_may_65,
        ExtranjerosHombres_may_65: aux_18_men_Hombres_Mujeres.ExtranjerosHombres_may_65,
        Hombres_may_65: aux_18_men_Hombres_Mujeres.Hombres_may_65,
        Mujeres_may_65: aux_18_men_Hombres_Mujeres.Mujeres_may_65,

        EspanolesHombres_may_75: aux_18_men_Hombres_Mujeres.EspanolesHombres_may_75,
        EspanolesMujeres_may_75: aux_18_men_Hombres_Mujeres.EspanolesMujeres_may_75,
        ExtranjerosMujeres_may_75: aux_18_men_Hombres_Mujeres.ExtranjerosMujeres_may_75,
        ExtranjerosHombres_may_75: aux_18_men_Hombres_Mujeres.ExtranjerosHombres_may_75,
        Hombres_may_75: aux_18_men_Hombres_Mujeres.Hombres_may_75,
        Mujeres_may_75: aux_18_men_Hombres_Mujeres.Mujeres_may_75


      }

        , function (err, res) {

        })
    }
  });
  //






  res.render('Posproceso.ejs');
});

//tabla_asociacion
router.post('/tabla_asociacion.ejs', async (req, res) => {

  //Union de tablas para la de asociacion
  await tabla_asocis.deleteMany();

  //1 es SI y 0 es NO


  var tabla_asoc = aux_tabla_asoci.aggregate([
    {
      "$project": {

        "Mas_hombres": { "$cond": { if: { $gt: ["$Hombres", "$Mujeres"] }, then: "1", else: "0" } },
        "Mas_hombres_Espanoles": { "$cond": { if: { $gt: ["$EspanolesHombres", "$EspanolesMujeres"] }, then: "1", else: "0" } },
        "Mas_hombres_extranjeros": { "$cond": { if: { $gt: ["$ExtranjerosHombres", "$ExtranjerosMujeres"] }, then: "1", else: "0" } },

        "DESC_BARRIO": "$DESC_BARRIO",

        "Muy_joven": { "$cond": { if: { $eq: ["$Tramo_edad", "Muy Joven"] }, then: "1", else: "0" } },
        "Adulto": { "$cond": { if: { $eq: ["$Tramo_edad", "Adulto"] }, then: "1", else: "0" } },
        "Joven": { "$cond": { if: { $eq: ["$Tramo_edad", "Joven"] }, then: "1", else: "0" } },
        "Muy_mayor": { "$cond": { if: { $eq: ["$Tramo_edad", "Muy Mayor"] }, then: "1", else: "0" } },
        "Tramo_edad": "$Tramo_edad",

        "Mas_hombres_extranjeros_men18": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosHombres_men_18", "$ExtranjerosHombres_men_30"] }, { $gt: ["$ExtranjerosHombres_men_18", "$ExtranjerosHombres_may_30"] },
              { $gt: ["$ExtranjerosHombres_men_18", "$ExtranjerosHombres_may_40"] }, { $gt: ["$ExtranjerosHombres_men_18", "$ExtranjerosHombres_may_51"] }, { $gt: ["$ExtranjerosHombres_men_18", "$ExtranjerosHombres_may_65"] }
                , { $gt: ["$ExtranjerosHombres_men_18", "$ExtranjerosHombres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_extranjeros_men18": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosMujeres_men_18", "$ExtranjerosMujeres_men_30"] }, { $gt: ["$ExtranjerosMujeres_men_18", "$ExtranjerosMujeres_may_30"] },
              { $gt: ["$ExtranjerosMujeres_men_18", "$ExtranjerosMujeres_may_40"] }, { $gt: ["$ExtranjerosMujeres_men_18", "$ExtranjerosMujeres_may_51"] }, { $gt: ["$ExtranjerosMujeres_men_18", "$ExtranjerosMujeres_may_65"] }
                , { $gt: ["$ExtranjerosMujeres_men_18", "$ExtranjerosMujeres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_hombres_extranjeros_men30": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosHombres_men_30", "$ExtranjerosHombres_may_30"] }, { $gt: ["$ExtranjerosHombres_men_30", "$ExtranjerosHombres_men_18"] },
              { $gt: ["$ExtranjerosHombres_men_30", "$ExtranjerosHombres_may_40"] }, { $gt: ["$ExtranjerosHombres_men_30", "$ExtranjerosHombres_may_51"] }, { $gt: ["$ExtranjerosHombres_men_30", "$ExtranjerosHombres_may_65"] }
                , { $gt: ["$ExtranjerosHombres_men_30", "$ExtranjerosHombres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_extranjeros_men30": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosMujeres_men_30", "$ExtranjerosMujeres_may_30"] }, { $gt: ["$ExtranjerosMujeres_men_30", "$ExtranjerosMujeres_men_18"] },
              { $gt: ["$ExtranjerosMujeres_men_30", "$ExtranjerosMujeres_may_40"] }, { $gt: ["$ExtranjerosMujeres_men_30", "$ExtranjerosMujeres_may_51"] }, { $gt: ["$ExtranjerosMujeres_men_30", "$ExtranjerosMujeres_may_65"] }
                , { $gt: ["$ExtranjerosMujeres_men_30", "$ExtranjerosMujeres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_hombres_extranjeros_may30": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosHombres_may_30", "$ExtranjerosHombres_men_30"] }, { $gt: ["$ExtranjerosHombres_may_30", "$ExtranjerosHombres_may_18"] },
              { $gt: ["$ExtranjerosHombres_may_30", "$ExtranjerosHombres_may_40"] }, { $gt: ["$ExtranjerosHombres_may_30", "$ExtranjerosHombres_may_51"] }, { $gt: ["$ExtranjerosHombres_may_30", "$ExtranjerosHombres_may_65"] }
                , , { $gt: ["$ExtranjerosHombres_may_30", "$ExtranjerosHombres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_extranjeros_may30": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosMujeres_may_30", "$ExtranjerosMujeres_men_30"] }, { $gt: ["$ExtranjerosMujeres_may_30", "$ExtranjerosMujeres_may_18"] },
              { $gt: ["$ExtranjerosMujeres_may_30", "$ExtranjerosMujeres_may_40"] }, { $gt: ["$ExtranjerosMujeres_may_30", "$ExtranjerosMujeres_may_51"] }, { $gt: ["$ExtranjerosMujeres_may_30", "$ExtranjerosMujeres_may_65"] }
                , { $gt: ["$ExtranjerosMujeres_may_30", "$ExtranjerosMujeres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_hombres_extranjeros_may40": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosHombres_may_40", "$ExtranjerosHombres_men_30"] }, { $gt: ["$ExtranjerosHombres_may_40", "$ExtranjerosHombres_may_18"] },
              { $gt: ["$ExtranjerosHombres_may_40", "$ExtranjerosHombres_may_30"] }, { $gt: ["$ExtranjerosHombres_may_40", "$ExtranjerosHombres_may_51"] }, { $gt: ["$ExtranjerosHombres_may_40", "$ExtranjerosHombres_may_65"] }
                , { $gt: ["$ExtranjerosHombres_may_40", "$ExtranjerosHombres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_extranjeros_may40": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosMujeres_may_40", "$ExtranjerosMujeres_men_30"] }, { $gt: ["$ExtranjerosMujeres_may_40", "$ExtranjerosMujeres_may_18"] },
              { $gt: ["$ExtranjerosMujeres_may_40", "$ExtranjerosMujeres_may_30"] }, { $gt: ["$ExtranjerosMujeres_may_40", "$ExtranjerosMujeres_may_51"] }, { $gt: ["$ExtranjerosMujeres_may_40", "$ExtranjerosMujeres_may_65"] }
                , { $gt: ["$ExtranjerosMujeres_may_40", "$ExtranjerosMujeres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_hombres_extranjeros_may51": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosHombres_may_51", "$ExtranjerosHombres_men_30"] }, { $gt: ["$ExtranjerosHombres_may_51", "$ExtranjerosHombres_may_18"] },
              { $gt: ["$ExtranjerosHombres_may_51", "$ExtranjerosHombres_may_30"] }, { $gt: ["$ExtranjerosHombres_may_51", "$ExtranjerosHombres_may_40"] }, { $gt: ["$ExtranjerosHombres_may_51", "$ExtranjerosHombres_may_65"] }
                , { $gt: ["$ExtranjerosHombres_may_51", "$ExtranjerosHombres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_extranjeros_may51": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosMujeres_may_51", "$ExtranjerosMujeres_men_30"] }, { $gt: ["$ExtranjerosMujeres_may_51", "$ExtranjerosMujeres_may_18"] },
              { $gt: ["$ExtranjerosMujeres_may_51", "$ExtranjerosMujeres_may_30"] }, { $gt: ["$ExtranjerosMujeres_may_51", "$ExtranjerosMujeres_may_40"] }, { $gt: ["$ExtranjerosMujeres_may_51", "$ExtranjerosMujeres_may_65"] }
                , { $gt: ["$ExtranjerosMujeres_may_51", "$ExtranjerosMujeres_may_75"] }]
            }, then: "1", else: "0"
          }
        },


        "Mas_hombres_extranjeros_may65": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosHombres_may_65", "$ExtranjerosHombres_men_30"] }, { $gt: ["$ExtranjerosHombres_may_65", "$ExtranjerosHombres_may_18"] },
              { $gt: ["$ExtranjerosHombres_may_65", "$ExtranjerosHombres_may_30"] }, { $gt: ["$ExtranjerosHombres_may_65", "$ExtranjerosHombres_may_40"] }, { $gt: ["$ExtranjerosHombres_may_65", "$ExtranjerosHombres_may_51"] }
                , { $gt: ["$ExtranjerosHombres_may_65", "$ExtranjerosHombres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_extranjeros_may65": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosMujeres_may_65", "$ExtranjerosMujeres_men_30"] }, { $gt: ["$ExtranjerosMujeres_may_65", "$ExtranjerosMujeres_may_18"] },
              { $gt: ["$ExtranjerosMujeres_may_65", "$ExtranjerosMujeres_may_30"] }, { $gt: ["$ExtranjerosMujeres_may_65", "$ExtranjerosMujeres_may_40"] }, { $gt: ["$ExtranjerosMujeres_may_65", "$ExtranjerosMujeres_may_51"] }
                , { $gt: ["$ExtranjerosMujeres_may_65", "$ExtranjerosMujeres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_hombres_extranjeros_may75": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosHombres_may_75", "$ExtranjerosHombres_men_30"] }, { $gt: ["$ExtranjerosHombres_may_75", "$ExtranjerosHombres_may_18"] },
              { $gt: ["$ExtranjerosHombres_may_75", "$ExtranjerosHombres_may_30"] }, { $gt: ["$ExtranjerosHombres_may_75", "$ExtranjerosHombres_may_40"] }, { $gt: ["$ExtranjerosHombres_may_75", "$ExtranjerosHombres_may_51"] }
                , { $gt: ["$ExtranjerosHombres_may_75", "$ExtranjerosHombres_may_65"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_extranjeros_may75": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$ExtranjerosMujeres_may_75", "$ExtranjerosMujeres_men_30"] }, { $gt: ["$ExtranjerosMujeres_may_75", "$ExtranjerosMujeres_may_18"] },
              { $gt: ["$ExtranjerosMujeres_may_75", "$ExtranjerosMujeres_may_30"] }, { $gt: ["$ExtranjerosMujeres_may_75", "$ExtranjerosMujeres_may_40"] }, { $gt: ["$ExtranjerosMujeres_may_75", "$ExtranjerosMujeres_may_51"] }
                , { $gt: ["$ExtranjerosMujeres_may_75", "$ExtranjerosMujeres_may_65"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_hombres_Espanoles_men18": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesHombres_men_18", "$EspanolesHombres_men_30"] }, { $gt: ["$EspanolesHombres_men_18", "$EspanolesHombres_may_30"] },
              { $gt: ["$EspanolesHombres_men_18", "$EspanolesHombres_may_40"] }, { $gt: ["$EspanolesHombres_men_18", "$EspanolesHombres_may_51"] }, { $gt: ["$EspanolesHombres_men_18", "$EspanolesHombres_may_65"] }
                , { $gt: ["$EspanolesHombres_men_18", "$EspanolesHombres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_Espanoles_men18": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesMujeres_men_18", "$EspanolesMujeres_men_30"] }, { $gt: ["$EspanolesMujeres_men_18", "$EspanolesMujeres_may_30"] },
              { $gt: ["$EspanolesMujeres_men_18", "$EspanolesMujeres_may_40"] }, { $gt: ["$EspanolesMujeres_men_18", "$EspanolesMujeres_may_51"] }, { $gt: ["$EspanolesMujeres_men_18", "$EspanolesMujeres_may_65"] }
                , { $gt: ["$EspanolesMujeres_men_18", "$EspanolesMujeres_may_75"] }]
            }, then: "1", else: "0"
          }
        },




        "Mas_hombres_Espanoles_men30": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesHombres_men_30", "$EspanolesHombres_may_30"] }, { $gt: ["$EspanolesHombres_men_30", "$EspanolesHombres_men_18"] },
              { $gt: ["$EspanolesHombres_men_30", "$EspanolesHombres_may_40"] }, { $gt: ["$EspanolesHombres_men_30", "$EspanolesHombres_may_51"] }, { $gt: ["$EspanolesHombres_men_30", "$EspanolesHombres_may_65"] }
                , { $gt: ["$EspanolesHombres_men_30", "$EspanolesHombres_may_75"] }]

            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_Espanoles_men30": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesMujeres_men_30", "$EspanolesMujeres_may_30"] }, { $gt: ["$EspanolesMujeres_men_30", "$EspanolesMujeres_men_18"] },
              { $gt: ["$EspanolesMujeres_men_30", "$EspanolesMujeres_may_40"] }, { $gt: ["$EspanolesMujeres_men_30", "$EspanolesMujeres_may_51"] }, { $gt: ["$EspanolesMujeres_men_30", "$EspanolesMujeres_may_65"] }
                , { $gt: ["$EspanolesMujeres_men_30", "$EspanolesMujeres_may_75"] }]
            }, then: "1", else: "0"
          }
        },






        "Mas_hombres_Espanoles_may30": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesHombres_may_30", "$EspanolesHombres_men_30"] }, { $gt: ["$EspanolesHombres_may_30", "$EspanolesHombres_may_18"] },
              { $gt: ["$EspanolesHombres_may_30", "$EspanolesHombres_may_40"] }, { $gt: ["$EspanolesHombres_may_30", "$EspanolesHombres_may_51"] }, { $gt: ["$EspanolesHombres_may_30", "$EspanolesHombres_may_65"] }
                , { $gt: ["$EspanolesHombres_may_30", "$EspanolesHombres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_Espanoles_may30": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesMujeres_may_30", "$EspanolesMujeres_men_30"] }, { $gt: ["$EspanolesMujeres_may_30", "$EspanolesMujeres_may_18"] },
              { $gt: ["$EspanolesMujeres_may_30", "$EspanolesMujeres_may_40"] }, { $gt: ["$EspanolesMujeres_may_30", "$EspanolesMujeres_may_51"] }, { $gt: ["$EspanolesMujeres_may_30", "$EspanolesMujeres_may_65"] }
                , { $gt: ["$EspanolesMujeres_may_30", "$EspanolesMujeres_may_75"] }]
            }, then: "1", else: "0"
          }
        },



        "Mas_hombres_Espanoles_may40": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesHombres_may_40", "$EspanolesHombres_men_30"] }, { $gt: ["$EspanolesHombres_may_40", "$EspanolesHombres_may_18"] },
              { $gt: ["$EspanolesHombres_may_40", "$EspanolesHombres_may_30"] }, { $gt: ["$EspanolesHombres_may_40", "$EspanolesHombres_may_51"] }, { $gt: ["$EspanolesHombres_may_40", "$EspanolesHombres_may_65"] }
                , { $gt: ["$EspanolesHombres_may_40", "$EspanolesHombres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_Espanoles_may40": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesMujeres_may_40", "$EspanolesMujeres_men_30"] }, { $gt: ["$EspanolesMujeres_may_40", "$EspanolesMujeres_may_18"] },
              { $gt: ["$EspanolesMujeres_may_40", "$EspanolesMujeres_may_30"] }, { $gt: ["$EspanolesMujeres_may_40", "$EspanolesMujeres_may_51"] }, { $gt: ["$EspanolesMujeres_may_40", "$EspanolesMujeres_may_65"] }
                , { $gt: ["$EspanolesMujeres_may_40", "$EspanolesMujeres_may_75"] }]
            }, then: "1", else: "0"
          }
        },



        "Mas_hombres_Espanoles_may51": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesHombres_may_51", "$EspanolesHombres_men_30"] }, { $gt: ["$EspanolesHombres_may_51", "$EspanolesHombres_may_18"] },
              { $gt: ["$EspanolesHombres_may_51", "$EspanolesHombres_may_30"] }, { $gt: ["$EspanolesHombres_may_51", "$EspanolesHombres_may_40"] }, { $gt: ["$EspanolesHombres_may_51", "$EspanolesHombres_may_65"] }
                , { $gt: ["$EspanolesHombres_may_51", "$EspanolesHombres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_Espanoles_may51": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesMujeres_may_51", "$EspanolesMujeres_men_30"] }, { $gt: ["$EspanolesMujeres_may_51", "$EspanolesMujeres_may_18"] },
              { $gt: ["$EspanolesMujeres_may_51", "$EspanolesMujeres_may_30"] }, { $gt: ["$EspanolesMujeres_may_51", "$EspanolesMujeres_may_40"] }, { $gt: ["$EspanolesMujeres_may_51", "$EspanolesMujeres_may_65"] }
                , { $gt: ["$EspanolesMujeres_may_51", "$EspanolesMujeres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_hombres_Espanoles_may65": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesHombres_may_65", "$EspanolesHombres_men_30"] }, { $gt: ["$EspanolesHombres_may_65", "$EspanolesHombres_may_18"] },
              { $gt: ["$EspanolesHombres_may_65", "$EspanolesHombres_may_30"] }, { $gt: ["$EspanolesHombres_may_65", "$EspanolesHombres_may_40"] }, { $gt: ["$EspanolesHombres_may_65", "$EspanolesHombres_may_51"] }
                , { $gt: ["$EspanolesHombres_may_65", "$EspanolesHombres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_Espanoles_may65": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesMujeres_may_65", "$EspanolesMujeres_men_30"] }, { $gt: ["$EspanolesMujeres_may_65", "$EspanolesMujeres_may_18"] },
              { $gt: ["$EspanolesMujeres_may_65", "$EspanolesMujeres_may_30"] }, { $gt: ["$EspanolesMujeres_may_65", "$EspanolesMujeres_may_40"] }, { $gt: ["$EspanolesMujeres_may_65", "$EspanolesMujeres_may_51"] }
                , { $gt: ["$EspanolesMujeres_may_65", "$EspanolesMujeres_may_75"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_hombres_Espanoles_may75": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesHombres_may_75", "$EspanolesHombres_men_30"] }, { $gt: ["$EspanolesHombres_may_75", "$EspanolesHombres_may_18"] },
              { $gt: ["$EspanolesHombres_may_75", "$EspanolesHombres_may_30"] }, { $gt: ["$EspanolesHombres_may_75", "$EspanolesHombres_may_40"] }, { $gt: ["$EspanolesHombres_may_75", "$EspanolesHombres_may_51"] }
                , { $gt: ["$EspanolesHombres_may_75", "$EspanolesHombres_may_65"] }]
            }, then: "1", else: "0"
          }
        },

        "Mas_mujeres_Espanoles_may75": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$EspanolesMujeres_may_75", "$EspanolesMujeres_men_30"] }, { $gt: ["$EspanolesMujeres_may_75", "$EspanolesMujeres_may_18"] },
              { $gt: ["$EspanolesMujeres_may_75", "$EspanolesMujeres_may_30"] }, { $gt: ["$EspanolesMujeres_may_75", "$EspanolesMujeres_may_40"] }, { $gt: ["$EspanolesMujeres_may_75", "$EspanolesMujeres_may_51"] }
                , { $gt: ["$EspanolesMujeres_may_75", "$EspanolesMujeres_may_65"] }]
            }, then: "1", else: "0"
          }
        },







        /*  "Tipo_bares":{"$cond": { if: { $and:[{$gt: [ "$Numero_bares", "$Numero_autoescuelas" ] },{$gt: [ "$Numero_bares", "$Numero_estancos" ] },
          {$gt: [ "$Numero_bares", "$Numero_farmacias" ] },{$gt: [ "$Numero_bares", "$Numero_locutorios" ] },{$gt: [ "$Numero_bares", "$Numero_inmobiliarias" ] }]
        }, then: "1", else: "0" }},*/

        "Tipo_autoescuelas": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$Numero_autoescuelas", "$Numero_estancos"] },
              { $gt: ["$Numero_autoescuelas", "$Numero_farmacias"] }, { $gt: ["$Numero_autoescuelas", "$Numero_locutorios"] }, { $gt: ["$Numero_autoescuelas", "$Numero_inmobiliarias"] }
              ]
            }, then: "1", else: "0"
          }
        },

        "Tipo_estancos": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$Numero_estancos", "$Numero_autoescuelas"] },
              { $gt: ["$Numero_estancos", "$Numero_farmacias"] }, { $gt: ["$Numero_estancos", "$Numero_locutorios"] }, { $gt: ["$Numero_estancos", "$Numero_inmobiliarias"] }
              ]
            }, then: "1", else: "0"
          }
        },

        "Tipo_farmacias": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$Numero_farmacias", "$Numero_autoescuelas"] },
              { $gt: ["$Numero_farmacias", "$Numero_estancos"] }, { $gt: ["$Numero_farmacias", "$Numero_locutorios"] }, { $gt: ["$Numero_farmacias", "$Numero_inmobiliarias"] }
              ]
            }, then: "1", else: "0"
          }
        },

        "Tipo_inmobiliarias": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$Numero_inmobiliarias", "$Numero_autoescuelas"] },
              { $gt: ["$Numero_inmobiliarias", "$Numero_estancos"] }, { $gt: ["$Numero_inmobiliarias", "$Numero_locutorios"] }, { $gt: ["$Numero_inmobiliarias", "$Numero_farmacias"] }
              ]
            }, then: "1", else: "0"
          }
        },

        "Tipo_locutorios": {
          "$cond": {
            if: {
              $and: [{ $gt: ["$Numero_locutorios", "$Numero_autoescuelas"] },
              { $gt: ["$Numero_locutorios", "$Numero_estancos"] }, { $gt: ["$Numero_locutorios", "$Numero_inmobiliarias"] }, { $gt: ["$Numero_locutorios", "$Numero_farmacias"] }
              ]
            }, then: "1", else: "0"
          }
        },

        "Numero_locutorios_men5": { "$cond": { if: { $lt: ["$Numero_locutorios", 5] }, then: "1", else: "0" } },
        "Numero_estancos_men5": { "$cond": { if: { $lt: ["$Numero_estancos", 5] }, then: "1", else: "0" } },
        "Numero_autoescuelas_men5": { "$cond": { if: { $lt: ["$Numero_autoescuelas", 5] }, then: "1", else: "0" } },
        "Numero_farmacias_men5": { "$cond": { if: { $lt: ["$Numero_farmacias", 5] }, then: "1", else: "0" } },
        "Numero_inmobiliarias_men5": { "$cond": { if: { $lt: ["$Numero_inmobiliarias", 5] }, then: "1", else: "0" } }





        //Utilizado para las pruebas.  

        //  /*  "EspanolesHombres_men_18":"$EspanolesHombres_men_18",
        //   "EspanolesHombres_men_30":"$EspanolesHombres_men_30",
        //   "EspanolesHombres_may_30":"$EspanolesHombres_may_30",
        //   "EspanolesHombres_may_40":"$EspanolesHombres_may_40",
        //   "EspanolesHombres_may_51":"$EspanolesHombres_may_51",
        //   "EspanolesHombres_may_65":"$EspanolesHombres_may_65",

        //   "EspanolesMujeres_men_18":"$EspanolesMujeres_men_18",
        //   "EspanolesMujeres_men_30":"$EspanolesMujeres_men_30",
        //   "EspanolesMujeres_may_30":"$EspanolesMujeres_may_30",
        //   "EspanolesMujeres_may_40":"$EspanolesMujeres_may_40",
        //   "EspanolesMujeres_may_51":"$EspanolesMujeres_may_51",
        //   "EspanolesMujeres_may_65":"$EspanolesMujeres_may_65",

        //   "ExtranjerosHombres_men_18":"$ExtranjerosHombres_men_18",
        //   "ExtranjerosHombres_men_30":"$ExtranjerosHombres_men_30",
        //   "ExtranjerosHombres_may_30":"$ExtranjerosHombres_may_30",
        //   "ExtranjerosHombres_may_40":"$ExtranjerosHombres_may_40",
        //   "ExtranjerosHombres_may_51":"$ExtranjerosHombres_may_51",
        //   "ExtranjerosHombres_may_65":"$ExtranjerosHombres_may_65",

        //   "ExtranjerosMujeres_men_18":"$ExtranjerosMujeres_men_18",
        //   "ExtranjerosMujeres_men_30":"$ExtranjerosMujeres_men_30",
        //   "ExtranjerosMujeres_may_30":"$ExtranjerosMujeres_may_30",
        //   "ExtranjerosMujeres_may_40":"$ExtranjerosMujeres_may_40",
        //   "ExtranjerosMujeres_may_51":"$ExtranjerosMujeres_may_51",
        //   "ExtranjerosMujeres_may_65":"$ExtranjerosMujeres_may_65", */




        // "Hombres": "$Hombres",
        // "Mujeres": "$Mujeres",  
        // "EspanolesHombres":"$EspanolesHombres",
        // "EspanolesMujeres":"$EspanolesMujeres",
        //  "ExtranjerosMujeres":"$ExtranjerosMujeres",
        //  "ExtranjerosHombres":"$ExtranjerosHombres",


      }
    }
  ]); await tabla_asoc.exec((err, tabla_asoc) => {

    console.log(tabla_asoc);

    for (const aux_tabla_asoci of tabla_asoc) {

      tabla_asocis.create({

        Mas_hombres: aux_tabla_asoci.Mas_hombres,
        Mas_hombres_Espanoles: aux_tabla_asoci.Mas_hombres_Espanoles,
        Mas_hombres_extranjeros: aux_tabla_asoci.Mas_hombres_extranjeros,
        desc_barrio_local: aux_tabla_asoci.DESC_BARRIO,
        Mas_hombres_Espanoles_men18: aux_tabla_asoci.Mas_hombres_Espanoles_men18,
        Mas_mujeres_Espanoles_men18: aux_tabla_asoci.Mas_mujeres_Espanoles_men18,
        Mas_hombres_extranjeros_men18: aux_tabla_asoci.Mas_hombres_extranjeros_men18,
        Mas_mujeres_extranjeros_men18: aux_tabla_asoci.Mas_mujeres_extranjeros_men18,
        Mas_hombres_Espanoles_may30: aux_tabla_asoci.Mas_hombres_Espanoles_may30,
        Mas_mujeres_Espanoles_may30: aux_tabla_asoci.Mas_mujeres_Espanoles_may30,
        Mas_hombres_extranjeros_may30: aux_tabla_asoci.Mas_hombres_extranjeros_may30,
        Mas_mujeres_extranjeros_may30: aux_tabla_asoci.Mas_mujeres_extranjeros_may30,
        Mas_hombres_Espanoles_men30: aux_tabla_asoci.Mas_hombres_Espanoles_men30,
        Mas_mujeres_Espanoles_men30: aux_tabla_asoci.Mas_mujeres_Espanoles_men30,
        Mas_hombres_extranjeros_men30: aux_tabla_asoci.Mas_hombres_extranjeros_men30,
        Mas_mujeres_extranjeros_men30: aux_tabla_asoci.Mas_mujeres_extranjeros_men30,
        Mas_hombres_Espanoles_may40: aux_tabla_asoci.Mas_hombres_Espanoles_may40,
        Mas_mujeres_Espanoles_may40: aux_tabla_asoci.Mas_mujeres_Espanoles_may40,
        Mas_hombres_extranjeros_may40: aux_tabla_asoci.Mas_hombres_extranjeros_may40,
        Mas_mujeres_extranjeros_may40: aux_tabla_asoci.Mas_mujeres_extranjeros_may40,
        Mas_hombres_Espanoles_may51: aux_tabla_asoci.Mas_hombres_Espanoles_may51,
        Mas_mujeres_Espanoles_may51: aux_tabla_asoci.Mas_mujeres_Espanoles_may51,
        Mas_hombres_extranjeros_may51: aux_tabla_asoci.Mas_hombres_extranjeros_may51,
        Mas_mujeres_extranjeros_may51: aux_tabla_asoci.Mas_mujeres_extranjeros_may51,
        Mas_hombres_Espanoles_may65: aux_tabla_asoci.Mas_hombres_Espanoles_may65,
        Mas_mujeres_Espanoles_may65: aux_tabla_asoci.Mas_mujeres_Espanoles_may65,
        Mas_hombres_extranjeros_may65: aux_tabla_asoci.Mas_hombres_extranjeros_may65,
        Mas_mujeres_extranjeros_may65: aux_tabla_asoci.Mas_mujeres_extranjeros_may65,

        Mas_hombres_Espanoles_may75: aux_tabla_asoci.Mas_hombres_Espanoles_may75,
        Mas_mujeres_Espanoles_may75: aux_tabla_asoci.Mas_mujeres_Espanoles_may75,
        Mas_hombres_extranjeros_may75: aux_tabla_asoci.Mas_hombres_extranjeros_may75,
        Mas_mujeres_extranjeros_may75: aux_tabla_asoci.Mas_mujeres_extranjeros_may75,
        /*   Tipo_bares:aux_tabla_asoci.Tipo_bares,*/
        Tipo_autoescuelas: aux_tabla_asoci.Tipo_autoescuelas,
        Tipo_estancos: aux_tabla_asoci.Tipo_estancos,
        Tipo_farmacias: aux_tabla_asoci.Tipo_farmacias,
        Tipo_inmobiliarias: aux_tabla_asoci.Tipo_inmobiliarias,
        Tipo_locutorios: aux_tabla_asoci.Tipo_locutorios,
        Joven: aux_tabla_asoci.Joven,
        Muy_mayor: aux_tabla_asoci.Muy_mayor,
        Muy_joven: aux_tabla_asoci.Muy_joven,
        Adulto: aux_tabla_asoci.Adulto,
        Numero_locutorios_men5: aux_tabla_asoci.Numero_locutorios_men5,
        Numero_estancos_men5: aux_tabla_asoci.Numero_estancos_men5,
        Numero_autoescuelas_men5: aux_tabla_asoci.Numero_autoescuelas_men5,
        Numero_farmacias_men5: aux_tabla_asoci.Numero_farmacias_men5,
        Numero_inmobiliarias_men5: aux_tabla_asoci.Numero_inmobiliarias_men5



      }
        , function (err, res) {

        })
    }

  });

  /* await clusters.updateMany({ Numero_bares: null }, { "$set": { Numero_bares: 0 }})*/
  await clusters.updateMany({ Numero_estancos: null }, { "$set": { Numero_estancos: 0 } })
  await clusters.updateMany({ Numero_farmacias: null }, { "$set": { Numero_farmacias: 0 } })
  await clusters.updateMany({ Numero_locutorios: null }, { "$set": { Numero_locutorios: 0 } })
  await clusters.updateMany({ Numero_inmobiliarias: null }, { "$set": { Numero_inmobiliarias: 0 } })
  await clusters.updateMany({ Numero_autoescuelas: null }, { "$set": { Numero_autoescuelas: 0 } })






  res.render('Posproceso.ejs');

});

router.post('/Alg_cluster.ejs', async (req, res) => {




  await alg_clusters.deleteMany();


  var alg_cluster = clusters.aggregate([
    {
      "$project": {
        "DESC_BARRIO": "$DESC_BARRIO",
        "EspanolesHombres": "$EspanolesHombres",
        "EspanolesMujeres": "$EspanolesMujeres",
        "ExtranjerosHombres": "$ExtranjerosHombres",
        "ExtranjerosMujeres": "$ExtranjerosMujeres",
        "Hombres": "$Hombres",
        "Mujeres": "$Mujeres",
        /* "Numero_bares": "$Numero_bares"   , */
        "Numero_estancos": "$Numero_estancos",
        "Numero_farmacias": "$Numero_farmacias",
        "Numero_locutorios": "$Numero_locutorios",
        "Numero_inmobiliarias": "$Numero_inmobiliarias",
        "Numero_autoescuelas": "$Numero_autoescuelas"



      }
    }

  ]); await alg_cluster.exec((err, alg_cluster) => {

    //console.log(alg_cluster);

    //Con esto capturamos los valores que tenemos seleccionado en la lista.
    let HombresNac = req.body.HombresNac;
    let MujeresNac = req.body.MujeresNac;
    let genero = req.body.genero;
    let Negocio1 = req.body.Negocio1;
    let Negocio2 = req.body.Negocio2;
    let k = req.body.k;

    /*   console.log(HombresNac);
      console.log(MujeresNac);
      console.log(genero);
      console.log(Negocio1);
      console.log(Negocio2);
      console.log(k); */

    let vectors = new Array();
    const valores = new Array();




    for (let i = 0; i < alg_cluster.length; i++) {


      vectors[i] = [alg_cluster[i][HombresNac], alg_cluster[i][MujeresNac], alg_cluster[i][genero],
      alg_cluster[i][Negocio1], alg_cluster[i][Negocio2]];




    }



    const kmeans = require('node-kmeans');
    kmeans.clusterize(vectors, { k: k }, (err, res) => {
      if (err) console.error(err);
      else console.log('%o', res);

      clusters.find().select('DESC_BARRIO IdBarrio').exec(function (err, descBarrios) {
        if (err) console.log(err);
        var data = new Array();
        res.forEach(item => {
          var barrios = new Array();
          item.clusterInd.forEach(itemCluster => {
            //console.log(itemCluster);

            barrios.push(descBarrios.find(x => x.IdBarrio === itemCluster).DESC_BARRIO);
          });
          var algCluster = new alg_clusters();
          algCluster.centroid = item.centroid;
          algCluster.cluster = item.cluster;
          algCluster.clusterInd = barrios;
          data.push(algCluster);
        });
        alg_clusters.collection.insertMany(data);
      });
    });

    res.render('Posproceso.ejs');
  });
});




/*Visualizar clustering*/
router.post('/Visualizar_clustering.ejs', async (req, res) => {

  const alg_clus = await alg_clusters.find();


  //, { task: task, task1: task1 }
  res.render('Visualizar_clustering.ejs', { alg_clus: alg_clus });
});


router.post('/Alg_asocia.ejs', async (req, res) => {

  await alg_asociaciones.deleteMany();



  var alg_asociac = tabla_asocis.aggregate([
    {
      "$project": {

        "Mas_hombres": "$Mas_hombres",
        "Mas_hombres_Espanoles": "$Mas_hombres_Espanoles",
        "Mas_hombres_extranjeros": "$Mas_hombres_extranjeros",

        "Mas_hombres_Espanoles_men18": "$Mas_hombres_Espanoles_men18",
        "Mas_mujeres_Espanoles_men18": "$Mas_mujeres_Espanoles_men18",
        "Mas_hombres_extranjeros_men18     	": "$Mas_hombres_extranjeros_men18",
        "Mas_mujeres_extranjeros_men18     	": "$Mas_mujeres_extranjeros_men18",

        "Mas_hombres_Espanoles_may30": "$Mas_hombres_Espanoles_may30",
        "Mas_mujeres_Espanoles_may30": "$Mas_mujeres_Espanoles_may30",
        "Mas_hombres_extranjeros_may30     	": "$Mas_hombres_extranjeros_may30",
        "Mas_mujeres_extranjeros_may30     	": "$Mas_mujeres_extranjeros_may30",

        "Mas_hombres_Espanoles_men30": "$Mas_hombres_Espanoles_men30",
        "Mas_mujeres_Espanoles_men30": "$Mas_mujeres_Espanoles_men30",
        "Mas_hombres_extranjeros_men30     	": "$Mas_hombres_extranjeros_men30",
        "Mas_mujeres_extranjeros_men30     	": "$Mas_mujeres_extranjeros_men30",

        "Mas_hombres_Espanoles_may40": "$Mas_hombres_Espanoles_may40",
        "Mas_mujeres_Espanoles_may40": "$Mas_mujeres_Espanoles_may40",
        "Mas_hombres_extranjeros_may40     	": "$Mas_hombres_extranjeros_may40",
        "Mas_mujeres_extranjeros_may40     	": "$Mas_mujeres_extranjeros_may40",

        "Mas_hombres_Espanoles_may51": "$Mas_hombres_Espanoles_may51",
        "Mas_mujeres_Espanoles_may51": "$Mas_mujeres_Espanoles_may51",
        "Mas_hombres_extranjeros_may51     	": "$Mas_hombres_extranjeros_may51",
        "Mas_mujeres_extranjeros_may51     	": "$Mas_mujeres_extranjeros_may51",

        "Mas_hombres_Espanoles_may65": "$Mas_hombres_Espanoles_may65",
        "Mas_mujeres_Espanoles_may65": "$Mas_mujeres_Espanoles_may65",
        "Mas_hombres_extranjeros_may65": "$Mas_hombres_extranjeros_may65",
        "Mas_mujeres_extranjeros_may65": "$Mas_mujeres_extranjeros_may65",
        "Mas_hombres_Espanoles_may75": "$Mas_hombres_Espanoles_may75",
        "Mas_mujeres_Espanoles_may75": "$Mas_mujeres_Espanoles_may75",
        "Mas_hombres_extranjeros_may75": "$Mas_hombres_extranjeros_may75",
        "Mas_mujeres_extranjeros_may75": "$Mas_mujeres_extranjeros_may75",
        "Tipo_autoescuelas": "$Tipo_autoescuelas",
        "Tipo_estancos": "$Tipo_estancos",
        "Tipo_farmacias": "$Tipo_farmacias",
        "Tipo_inmobiliarias": "$Tipo_inmobiliarias",
        "Tipo_locutorios": "$Tipo_locutorios",
        "Numero_locutorios_men5": "$Numero_locutorios_men5",
        "Numero_estancos_men5": "$Numero_estancos_men5",
        "Numero_autoescuelas_men5": "$Numero_autoescuelas_men5",
        "Numero_farmacias_men5": "$Numero_farmacias_men5",
        "Numero_inmobiliarias_men5": "$Numero_inmobiliarias_men5",
        "Joven": "$Joven",
        "Muy_mayor": "$Muy_mayor",
        "Muy_joven": "$Muy_joven",
        "Adulto": "$Adulto"


      }
    }

  ]); await alg_asociac.exec((err, alg_asociac) => {

    let itemsData = [];
    alg_asociac.forEach(element => {
      let item = [];

   
      if (element.Mas_hombres == 1) {
        item.push('Mas_hombres');
      }
      if (element.Mas_hombres_Espanoles == 1) {
        item.push('Mas_hombres_Espanoles');
      }
      if (element.Mas_hombres_extranjeros == 1) {
        item.push('Mas_hombres_extranjeros');
      }
      if (element.Mas_hombres_Espanoles_men18 == 1) {
        item.push('Mas_hombres_Espanoles_men18');
      }
      if (element.Mas_mujeres_Espanoles_men18 == 1) {
        item.push('Mas_mujeres_Espanoles_men18');
      }
      if (element.Mas_hombres_extranjeros_men18 == 1) {
        item.push('Mas_hombres_extranjeros_men18');
      }
      if (element.Mas_mujeres_extranjeros_men18 == 1) {
        item.push('Mas_mujeres_extranjeros_men18');
      }
      if (element.Mas_hombres_Espanoles_may30 == 1) {
        item.push('Mas_hombres_Espanoles_may30');
      }
      if (element.Mas_mujeres_Espanoles_may30 == 1) {
        item.push('Mas_mujeres_Espanoles_may30');
      }
      if (element.Mas_hombres_extranjeros_may30 == 1) {
        item.push('Mas_hombres_extranjeros_may30');
      }
      if (element.Mas_mujeres_extranjeros_may30 == 1) {
        item.push('Mas_mujeres_extranjeros_may30');
      }
      if (element.Mas_hombres_Espanoles_men30 == 1) {
        item.push('Mas_hombres_Espanoles_men30');
      }
      if (element.Mas_mujeres_Espanoles_men30 == 1) {
        item.push('Mas_mujeres_Espanoles_men30');
      }
      if (element.Mas_hombres_extranjeros_men30 == 1) {
        item.push('Mas_hombres_extranjeros_men30');
      }
      if (element.Mas_mujeres_extranjeros_men30 == 1) {
        item.push('Mas_mujeres_extranjeros_men30');
      }
      if (element.Mas_hombres_Espanoles_may40 == 1) {
        item.push('Mas_hombres_Espanoles_may40');
      }
      if (element.Mas_mujeres_Espanoles_may40 == 1) {
        item.push('Mas_mujeres_Espanoles_may40');
      }
      if (element.Mas_hombres_extranjeros_may40 == 1) {
        item.push('Mas_hombres_extranjeros_may40');
      }
      if (element.Mas_mujeres_extranjeros_may40 == 1) {
        item.push('Mas_mujeres_extranjeros_may40');
      }
      if (element.Mas_hombres_Espanoles_may51 == 1) {
        item.push('Mas_hombres_Espanoles_may51');
      }
      if (element.Mas_mujeres_Espanoles_may51 == 1) {
        item.push('Mas_mujeres_Espanoles_may51');
      }
      if (element.Mas_hombres_extranjeros_may51 == 1) {
        item.push('Mas_hombres_extranjeros_may51');
      }
      if (element.Mas_mujeres_extranjeros_may51 == 1) {
        item.push('Mas_mujeres_extranjeros_may51');
      }
      if (element.Mas_hombres_Espanoles_may65 == 1) {
        item.push('Mas_hombres_Espanoles_may65');
      }
      if (element.Mas_mujeres_Espanoles_may65 == 1) {
        item.push('Mas_mujeres_Espanoles_may65');
      }
      if (element.Mas_hombres_extranjeros_may65 == 1) {
        item.push('Mas_hombres_extranjeros_may65');
      }
      if (element.Mas_mujeres_extranjeros_may65 == 1) {
        item.push('Mas_mujeres_extranjeros_may65');
      }
      if (element.Mas_hombres_Espanoles_may75 == 1) {
        item.push('Mas_hombres_Espanoles_may75');
      }
      if (element.Mas_mujeres_Espanoles_may75 == 1) {
        item.push('Mas_mujeres_Espanoles_may75');
      }
      if (element.Mas_hombres_extranjeros_may75 == 1) {
        item.push('Mas_hombres_extranjeros_may75');
      }
      if (element.Mas_mujeres_extranjeros_may75 == 1) {
        item.push('Mas_mujeres_extranjeros_may75');
      }
      /*
      if (element.Tipo_bares == 1)
      {
        item.push(28);
      }*/
      if (element.Tipo_autoescuelas == 1) {
        item.push('Tipo_autoescuelas');
      }
      if (element.Tipo_estancos == 1) {
        item.push('Tipo_estancos');
      }
      if (element.Tipo_farmacias == 1) {
        item.push('Tipo_farmacias');
      }
      if (element.Tipo_inmobiliarias == 1) {
        item.push('Tipo_inmobiliarias');
      }
      if (element.Tipo_locutorios == 1) {
        item.push('Tipo_locutorios');
      }
      if (element.Joven == 1) {
        item.push('Joven');
      }
      if (element.Muy_mayor == 1) {
        item.push('Muy_mayor');
      }
      if (element.Muy_joven == 1) {
        item.push('Muy_joven');
      }
      if (element.Adulto == 1) {
        item.push('Adulto');
      }
      if (element.Numero_locutorios_men5 == 1) {
        item.push('Numero_locutorios_men5');
      }
      if (element.Numero_estancos_men5 == 1) {
        item.push('Numero_estancos_men5');
      }
      if (element.Numero_autoescuelas_men5 == 1) {
        item.push('Numero_autoescuelas_men5');
      }
      if (element.Numero_farmacias_men5 == 1) {
        item.push('Numero_farmacias_men5');
      }
      if (element.Numero_inmobiliarias_men5 == 1) {
        item.push('Numero_inmobiliarias_men5');
      }

      itemsData.push(item);
     
    });

    let confianza = req.body.confianza;
    let soporte = req.body.soporte;




    var variablesArray = new Array(itemsData.length);
    
    //Sustituimos la coma por la coma y espacio y lo asignamos en el array
    for (var index = 0; index < itemsData.length; index++) {
      variablesArray[index] = itemsData[index].toString().replace(/,/g, ', ');
    }
    //console.log(variablesArray);
    
    const apriori = require('simple-apriori');
    // console.log(alg_asociac);

    var support = soporte;
    var confidence = confianza;

    //console.log(apriori.getApriori(dataset, support, confidence));
    var prueba=apriori.getApriori(variablesArray, support, confidence);
    console.log(apriori.getApriori(variablesArray, support, confidence));

    alg_asociaciones.collection.insertMany(prueba);



  });


  //alg_asociaciones
  res.render('Posproceso.ejs');

});

router.post('/Visualizar_asociacion.ejs', async (req, res) => {

  //const valor_x = await alg_asociaciones.find();
  asociacion = await alg_asociaciones.find();


  //, { task: task, task1: task1 }
  res.render('Visualizar_asociacion.ejs', {asociacion: asociacion});
});

/*Pagina contacto*/
router.get('/Contacto.ejs', (req, res) => {
  res.render('Contacto.ejs');
});

/*Pagina Gráficos*/

router.get('/Graficos.ejs', (req, res) => {
  res.render('Graficos.ejs');
});

/*Pagina weka*/

router.get('/weka.ejs', (req, res) => {
  res.render('weka.ejs');
});




module.exports = router;


