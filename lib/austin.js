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
let q = require('q');

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
      // make sure that this file was shared in a dm and that it didn't come
      // from the bot itself
      if (message.file.ims.length === 0) { return; }
      if (message.file.user === 'U08FT3BDF') { return; }

      // do some checks on the file type?
      let fileName = message.file.name;
     
      // get the user id and initialize ts and channel to undefined
      let userId = message.file.user;
      let ts = undefined;
      let channel = undefined;

      // set oldSeconds to the time when the file is first loaded. we'll use
      // this later to throttle message updates
      let oldSeconds = new Date().getSeconds();

      // function to get the information on how to dm a user
      let getDmInfo = function(userId) {
        return q.Promise(function(resolve, reject) {
          webClient.dm.open(userId, function(error, dmInfo) {
            if (error) { reject("error in requesting dm info:\n" + error); }
            else { resolve(dmInfo); }
          });
        });
      };

      // function to send the origional message to the user
      let sendDm = function(dmInfo) {
        return q.Promise(function (resolve, reject) {
          let channel = dmInfo.channel.id;
          let text = 'downloading file';
          webClient.chat.postMessage(channel, text, {}, function(error, info) {
            if (error) { reject("error in post message:\n" + error); }
            else if (info) { resolve(info); }
          });
        });
      };

      // function to update the progress in our message. uses timers throtle the
      // rate of updates.
      let updateSliceProgress = function(ts, channel, sc_status) {
        // check that we're not sending messages too quickly
        let currentSeconds = new Date().getSeconds();
        if (currentSeconds === oldSeconds) { return; }
        else { oldSeconds = currentSeconds; }

        // update the message with the current progress
        let text = 'slicing model ' + sc_status.progress + '%';
        webClient.chat.update(ts, channel, text, {}, null);
      }

      // upload a file @filepath to @channel and update a message @ts.
      let uploadFile = function(ts, channel, filepath) {
        let text = 'slicing completd';
        webClient.chat.update(ts, channel, text, {}, null);

        let uploadOptions = {
          file: fs.createReadStream(filepath),
          filename: "test.makerbot",
          channels: channel
        };
        webClient.files.upload(uploadOptions, null);
      };

      // chain all of our functions together
      getDmInfo(userId)
      .then(function(dmInfo) { return sendDm(dmInfo); })
      .then(function(directMessage) {
        ts = directMessage.ts;
        channel = directMessage.channel;
        return downloadFile(message.file, token);
      })
      .then(function(filepath) { return slice(filepath); })
      .then(
        function(filepath) { uploadFile(ts, channel, filepath); },
        function(error) { console.log("rejected\n"  + error); },
        function(sc_status) { updateSliceProgress(ts, channel, sc_status); }
      );
    });
}

module.exports = {
  Austin: Austin
};
