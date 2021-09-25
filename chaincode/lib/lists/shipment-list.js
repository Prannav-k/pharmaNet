'use strict';

const Shipment = require('../models/shipment');
const { iterateResult } = require('../utils');

class ShipmentList {
  constructor(ctx) {
    this.ctx = ctx;
    this.name = 'org.pharma-network.pharmanet.lists.shipment';
  }

  /**
  * Adds a Shipment model to the ledger
  * @param shipmentObj
  * @returns {Promise<Shipment>}
  */
  async addShipment(shipmentObj) {
    const requestCompositeKey = this.ctx.stub.createCompositeKey(this.name, shipmentObj.getKeyArray());
    console.log('console com key', requestCompositeKey);
    const requestBuffer = shipmentObj.toBuffer();
    await this.ctx.stub.putState(requestCompositeKey, requestBuffer);
  }

  /**
   * Deletes the Shipment model from the ledger
   * @param shipmentObj
   * @returns {Promise<Shipment>}
   */
  async deleteShipment(shipmentObj) {
    const ShipmentCompositeKey = this.ctx.stub.createCompositeKey(this.name, shipmentObj.getKeyArray());
    await this.ctx.stub.deleteState(ShipmentCompositeKey);
  }

  /**
   * Returns the Shipment model stored in ledger identified by this key
   * @param ShipmentKey
   * @returns {Promise<Shipment>}
   */
  async getShipment(ShipmentKey) {
    const ShipmentCompositeKey = this.ctx.stub.createCompositeKey(this.name, ShipmentKey.split(':'));
    const ShipmentBuffer = await this.ctx.stub.getState(ShipmentCompositeKey);
    return Shipment.fromBuffer(ShipmentBuffer);
  }

  /**
   * Returns the Shipment model stored in blockchain identified by the partial key
   * @param ShipmentKey
   * @returns {Promise<Shipment>}
   */
  async getShipmentByPartialCompositeKey(ShipmentKey) {
    try {
      const ShipmentIterator = await this.ctx.stub.getStateByPartialCompositeKey(this.name, ShipmentKey.split(':'));
      const ShipmentBuffer = await iterateResult(ShipmentIterator);

      return Shipment.fromBuffer(ShipmentBuffer);
    } catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = ShipmentList;
