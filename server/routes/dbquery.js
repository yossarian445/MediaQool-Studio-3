var express = require('express');
var Tunnel = require('tunnel-ssh');
var mysql = require('mysql2');
var router = express.Router();
var tunnelPort = 33333;

/* GET users listing. */
router.post('/', function(req, res) {

  //Array to be sent to client
  var resp = [];

  try {
  var jsD = JSON.parse(req.body.data);
  }catch (e){
    console.log(e);
  }

    var minDate = jsD.minDate;
    var maxDate = jsD.maxDate;
    var coordinates = jsD.bounds;
    var queryData = buildPreparedCoordQuery(minDate,maxDate,coordinates);
    var pQueryString = queryData[0];
    var pQueryParams = queryData[1];




    runQuery(buildAlternativeCoordQuery(minDate, maxDate, coordinates), function(rows){
    //runTestQuery(buildAlternativeCoordQuery(minDate, maxDate, coordinates), function(rows){

        var mintc = 0;
    var maxtc = 0;
    var dur = 0;
    var plng = 0;
    var plat = 0;
    var usr = "";
    var vid = 0;
    var dateStart ="";
    var dateEnd = "";

    //for(var i in rows){
    for(i=0;i<rows.length;i++){
      var rs = rows[i];

      mintc = parseInt(rs.MinTC);
      maxtc = parseInt(rs.MaxTC);
      dateStart = new Date(mintc);
      dateEnd = new Date(maxtc);
      dur = maxtc - mintc;
      plng = rs.Plng;
      plat = rs.Plat;
      usr = rs.UserName;
      vid = rs.VideoId;

      var jsonObj = {
        VideoID : vid,
        //DateStart : dateStart,
        //DateEnd : dateEnd,
        MinTC: mintc,
        MaxTC: maxtc,
        Duration : dur,
        Plng : plng,
        Plat : plat,
        User : usr

      };

      resp.push(jsonObj);

    }

    res.contentType('application/json');
    res.send(resp);
  });
});

/**
 * Returns all VideoIDs from DB-Server
 * @param callback (Array IDs)
 */
function getAllVideoIDs(callback){
  var q = "SELECT VideoId FROM VIDEO_INFO;"
  runQuery(q,function(rows){
    var names = [];
    for(i=0; i<rows.length; i++){
      names.push(rows[i].VideoId);
    }
    callback(names);
  });

}

var mysqlCon = undefined;
//Callback(fields)
/**
 * Establishes connection to DB-Server, runs query and closes connection. Returns result-rows in callback.
 * @param queryString String of the query
 * @param callback (fields)
 */
function runQuery(queryString, callback){

    var beginTime = new Date().getTime();

    //Config for DB Server
    var dbServerConfig= {
        host: 'mediaq.dbs.ifi.lmu.de',
        user: 'student',
        password: 'tneduts',
        database: 'MediaQ_V2'
    };



    mysqlCon = mysql.createConnection(dbServerConfig);
    mysqlCon.connect();

    mysqlCon.query(queryString, function(err,rows,fields){
        if(err){
            console.log("mysqlCon::error::"+err);
        }

        var qrows = rows;
        var qfields = fields;

        console.log('dbquery::runQuery::Query-Laufzeit: ' + (new Date().getTime()-beginTime)/1000);
        callback(qrows);

        mysqlCon.end();

    });
}

/**
 * Establishes connection to DB-Server, runs query and closes connection. Returns result-rows in callback.
 * @param queryString String of the query
 * @param callback (fields)
 */
function runTestQuery(queryString, callback){

    var beginTime = new Date().getTime();

    //Config for DB Server
    var dbServerConfig= {
        host: 'mediaq.dbs.ifi.lmu.de',
        user: 'student',
        password: 'tneduts',
        database: 'test'
    };



    mysqlCon = mysql.createConnection(dbServerConfig);
    mysqlCon.connect();

    mysqlCon.query(queryString, function(err,rows,fields){
        if(err){
            console.log("mysqlCon::error::"+err);
        }

        var qrows = rows;
        var qfields = fields;

        console.log('dbquery::runQuery::Query-Laufzeit: ' + (new Date().getTime()-beginTime)/1000);
        callback(qrows);

        mysqlCon.end();

    });
}



/**
 * Establishes connection to DB-Server, runs query and closes connection. Returns result-rows in callback.
 * @param queryString String of the query
 * @param callback (fields)
 */
