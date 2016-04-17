/// Contains the logic for parsing messages and looking for events slackbot
/// reponds to.
///
/// Exports:
///   * parse - function that parses messages and responds

"use strict";

let re = require('named-regexp').named

/// look at a message and respond to it if necessary
///
/// @slack - a representation of the current slack session
/// @context - the nba context for what austin know about
/// @message - the message that was sent in
///   * type
///   * channel
///   * user
///   * text
///   * ts
///   * team
let parse = function(slack, context, message) {
  // get the channel and make sure that we're a member of the chanel
  let channel = slack.getChannelGroupOrDMByID(message.channel);
  if (!channel.is_member) {
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
      listener.response(channel, matched, context);
    }
  }
};

// list of listener object. each one needs to contain a regex pattern that will
// be matched and a function to generate a response.
let listeners = [
];

module.exports = {
  parse: parse
};
