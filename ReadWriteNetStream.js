var ReadWriteStream = require('./ReadWriteStream')
,   events          = require('events')
,   util            = require('util');

function ReadWriteNetStream(specialTimeout){
  this.specialTimeout = specialTimeout || false;
  ReadWriteStream.call(this);
  this.bufferSize = 0;
  this.remoteAddress = '';
  this.remotePort = '';
  this.bytesRead = '';
  this.bytesWritten = '';
}

util.inherits(ReadWriteNetStream, ReadWriteStream);

  // Net.Socket
[
    'connect'
  , 'setSecure'
  , 'setTimeout'
  , 'setNoDelay'
  , 'setKeepAlive'
  , 'address'
  , 'timeout'
].forEach(function(funcName){
  ReadWriteNetStream.prototype[funcName.name || funcName] = (function(func){
    var event = funcName.event || func;
    return function(a, b){
      if(this.specialTimeout && funcName === 'setTimeout' && typeof b === 'function') {
        this.on('timeout', b);
      }
      var args = Array.prototype.slice.call(arguments);
      args.unshift(event);
      this.emit.apply(this, args);
    };
  }(funcName));
});

module.exports = ReadWriteNetStream;
