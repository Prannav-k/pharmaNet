'use strict';

var ByteBuffer = require("bytebuffer");

// function to validate whether initiator is user
function validateUserInitiator(ctx) {
  if (ctx.clientIdentity.getMSPID() !== 'distributorMSP')
    throw new Error('Requestor is not allowed to perform this action');
}

// function to validate whether initiator is manufacturer
function validatemanufacturerInitiator(ctx) {
  console.log(ctx.clientIdentity.getMSPID());
  if (ctx.clientIdentity.getMSPID() !== 'manufacturerMSP')
    throw new Error('Requestor is not allowed to perform this action');
}

// Function to fetch the result from iterator
async function iterateResult(iterator) {
  let result = await iterator.next();

  while (true) {
    if (result.value && result.value.value) {
      var bb = ByteBuffer.wrap(result.value.value);
      var b = new Buffer(bb.toArrayBuffer());
      return b;
    }
    if (result.done) {
      iterator.close();
      break;
    }
    result = await iterator.next();
  }
}




module.exports = { validateUserInitiator, validatemanufacturerInitiator, iterateResult };