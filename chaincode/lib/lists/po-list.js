'use strict';

const Po = require('../models/po');
const { iterateResult } = require('../utils');

class poList {
  constructor(ctx) {
    this.ctx = ctx;
    this.name = 'org.pharma-network.pharmanet.lists.po';
  }


  async addPo(requestObj) {
    const drugCompositeKey = this.ctx.stub.createCompositeKey(this.name, requestObj.getKeyArray());
    console.log('po com key', drugCompositeKey);
    const drugBuffer = requestObj.toBuffer();
    await this.ctx.stub.putState(drugCompositeKey, drugBuffer);
  }

 
  /**
   * Returns the Property model stored in ledger identified by this key
   * @param poKey
   * @returns {Promise<Property>}
   */
  async getPo(poKey) {
    const drugCompositeKey = this.ctx.stub.createCompositeKey(this.name, poKey.split(':'));
    const drugBuffer = await this.ctx.stub.getState(drugCompositeKey);
    return Po.fromBuffer(drugBuffer);
  }

  /**
   * Returns the Property model stored in blockchain identified by the partial key
   * @param poKey
   * @returns {Promise<Property>}
   */
  async getPoByPartialCompositeKey(poKey) {
    try {
      const propertyIterator = await this.ctx.stub.getStateByPartialCompositeKey(this.name, poKey.split(':'));
      const propertyBuffer = await iterateResult(propertyIterator);

      return Po.fromBuffer(propertyBuffer);
    } catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = poList;
