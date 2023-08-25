'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
let PrintOK;

if (process.platform === 'win32') {
  const ntsuspend = require(`../build/Release/suspend.node`);
  PrintOK = ntsuspend;
}

export {PrintOK}