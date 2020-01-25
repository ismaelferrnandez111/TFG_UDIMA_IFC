var express = require('express');
var app = express();
const mongoose=require('mongoose');
//const apriori= require('node-apriori');
const apriori = require('simple-apriori');
module.exports = mongoose;
module.exports = apriori;
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: '600mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '600mb' }));
//importar rutas
const indexRouter = require('./routes/index');


//Conectar base de datos

mongoose.connect('mongodb://localhost:27017/Proyecto')
.then(db=>console.log('Conectado'))
.catch(err=> console.log(err));



// vistas ruta directorio
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//models  añadido nuevo
app.set('models',path.join(__dirname,'models'));

//rutas
app.use(logger('dev'));
app.use(express.json());

//para que se entiendan los datos que se envian desde un html (formulario)
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
//, { useNewUrlParser: true } con esto quitamos el warning de deprecated

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

//rutas
app.use('/',require('./routes/index'));

