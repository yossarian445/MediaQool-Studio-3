var jf = require('jsonfile');
var util = require('util');

/**
 * Writes a JSON-Object to a JSON-file
 * @param jsonObject
 * @param filePath
 * @param callback callback(error)
 */
function writeToFile(jsonObject, filePath, callback){

  var jsObj = jsonObject;
  var path = filePath;


  jf.writeFile(filePath,jsonObject,function(err){
   callback(err);
  })

}



module.exports = {
  writeToFile : writeToFile
};
