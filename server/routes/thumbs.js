var express = require('express');
var router = express.Router();
var rootV = require('./index.js');




var options = {
  root: '',
  dotfiles: 'deny',
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true
  }
}



/* GET Spritesheet */
router.get('/', function(req, res) {

  options.root = rootV.validRoot();
  var videoID = req.param('vid');
  var pathToFile = './server/media/'+videoID+'/thumbnails.png';
  res.sendFile(pathToFile, options, function(err){
    if(err){
      console.log('indexjs::error::'+err);
        if(res){
            res.status(err.status).end();
        }
    }
    else {
      console.log('Sent: ', pathToFile);
    }
  });
});

/* GET VTT */
router.get('/vtt', function(req, res) {

  options.root = rootV.validRoot();
  var videoID = req.param('vid');
  var pathToFile = './server/media/'+videoID+'.vtt';
  res.sendFile(pathToFile, options, function(err){
    if(err){
      console.log('indexjs::error::'+err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent: ', pathToFile);
    }
  });
});

/* GET JSON */
router.get('/json', function(req, res) {

  options.root = rootV.validRoot();
  var videoID = req.param('vid');
  var pathToFile = './server/media/'+videoID+'.json';
  res.sendFile(pathToFile, options, function(err){
    if(err){
      console.log('indexjs::error::'+err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent: ', pathToFile);
    }
  });
});


module.exports = router;