function runPreparedQuery(queryString, queryParams, callback){

    var beginTime = new Date().getTime();

    //Config for DB Server
    var dbServerConfig= {
        host: 'mediaq.dbs.ifi.lmu.de',
        user: 'student',
        password: 'tneduts',
        database: 'MediaQ_V2'
    };

    if(!mysqlCon){
        mysqlCon = mysql.createConnection(dbServerConfig);
        mysqlCon.connect();
    }

    mysqlCon.execute(queryString, queryParams, function(err,rows,fields){
        if(err){
            console.log("mysqlCon::error::"+err);
        }

        var qrows = rows;
        var qfields = fields;

        console.log('dbquery::runPreparedQuery::Query-Laufzeit: ' + (new Date().getTime()-beginTime)/1000);
        callback(qrows);

        //mysqlCon.end();

    });

    /*mysqlCon.query(queryString, function(err,rows,fields){
        if(err){
            console.log("mysqlCon::error::"+err);
        }

        var qrows = rows;
        var qfields = fields;

        console.log('dbquery::runQuery::Query-Laufzeit: ' + (new Date().getTime()-beginTime)/1000);
        callback(qrows);

        mysqlCon.end();

    });*/





}

/**
 * Returns String for MediaQ-Query
 * @param minDate minimum Date
 * @param maxDate maximum Date
 * @param coordinatesJSON Coordinates as JSON
 * @returns {string} Query to get all Videos for given parameters
 */
function buildCoordQuery(minDate, maxDate, coordinatesJSON) {
  var minTC = minDate;
  var maxTC = maxDate;

  var lng1 = Math.min(coordinatesJSON.lng1,coordinatesJSON.lng2);
  var lng2 = Math.max(coordinatesJSON.lng1,coordinatesJSON.lng2);
  var lat1 = Math.min(coordinatesJSON.lat1,coordinatesJSON.lat2);
  var lat2 = Math.max(coordinatesJSON.lat1,coordinatesJSON.lat2);

  var query = "" +
      "SELECT * FROM (" +
      "SELECT a.VideoId, MIN(TimeCode) AS MinTC,MAX(TimeCode) AS MaxTC, MAX(Plng) AS Plng, MAX(Plat) AS Plat, UserName, ProfilePicture " +
      "FROM ((VIDEO_METADATA a " +
      "INNER JOIN VIDEO_USER b ON (a.VideoId = b.VideoId)) " +
      "INNER JOIN USERS_PROFILES c ON (b.UserId = c.UserId))" +
      "GROUP BY a.VideoId) AS Ta " +
      "WHERE Ta.MinTC < "+ maxDate + " " +
      "AND Ta.MaxTC > "+  minDate + " " +
      "AND Ta.Plng BETWEEN "+ lng1 + " AND " + lng2 + " " +
      "AND Ta.Plat BETWEEN "+ lat1 + " AND " + lat2 + " " +
      ";";

  console.log("Query: ", query);

  return query;

}

/**
 * Returns String for MediaQ-Query (This one is optimized)
 * @param minDate minimum Date
 * @param maxDate maximum Date
 * @param coordinatesJSON Coordinates as JSON
 * @returns {string} Query to get all Videos for given parameters
 */
function buildAlternativeCoordQuery(minDate, maxDate, coordinatesJSON) {
    var minTC = minDate;
    var maxTC = maxDate;

    var twHours = 5;

    //TimeWindows for preselection
    var minTW = minDate - (twHours*3600000);
    var maxTW = maxDate + (twHours * 3600000);



    var lng1 = Math.min(coordinatesJSON.lng1,coordinatesJSON.lng2);
    var lng2 = Math.max(coordinatesJSON.lng1,coordinatesJSON.lng2);
    var lat1 = Math.min(coordinatesJSON.lat1,coordinatesJSON.lat2);
    var lat2 = Math.max(coordinatesJSON.lat1,coordinatesJSON.lat2);

    var minLatW = lat1 - 0.5;
    var maxLatW = lat2 + 0.5;
    var minLngW = lng1 - 0.5;
    var maxLngW = lng2 + 0.5;

    var query = "" +
        "SELECT * FROM (" +
        "SELECT a.VideoId, MIN(TimeCode) AS MinTC,MAX(TimeCode) AS MaxTC, AVG(Plng) AS Plng, AVG(Plat) AS Plat, UserName, ProfilePicture " +
        "FROM VIDEO_METADATA a " +
        "LEFT JOIN VIDEO_USER b ON a.VideoId = b.VideoId " +
        "LEFT JOIN USERS_PROFILES c ON b.UserId = c.UserId " +
        "WHERE a.TimeCode BETWEEN " +minTW+ " AND " +maxTW + " AND a.Plat BETWEEN " + minLatW + " AND " + maxLatW + " AND a.Plng BETWEEN " + minLngW + " AND " + maxLngW + " " +
        "GROUP BY a.VideoId) AS Ta " +
        "WHERE Ta.MinTC < "+ maxDate + " " +
        "AND Ta.MaxTC > "+  minDate + " " +
        "AND Ta.Plng BETWEEN "+ lng1 + " AND " + lng2 + " " +
        "AND Ta.Plat BETWEEN "+ lat1 + " AND " + lat2 + " " +
        ";";

    console.log("AltQuery: ", query);

    return query;

}


