"use strict";

let fs = require('fs');
let path = require('path');
let request = require('request');
let q = require('q');

let austin_dir = path.dirname('/Users/mike.zappitello/Desktop/austin/');

/// download a slack file described by @file using an api token @token
/// @returns a filepath to the downloaded file.
///
/// @file description: https://api.slack.com/types/file
/// id: <string> 'F1313G91T',
/// created: <number> 1461342931,
/// timestamp: <number> 1461342931,
/// name: <string> 'dual.thing',
/// title: <string> 'dual.thing',
/// mimetype: <string> 'application/zip',
/// filetype: <string> 'zip',
/// pretty_type: <string> 'Zip',
/// user: <string> 'U02F11H8U',
/// editable: <bool> false,
/// size: <number> 12922,
/// mode: <string> 'hosted',
/// is_external: <bool> false,
/// external_type: <string> '',
/// is_public: <bool> false,
/// public_url_shared: <bool> false,
/// display_as_bot: <bool> false,
/// username: <string> '',
/// url_private: <string> 'url',
/// url_private_download: <string> 'url',
/// permalink: <string> 'url',
/// permalink_public: <string(string)> '',
/// channels: <array(string)> [],
/// groups: <array(string)> [ G08FSSPPU' ],
/// ims: <array(string)> [],
/// comments_count: <number> 0
let downloadFile = function(file, token) {
  return q.Promise(function(resolve, reject) {
    let filepath = path.join(austin_dir, file.name);

    let options = {
      url: file.url_private,
      headers: { 'Authorization': 'Bearer ' + token },
      method: 'GET'
    };

    let response = request(options, function(error, response, body) {
      if (error) { reject(error); }

      let file = fs.createWriteStream(filepath);
      file.write(body);
      file.end();
      resolve(filepath);
    });
  });
}

module.exports = {
  downloadFile: downloadFile
};
