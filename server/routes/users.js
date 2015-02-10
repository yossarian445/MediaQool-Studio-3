var express = require('express');
var router = express.Router();


//serves as boilerplate
/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;
