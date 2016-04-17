/// Contains the logic for storing / saving the context for austin
///
/// Exports: context

"use strict";

let fs = require('fs')

let context = function() {
  // object representing the data of the context
  let that = {};

  return that;
};

module.exports = {
  context: context 
};
