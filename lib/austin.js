/// Contains the logic for Ausin recieving, proccessing, and replying to
/// messages.
///
/// Exports:
///   Austin: Austin -- object representing the slack bot

"use strict";

let WebClient = require('slack-client').WebClient;
let RtmClient = require('slack-client').RtmClient;
let RTM_EVENTS = require('slack-client').RTM_EVENTS;
let slice = require('./slicer').slice;
let downloadFile = require('./fileDownload').downloadFile;
let fs = require('fs');
let request = require('request');
let path = require('path');

/// The bot that signs into slack, keeps track of the nba, and responds to
/// messages.
let Austin = function(configuration) {
    let token = configuration.slackToken;
    let testingChannel = 'G08FSSPPU';

    // create a new slack object to receive and send messages
    let webClient = new WebClient(token);
    let rtmClient = new RtmClient(token, { logLevel: 'info' });

    rtmClient.start();

    rtmClient.on(RTM_EVENTS.FILE_SHARED, function handleRtmMessage(message) {
      downloadFile(message.file, token)
      .then(slice)
      .then(
        function(filename) {
          console.log("resolved");
          console.log(filename);
        },
        function(error) {
          console.log("rejected");
          console.log(error);
        },
        function(progress) {
          console.log("notified");
          console.log(progress);
        }
      );
    });
}

module.exports = {
  Austin: Austin
};
