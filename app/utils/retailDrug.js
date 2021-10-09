/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs'); // FileSystem Library
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const {getConnectionProfilePath, getIdentityPath} = require("../constants/constant")

async function main(org, fabricUserName, channelName, chainCodeName, smartContractName,drugName, serialNo, retailerCRN, customerAadhar) {

	try {

		// Reference
		let objContract
		let dataBuffer
		let newPo

		// Create contract Instance
		objContract = await helper.getContractInstance(org, fabricUserName, channelName, chainCodeName, smartContractName);

		// Submit Transaction
		console.log('.....Requesting to transaction on the Network');
		let txObject = await objContract.createTransaction('retailDrug')
		let txId = txObject.getTransactionID()
		dataBuffer = await txObject.submit(drugName, serialNo, retailerCRN, customerAadhar);

		// process response
		console.log('.....Processing Request New User Transaction Response \n\n');
		newPo = JSON.parse(dataBuffer.toString());
		console.log('\n\n.....Request New User Transaction Complete!');

		// Add Tx to reponse
		newPo["txId"] = txId._transaction_id

		// Response
		return newPo;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}

module.exports.execute = main;
