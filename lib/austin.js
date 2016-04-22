/// Contains the logic for Ausin recieving, proccessing, and replying to
/// messages.
///
/// Exports:
///   Austin: Austin -- object representing the slack bot

"use strict";

let fs = require('fs'),
    WebClient = require('slack-client').WebClient;

/// The bot that signs into slack, keeps track of the nba, and responds to
/// messages.
let Austin = function(configuration) {
    // create a new slack object to receive and send messages
    let web = new WebClient(configuration.slackToken);

    let uploadOptions = {
      file: fs.createReadStream("/Users/mike.zappitello/Desktop/dual.thing"),
      filename: "dual.thing",
      channels: 'G08FSSPPU'
    };
    web.files.upload(uploadOptions, function() { console.log("woot"); });
}

module.exports = {
  Austin: Austin
};
