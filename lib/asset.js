
var et = require('elementtree');

function Asset() {
  this.href = null;
  this.id = null;
  this.idref = null;
  this.attributes = {};
  this.relations = {};
}

function makeAttribute(element) {
  return { name: element.attrib.name, text: element.text };
}

function makeRelation(element) {
  var asset = element.findall('./Asset');
  // this works as long as the assumption that each relation has one or zero assets.
  asset = asset.length > 0 ? makeAsset(asset[0]) : undefined;
  return { name: element.attrib.name, asset: asset };
}

function makeAsset(element) {
  if (element.tag !== 'Asset') {
    return null;
  }
  var ass = new Asset();
  ass.href = element.attrib.href;
  ass.id = element.attrib.id;
  ass.idref = element.attrib.idref;
  ass.attributes = element.findall('./Attribute').map(makeAttribute).reduce(function(hash, named) { 
    hash[named.name] = named.text; 
    return hash
  }, {});
  ass.relations = element.findall('./Relation').map(makeRelation).reduce(function(hash, named) {
    hash[named.name] = named.asset;
    return hash;
  }, {});
  return ass;
}

Asset.fromXml = function(xml) {
  var etree = et.parse(xml);
  // see if we're dealing with Assets or an Asset.
  if (etree.getroot().tag === 'Assets') {
    // parse many.
    var count = etree.getroot().attrib.total;
    var assets = etree.getroot().findall('./Asset').map(makeAsset);
    // count === assets.length
    return assets;
  } else if(etree.getroot().tag === 'Asset') {
    // parse single.
    return makeAsset(etree.getroot());
  } else {
    // todo: this is an error state.
    throw new Error('Cannot make asset from ' + etree.getroot().tag);
  }
};


exports.Asset = Asset;