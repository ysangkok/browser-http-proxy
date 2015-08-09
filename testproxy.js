var casper = require('casper').create();

var xhr = require('../../node_modules/phantomxhr/phantomxhr.js');

xhr.init(casper.page, {});

xhr.fake({
  url: /object\/([0-9]+\?)/,
  responseBody: { /*my response*/ }
});

casper.start('testproxy.html', function() {
    self.echo(this.getTitle());
});

casper.run();
