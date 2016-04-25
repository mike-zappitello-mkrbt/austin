"use strict";

let fs = require('fs');
let path = require('path');
let q = require('q');

let mbResourceDir = path.dirname(
    '/Users/mike.zappitello/Documents/Toolchain-Release/Install/Library/MakerBot/sliceconfig.js');
let scjs = path.join(mbResourceDir, 'sliceconfig.js');
let callSliceConfig = require(scjs);

let austin_dir = path.dirname('/Users/mike.zappitello/Desktop/austin/');

/// Slice a file at @modelFilePath with standard settings on a z18
/// @return q.Promise
///  @resolve - filepath string
///  @reject - error string
///  @notify - { message: string, progress: number, type: string }
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

module.exports = {
  slice: slice 
};
