/* eslint-disable @typescript-eslint/no-require-imports */
const dashscope = require('dashscope');
console.log('dashscope exports:', Object.keys(dashscope));
if (dashscope.Model) {
  console.log('Model exists');
  console.log('Model keys:', Object.keys(dashscope.Model));
} else {
  console.log('Model is undefined');
}
