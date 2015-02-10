/* Created by mazemilian

 Dictionary for Server-wide config data like ServerData etc.. change here to get everything running..

 */

//var serverIP = 'http://192.168.0.104:3000';
var serverIP = '';
var mediaQDataURL = serverIP + '/dbquery';

/* If ENOENT error try changing 'serverRoot' to '../' (or '../../')*/
var cfg = {
    serverIP : serverIP,
    mediaQDataURL : mediaQDataURL,
    serverRoot: '../../'
};



module.exports = cfg;
