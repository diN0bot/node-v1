# node-v1

node-v1 is a [Node.js](http://www.nodejs.org) module that wraps the [VersionOne](http://www.versionone.com/) REST [Data API](http://community.versionone.com/sdk/Documentation/DataAPI.aspx).

## Install

npm install node-v1

## Use It

	var connOptions = {
		proto: 'https',
		host: 'www.v1host.com',
		port: '443',
		org: 'MYORG',
		version: 'rest-1.v1'
		user: 'myuser',
		pass: 'mypass'
	};
	
	var v1http = require('v1').v1http;
	var client = new v1http.RawV1(connOptions);
	
	// create a query.
	var query = new v1http.QueryBuilder().find('my search string').findin('Name');
	
	// only certain fields.
	query = query.sel('Name,Number,Timebox,AssetState');
	
	// filter by status.
	query = query.where('Status.Name=\'Accepted\'');
	
	// execute query against defects
	client.defect(query, function(err, status, results) {
		// err is an Error object. it will be null in most cases.
		// status is an HTTP status integer.
		// results will be XML.
	});
	
	// execute the same query against tasks
	client.task(query, function(err, status, results) {
		
		// do something interesting with the xml
		var Asset = require('v1').Asset;
		var assets = Asset.fromXml(results);
		assets.forEach(function(asset) {
			// assets have the following fields:
			// href, id, idref, attributes, relations.
			// attributes are simple string:string hashes, while
			// relations are string:asset hashes.
		});
	});
	
## TODO

*  Get an index.js and arrange the exported objects properly so they work like
in the example.
*  Updates, requires updating doRequest to do a POST and send data.