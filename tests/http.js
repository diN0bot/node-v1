
var v1 = require('../lib/v1http');

exports['test_nulls_in_hash'] = function(test, assert) {
  assert.ok(v1);
  assert.ok(v1.ConnectionBuilder);
  var connectionBuilder = new v1.ConnectionBuilder()
        .proto('http').host('myv1host.com').port('3433')
        .org('MYORG').version('rest-1.v1');
  var expectedHash = {proto: 'http', host: 'myv1host.com', port: '3433', org: 'MYORG', version: 'rest-1.v1'};
  
  assert.strictEqual(connectionBuilder.toHash(false)['user'], null);
  assert.strictEqual(connectionBuilder.toHash(true)['user'], undefined);
  
  // nulls get stripped out.
  assert.deepEqual(expectedHash, connectionBuilder.toHash());
  
  
  connectionBuilder.user('myuser').pass('mypass');
  expectedHash['user'] = 'myuser';
  expectedHash['pass'] = 'mypass';
  assert.deepEqual(expectedHash, connectionBuilder.toHash());
  assert.deepEqual(expectedHash, connectionBuilder.toHash(false));
  assert.deepEqual(expectedHash, connectionBuilder.toHash(true));
  
  test.finish();
  
}