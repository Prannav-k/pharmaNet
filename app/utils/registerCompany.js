/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs'); // FileSystem Library
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const {getConnectionProfilePath, getIdentityPath} = require("../constants/constant")
const helper = require('./contractHelper');

async function main(org, fabricUserName, channelName, chainCodeName, smartContractName, companyCRN, companyName, location, organisationRole) {

	try {

		// Reference
		let objContract
		let dataBuffer
		let newCompany

		console.log("Getting contract instance using ",org, fabricUserName, channelName, chainCodeName, smartContractName);
		// Create contract Instance
	
		objContract = await helper.getContractInstance(org, fabricUserName, channelName, chainCodeName, smartContractName );

		// Submit Transaction
		console.log('.....Requesting to transaction on the Network');
		let txObject = await objContract.createTransaction('registerCompany')
		console.log("txObject is ",txObject);
		let txId = txObject.getTransactionID()
		console.log("txId is ",txId)
		dataBuffer = await txObject.submit( companyCRN, companyName, location, organisationRole);

		// process response
		console.log('.....Processing Request New User Transaction Response \n\n');
		newCompany = JSON.parse(dataBuffer.toString());
		console.log('\n\n.....Request New User Transaction Complete!');

		// Add Tx to reponse
		newCompany["txId"] = txId._transaction_id

		// Response
		return newCompany;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

module.exports.execute = main;
