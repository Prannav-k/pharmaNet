'use strict';

const Drug = require('../models/drug');
const { iterateResult } = require('../utils');

class DrugList {
  constructor(ctx) {
    this.ctx = ctx;
    this.name = 'org.pharma-network.pharmanet.lists.drug';
  }


  async addDrug(requestObj) {
    const drugCompositeKey = this.ctx.stub.createCompositeKey(this.name, requestObj.getKeyArray());
    console.log('drug com key', drugCompositeKey);
    const drugBuffer = requestObj.toBuffer();
    await this.ctx.stub.putState(drugCompositeKey, drugBuffer);
  }

 
  /**
   * Returns the Property model stored in ledger identified by this key
   * @param drugKey
   * @returns {Promise<Property>}
   */
  async getDrug(drugKey) {
    const drugCompositeKey = this.ctx.stub.createCompositeKey(this.name, drugKey.split(':'));
    const drugBuffer = await this.ctx.stub.getState(drugCompositeKey);
    return Drug.fromBuffer(drugBuffer);
  }

  async getDrugHistory(drugKey){
    const drugCompositeKey = this.ctx.stub.createCompositeKey(this.name, drugKey.split(':'));
    let iterator = await this.ctx.stub.getHistoryForKey(drugCompositeKey);
    let results = await this.getAllResults(iterator, true);
    return JSON.stringify(results);

    // let result = [];
    // let res = await iterator.next();
    // while (!res.done) {
    //   if (res.value) {
    //     console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
    //     const obj = Drug.fromBuffer(drugBuffer);;
    //     result.push(obj);
    //   }
    //   res = await iterator.next();
    // }
    // await iterator.close();
    //return res;
  }
  /**
   * Returns the Property model stored in blockchain identified by the partial key
   * @param drugKey
   * @returns {Promise<Property>}
   */
  async getDrugByPartialCompositeKey(drugKey) {
    try {
      const propertyIterator = await this.ctx.stub.getStateByPartialCompositeKey(this.name, drugKey.split(':'));
      const propertyBuffer = await iterateResult(propertyIterator);

      return Drug.fromBuffer(propertyBuffer);
    } catch (err) {
      throw new Error(err);
    }
  }

  // async getDrugHistory(drugKey){
  //   try{
  //     const promiseOfIterator = this.ctx.stub.getHistoryForKey(drugKey);

  //     const results = [];
  //     for await (const keyMod of promiseOfIterator) {
  //         const resp = {
  //             timestamp: keyMod.timestamp,
  //             txid: keyMod.tx_id
  //         }
  //         if (keyMod.is_delete) {
  //             resp.data = 'KEY DELETED';
  //         } else {
  //             resp.data = keyMod.value.toString('utf8');
  //         }
  //         results.push(resp);
  //     }
  //   }catch(err){
  //     throw new Error(err);
  //   }
  // }


  async getAllResults(iterator, isHistory) {
    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.tx_id;
          jsonRes.Timestamp = res.value.timestamp;
          jsonRes.IsDelete = res.value.is_delete.toString();
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString('utf8');
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString('utf8');
          }
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return allResults;
      }
    }
  }
}

module.exports = DrugList;
