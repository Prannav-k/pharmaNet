'use strict';
const helper = require('./contractHelper');

async function main(org, fabricUserName, channelName, chainCodeName, smartContractName) {

	try {

		
		// Reference
		let objContract		
		let data

		console.log("In method");
		// Create contract Instance
		objContract = await helper.getContractInstance(org, fabricUserName, channelName, chainCodeName, smartContractName,drugName,drugSerialNumber );

		// Submit Transaction
		console.log('.....View data on the Network');
		data = await objContract.evaluateTransaction('viewDrugHistory', drugName,drugSerialNumber);

		// Process response
		console.log('.....Processing Transaction  \n\n');
		data = JSON.parse(data.toString());
		console.log('\n\n.....Processing Complete!');

		// Response
		return data;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

module.exports.execute = main;
