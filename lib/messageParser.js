/// Contains the logic for parsing messages and looking for events slackbot
/// reponds to.
///
/// Exports:
///   * parse - function that parses messages and responds

"use strict";

let re = require('named-regexp').named

/// look at a message and respond to it if necessary
///
/// @rtm - a representation of the current rtm session
/// @context - the nba context for what austin know about
/// @message - the message that was sent in
///   * type
///   * channel
///   * user
///   * text
///   * ts
///   * team
let parse = function(rtm, context, message) {
  console.log(message);

  if (message.channel !== 'G08FSSPPU') {
    return;
  }

  // for each listener, try to match the the message, and respond if succesful
  for (let id in listeners) {
    // get the listener
    let listener = listeners[id]

    // try to match the pattern for the listener. if there is a match, use the
    // listeners createResponse method, and send that response to the channel.
    let matched = listener.pattern.exec(message.text);
    if (matched) {
      listener.response(rtm, message.channel, matched);
    }
  }
};

// list of listener object. each one needs to contain a regex pattern that will
// be matched and a function to generate a response.
let listeners = [
  {
    pattern: re(/^hello/i),
    response: function(rtm, channel, matched) {
      let response = "hi";
      rtm.sendMessage(response, channel, function messageSent() {
        console.log("woot");
      });

      let data = {
        attachments: ["what?"]
      };

      rtm.postMessage(channel, "heya", data, function() { });
    }
  }
];

module.exports = {
  parse: parse
};
