'use strict'

//Prerequisites: Install ffmpeg and imagemagick (eg via homebrew).
var express = require('express');
var thumbgen = require('thumbnails-webvtt');
var path = require('path');
//var fs = require('fs');
var fs = require('fs-extra');
var router = express.Router();
var filewriter = require('./filewriter');
var dbq = require('./dbquery.js');
var pathtoVideoServer = 'http://mediaq.dbs.ifi.lmu.de/MediaQ_MVC_V2/video_content/';

/**
 * Options for Thumbnail-Generation
 * @type {{size: {height: number}, secondsPerThumbnail: number, startVideo: number}}
 */
var spritesheetOptions = {
  size : {
    height: 100
  },
  secondsPerThumbnail: 4,
  startVideo: 0
}

/* GET users listing. */
router.get('/', function(req, res) {

  dbq.getAllVideoNames(function(names){
    var url = 'http://mediaq.dbs.ifi.lmu.de/MediaQ_MVC_V2/video_content/';
    generateBunchOfSpritesheets(pathtoVideoServer,names);
  });



  res.send('ffmpeg and imagemagick have to be installed! (eg via homebrew!)');

});

/** GET users listing. */
router.get('/singleVid', function(req, res) {

    var videoID = req.param('vid');

    generateSpritesheet(pathtoVideoServer+videoID, function(){
        console.log('Spritesheet generated');
    });

    res.send('ffmpeg and imagemagick have to be installed! (eg via homebrew!)');

});


/**
 * Call to Generate all Spritesheets beginning with the opstions{startvideo}.
 * @param pathToVideos Where are the videos? Server from MediaQ
 * @param videoNames All names of the videos
 */
function generateBunchOfSpritesheets(pathToVideos, videoNames){

    //iterator video entry
  var i=spritesheetOptions.startVideo;
    //default seconds per thumb
  var secPThumb = spritesheetOptions.secondsPerThumbnail;

    //custom callback-enabled loop
  var genThumbs = function () {
    var videoPath = pathToVideos+videoNames[i];
      var vn = getName(videoPath);

      console.log('Generating Thumbs for video '+ (i+1) + ' from ' + videoNames.length, videoPath);


    generateSpritesheet(videoPath,function(err){
      if(err){
          //remove old tempFiles
          fs.removeSync('./media/'+getName(videoPath));
          //use more secs per thumbnail - problem with exact ending of video
          spritesheetOptions.secondsPerThumbnail++;
          //if sec/thumb > 15 --> give up!
          if(spritesheetOptions.secondsPerThumbnail>15){
              i++;
              spritesheetOptions.secondsPerThumbnail = secPThumb;

          }
          genThumbs();
      }else{

          i++;
          spritesheetOptions.secondsPerThumbnail = secPThumb;

      if(i<videoNames.length){

        try{

          genThumbs();
        }catch(err){
          console.log('Err: '+ err +' | ThumbnailGeneration failed for '+videoNames[i]);
        }
      }
      }
    });

  }

  genThumbs();


}


/**
 * Generate Spritesheet for one video. also generate meta-files (vtt and json)
 * @param pathToVideo
 * @param callback callback(error)
 */
function generateSpritesheet(pathToVideo,callback){
  thumbgen(pathToVideo, {
    output: './media/'+getName(pathToVideo)+'.vtt',
    size: spritesheetOptions.size,
    secondsPerThumbnail: spritesheetOptions.secondsPerThumbnail,
    spritesheet: true
  }, function (err, metadata){

    var error = undefined;
    if(err){
      console.log('spriteGenerator::generateSpritesheet::'+err);
    }


    if(metadata) {
      console.log('writing MetaData JSON', JSON.stringify(metadata));


      filewriter.writeToFile(metadata, './media/' + getName(pathToVideo) + '.json', function (err) {
        if (err) {
          console.log("spriteGenerator.js::generateSpritesheet::writetofile::" + err);
        }
      });

    } else {
        error = new Error('spriteGenerator::generateSpritesheet::writeToFile::metadata=undefined | Spritesheetgeneration failed!')
        console.dir(error);


    }

    callback(error);
  })

}


function getName(dir){
  return path.basename(dir, path.extname(dir));
}
module.exports = router;
