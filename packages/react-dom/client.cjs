'use strict';

const React = require('react');

function resolveCreateRoot() {
  const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  if (!internals || typeof internals.createRoot !== 'function') {
    throw new Error('This React build does not expose createRoot.');
  }
  return internals.createRoot;
}

function createRoot(container) {
  const create = resolveCreateRoot();
  return create(container);
}

module.exports = {
  createRoot,
};
module.exports.default = module.exports;
