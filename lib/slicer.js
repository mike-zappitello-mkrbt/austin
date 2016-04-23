"use strict";

let fs = require('fs'),
    path = require('path'),
    WebClient = require('slack-client').WebClient;

let mbResourceDir = path.dirname(
    '/Users/mike.zappitello/Documents/Toolchain-Release/Install/Library/MakerBot/sliceconfig.js');
let scjs = path.join(mbResourceDir, 'sliceconfig.js');
let callSliceConfig = require(scjs);

let austin_dir = path.dirname('/Users/mike.zappitello/Desktop/austin/');

/// Slice a file named @modelFile. Use the @webClient to message a channel on
/// progress updates and to upload the .makerbot file to @channel.
let slice = function(webClient, modelFilePath, channel) {
    // setup the file names and paths
    // let modelFileName = 'test.stl';
    // let modelFilePath = path.join(desktop, modelFileName);
    let makerbotFileName = 'test.makerbot'
    let makerbotFilePath = path.join(austin_dir, makerbotFileName);

    // setup the first message, and get the timestamp so we can keep updating it
    let message = 'slicing model 0%';
    let postMessageOpts = {};
    let ts = undefined;
    webClient.chat.postMessage(channel, message, postMessageOpts, function(error, info) {
      if (error) {
        console.log("error in post message:\n" + error);
      } else if (info) {
        ts = info.message.ts;
      }
    });

    // create the slice command by concatinating arguments
    let command = ['slice', '-j'];
    let printerArgs = ['-d', 'z18_6'];
    let fileInputArgs = ['-i', modelFilePath];
    let fileOutputArgs = ['-o', makerbotFilePath];
    let args = command
      .concat(printerArgs)
      .concat(fileInputArgs)
      .concat(fileOutputArgs);

    // call sliceconfig with the correct args
    //
    // on finish, upload the file to the channel
    let child = callSliceConfig(args, function(error, stdout, stderr) {
      if (error) {
        console.log('encountered error in calling sliceconfig:\n' + error);
      } else {
        let uploadOptions = {
          file: fs.createReadStream(makerbotFilePath),
          filename: makerbotFileName,
          channels: channel
        };
        webClient.files.upload(uploadOptions, function(error, info) {
          console.log("woot");
        });
      }
    });

    // with progress reports, update the progress of the origional message
    child.stdout.on('data', function(chunk) {
      try {
        let parsedChunk = JSON.parse(chunk);
        if (parsedChunk.progress) {
          message =
            'slicing model ' + parsedChunk.progress + '%';
          webClient.chat.update(ts, channel, message, postMessageOpts, function(error, info) {
          });
        }
      } catch(error) {
        console.log("encountered error in sc progress:\n" + error);
      }
    });
}

module.exports = {
  slice: slice 
};
