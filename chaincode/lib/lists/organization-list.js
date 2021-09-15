'use strict';

const Organization = require('../models/organization');
const { iterateResult } = require('../utils');

class OrganizationList {
  constructor(ctx) {
    this.ctx = ctx;
    this.name = 'org.pharma-network.pharmanet.lists.organization';
  }

  /**
  * Adds a property model to the ledger
  * @param propertyObj
  * @returns {Promise<Property>}
  */
  async addOrganization(requestObj) {
    const organizationCompositeKey = this.ctx.stub.createCompositeKey(this.name, requestObj.getKeyArray());
    console.log('console com key', organizationCompositeKey);
    const organizationBuffer = requestObj.toBuffer();
    await this.ctx.stub.putState(organizationCompositeKey, organizationBuffer);
  }

 
  /**
   * Returns the Property model stored in ledger identified by this key
   * @param organizationKey
   * @returns {Promise<Property>}
   */
  async getOrganization(organizationKey) {
    const propertyCompositeKey = this.ctx.stub.createCompositeKey(this.name, organizationKey.split(':'));
    const propertyBuffer = await this.ctx.stub.getState(propertyCompositeKey);
    return Organization.fromBuffer(propertyBuffer);
  }

  /**
   * Returns the Property model stored in blockchain identified by the partial key
   * @param propertyKey
   * @returns {Promise<Property>}
   */
  async getOrganizationByPartialCompositeKey(propertyKey) {
    try {
      const propertyIterator = await this.ctx.stub.getStateByPartialCompositeKey(this.name, propertyKey.split(':'));
      const propertyBuffer = await iterateResult(propertyIterator);

      return Organization.fromBuffer(propertyBuffer);
    } catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = OrganizationList;
