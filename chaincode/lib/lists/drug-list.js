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
    let result = [];
    let res = await iterator.next();
    while (!res.done) {
      if (res.value) {
        console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
        const obj = Drug.fromBuffer(drugBuffer);;
        result.push(obj);
      }
      res = await iterator.next();
    }
    await iterator.close();
    return res;
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
}

module.exports = DrugList;