/**
 * Returns String for MediaQ-Query (This one is optimized)
 * @param minDate minimum Date
 * @param maxDate maximum Date
 * @param coordinatesJSON Coordinates as JSON
 * @returns {*[]} [0]: QueryString for PreparedStatement, [1]: Array with Parameters in right order
 */
function buildPreparedCoordQuery(minDate, maxDate, coordinatesJSON) {
    var minTC = minDate;
    var maxTC = maxDate;

    var twHours = 5;

    //TimeWindows for preselection
    var minTW = minDate - (twHours*3600000);
    var maxTW = maxDate + (twHours * 3600000);



    var lng1 = Math.min(coordinatesJSON.lng1,coordinatesJSON.lng2);
    var lng2 = Math.max(coordinatesJSON.lng1,coordinatesJSON.lng2);
    var lat1 = Math.min(coordinatesJSON.lat1,coordinatesJSON.lat2);
    var lat2 = Math.max(coordinatesJSON.lat1,coordinatesJSON.lat2);

    var minLatW = lat1 - 0.5;
    var maxLatW = lat2 + 0.5;
    var minLngW = lng1 - 0.5;
    var maxLngW = lng2 + 0.5;

    //1:minTW,2:maxTW,3:minLatW,4:maxLatW,5:minLngW,6:maxLngW,7:maxDate,8:minDate,9:lng1,10:lng2,lat1,lat2

    var queryParams= [minTW,maxTW,minLatW,maxLatW,minLngW,maxLngW,maxDate,minDate,lng1,lng2,lat1,lat2];
    var query = "" +
        "SELECT * FROM (" +
        "SELECT a.VideoId, MIN(TimeCode) AS MinTC,MAX(TimeCode) AS MaxTC, MAX(Plng) AS Plng, MAX(Plat) AS Plat, UserName, ProfilePicture " +
        "FROM VIDEO_METADATA a " +
        "LEFT JOIN VIDEO_USER b ON a.VideoId = b.VideoId " +
        "LEFT JOIN USERS_PROFILES c ON b.UserId = c.UserId " +
        "WHERE a.TimeCode BETWEEN ?  AND ? AND a.Plat BETWEEN ? AND ? AND a.Plng BETWEEN ? AND ? " +
        "GROUP BY a.VideoId) AS Ta " +
        "WHERE Ta.MinTC < ? " +
        "AND Ta.MaxTC > ? " +
        "AND Ta.Plng BETWEEN ? AND ? " +
        "AND Ta.Plat BETWEEN ? AND ? " +
        ";";

    console.log("PrepQuery: ", query);

    return [query,queryParams];

}

/* If connection to DB server only from lrz/cip.ifi.lmu.de*/
function establishSSHTunnel(){

  var dbServerConfig= {
    host: '127.0.0.1',
    port: tunnelPort,
    user: 'student',
    password: 'tneduts',
    database: 'MediaQ_V2'
  };

  var config = {
    remoteHost: 'mediaq.dbs.ifi.lmu.de',
    remotePort: 3306, // mysql server port
    localPort: tunnelPort, // a available local port
    verbose: true, // dump information to stdout
    disabled: false, //set this to true to disable tunnel (useful to keep architecture for local connections)
    sshConfig: { //ssh2 configuration (https://github.com/mscdex/ssh2)
      host: 'remote.cip.ifi.lmu.de',
      port: 22,
      username: 'hackenschmied',
     // passphrase: 'patellalux12' // option see ssh2 config

      password: 'patellalux12', // option see ssh2 config
      readyTimeout: 20000
    }
  };

  var tunnel = new Tunnel(config);
  tunnel.connect(function (error) {
    console.log('Tunnel connected',error);
    //or start your remote connection here ....
    //mongoose.connect(...);

    console.log('DRINNEN!');
    var mysqlCon = mysql.createConnection(dbServerConfig);
    mysqlCon.connect();

    mysqlCon.query('SELECT *', function(err,rows,fields){
      if(err){
        console.log("mysqlCon::error::"+err);
      }

      console.log('SQL query ergebnis:'+rows);
    });
    mysqlCon.end();

    //close tunnel to exit script
    tunnel.close();
  });

}


module.exports = {
  router: router,
  getAllVideoNames: getAllVideoIDs};

