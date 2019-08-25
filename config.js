/*eslint no-undef: "off"*/

let config = {};

config.env = process.env.NODE_ENV || 'development';

config.type = process.env.BUILD_TYPE || 'local';

module.exports = config;
