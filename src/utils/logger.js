import debugCaller from 'debug-caller';

// enable project namespace to print log messages by default
debugCaller.debug.enable('hexmapper-api*');

module.exports = function exports() {
  // set a depth of 2 to avoid using this file within debug statements
  // (since this is just a passthrough for logging)
  return debugCaller('hexmapper-api*', {
    depth: 2,
    logColor: 2, // green
  });
};
