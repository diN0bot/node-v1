
var v1 = require('../lib/v1http');
var Asset = require('../lib/asset').Asset;

exports['test_nothing'] = function(test, assert) {
  assert.ok(true);
  test.finish();
}

exports['test_single_asset_parsing'] = function(test, assert) {
  var xml = '' +
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<Asset href="/ORG/rest-1.v1/Data/Defect/11111" id="Defect:11111">' +
          '  <Attribute name="Name">test defect (gdusbabek)</Attribute>' +
          '  <Attribute name="Status.Name">Accepted</Attribute>' +
          '  <Relation name="Status">' +
          '    <Asset href="/RACKSPCE/rest-1.v1/Data/StoryStatus/137" idref="StoryStatus:137"/>' +
          '  </Relation>' +
          '</Asset>';
  var asset = Asset.fromXml(xml);
  
  assert.strictEqual('/ORG/rest-1.v1/Data/Defect/11111', asset.href);
  assert.strictEqual('Defect:11111', asset.id);
  assert.strictEqual(undefined, asset.idref);
  assert.strictEqual('test defect (gdusbabek)', asset.attributes.Name);
  assert.strictEqual('Accepted', asset.attributes['Status.Name']);
  assert.strictEqual('/RACKSPCE/rest-1.v1/Data/StoryStatus/137', asset.relations.Status.href);
  assert.strictEqual('StoryStatus:137', asset.relations.Status.idref);
  assert.strictEqual(undefined, asset.relations.Status.id);
  
  test.finish();
};

exports['test_many_asset_parsing'] = function(test, assert) {
  var xml = '' +
          '<?xml version="1.0" encoding="UTF-8"?>' +
          '<Assets total="2" pageSize="2147483647" pageStart="0">' +
          '  <Asset href="/ORG/rest-1.v1/Data/Defect/11111" id="Defect:11111">' +
          '    <Attribute name="Name">test defect (gdusbabek)</Attribute>' +
          '    <Attribute name="Status.Name">Accepted</Attribute>' +
          '    <Relation name="Status">' +
          '      <Asset href="/RACKSPCE/rest-1.v1/Data/StoryStatus/137" idref="StoryStatus:137"/>' +
          '    </Relation>' +
          '  </Asset>' +
          '  <Asset href="/ORG/rest-1.v1/Data/Defect/11112" id="Defect:11112">' +
          '    <Attribute name="Name">some other defect</Attribute>' +
          '    <Attribute name="Status.Name">Accepted</Attribute>' +
          '    <Relation name="Timebox"/>' +
          '    <Relation name="Status">' +
          '      <Asset href="/RACKSPCE/rest-1.v1/Data/StoryStatus/137" idref="StoryStatus:137"/>' +
          '    </Relation>' +
          '  </Asset>' +
          '</Assets>';
  var asset = Asset.fromXml(xml);
  assert.strictEqual(2, asset.length); // because it's a list.
  asset = asset[0]; 
  console.log(asset);
  
  assert.strictEqual('/ORG/rest-1.v1/Data/Defect/11111', asset.href);
  assert.strictEqual('Defect:11111', asset.id);
  assert.strictEqual(undefined, asset.idref);
  assert.strictEqual('test defect (gdusbabek)', asset.attributes.Name);
  assert.strictEqual('Accepted', asset.attributes['Status.Name']);
  assert.strictEqual('/RACKSPCE/rest-1.v1/Data/StoryStatus/137', asset.relations.Status.href);
  assert.strictEqual('StoryStatus:137', asset.relations.Status.idref);
  assert.strictEqual(undefined, asset.relations.Status.id);
  
  test.finish();
}