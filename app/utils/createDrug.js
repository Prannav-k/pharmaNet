/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs'); // FileSystem Library
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const {getConnectionProfilePath, getIdentityPath} = require("../constants/constant")
const helper = require('./contractHelper');

async function main(org, fabricUserName, channelName, chainCodeName, smartContractName, drugName, serialNo, mfgDate, expDate, companyCRN) {

	try {

		// Reference
		let objContract
		let dataBuffer
		let newDrug

		// Create contract Instance
		objContract = await helper.getContractInstance(org, fabricUserName, channelName, chainCodeName, smartContractName);

		// Submit Transaction
		console.log('.....Requesting to transaction on the Network');
		let txObject = await objContract.createTransaction('addDrug')
		let txId = txObject.getTransactionID()
		dataBuffer = await txObject.submit( drugName, serialNo, mfgDate, expDate, companyCRN);

		// process response
		console.log('.....Processing Request New User Transaction Response \n\n');
		newDrug = JSON.parse(dataBuffer.toString());
		console.log('\n\n.....Request New User Transaction Complete!');

		// Add Tx to reponse
		newDrug["txId"] = txId._transaction_id

		// Response
		return newDrug;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}

module.exports.execute = main;
