var express = require('express');
var router = express.Router();
var cfg = require('../../config.js');
var fs = require('fs');
var serverRoot= cfg.serverRoot;

  var options = {
    root: serverRoot,
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
};

/* GET home page. */
router.get('/', function(req, res) {

    //set valid server-root
    options.root = validRoot();

  res.sendFile('/viewSelection.html', options, function(err){
    if(err){
      console.log('indexjs::error::'+err);
      res.status(err.status).end();
    }
    else {
    }
  });
});

/**
 * GET files and other htmls
 */
router.get('/:name', function(req, res) {

  var filename = req.params.name;

    console.log("index.js/get/:name "+ filename);


  options.root = validRoot();
  res.sendFile(filename, options, function(err){
    if(err){
      console.log('indexjs::error::'+err);
      res.status(err.status).end();
    }
    else {
    }
  });
});

/**
 * Returns a valid Server--Dir
 * @returns {string} valid server root dir
 */
function validRoot(){
  if(fs.existsSync('../viewSelection.html')){
    return '../';
  }else if (fs.existsSync('../../viewSelection.html')){
    return '../../';
  }else{
    console.log('server::index.js::noValidRoot');
  }

}

module.exports = {
  router: router,
  validRoot: validRoot
};
