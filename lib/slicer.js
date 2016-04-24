"use strict";

let fs = require('fs');
let path = require('path');
let q = require('q');

let mbResourceDir = path.dirname(
    '/Users/mike.zappitello/Documents/Toolchain-Release/Install/Library/MakerBot/sliceconfig.js');
let scjs = path.join(mbResourceDir, 'sliceconfig.js');
let callSliceConfig = require(scjs);

let austin_dir = path.dirname('/Users/mike.zappitello/Desktop/austin/');

/// Slice a file at @modelFilePath.
/// @return <q.Promise> resolves filepath and notifies progress in json
let slice = function(modelFilePath) {
  return q.Promise(function (resolve, reject, notify) {
    // setup the file names and paths
    let makerbotFileName = 'test.makerbot'
    let makerbotFilePath = path.join(austin_dir, makerbotFileName);

    // create the slice command by concatinating arguments
    let command = ['slice', '-j'];
    let printerArgs = ['-d', 'z18_6'];
    let fileInputArgs = ['-i', modelFilePath];
    let fileOutputArgs = ['-o', makerbotFilePath];
    let args = command
      .concat(printerArgs)
      .concat(fileInputArgs)
      .concat(fileOutputArgs);

    // call sliceconfig with the correct args, rejecting, or resolving on end
    let child = callSliceConfig(args, function(error, stdout, stderr) {
      if (error) {
        reject('encountered error in calling sliceconfig:\n' + error);
      } else if (stdout) {
        resolve(makerbotFilePath);
      }
    });

    child.stdout.on('data', function(data) {
      let updates = data.split("\n");
      let sc_status = JSON.parse(updates[updates.length - 2]);
      notify(sc_status);
    });

  });
};

    /*
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

    let uploadOptions = {
      file: fs.createReadStream(makerbotFilePath),
      filename: makerbotFileName,
      channels: channel
    };
    webClient.files.upload(uploadOptions, function(error, info) {
      console.log("woot");
    });

    // with progress reports, update the progress of the origional message
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
    */

module.exports = {
  slice: slice 
};
