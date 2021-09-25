'use strict';


class Organization {
  /**`
    * Constructor function
    * @param organizationObj
    */
  constructor(organizationObj) {
    this.key = Organization.createKey([organizationObj.companyCRN, organizationObj.companyName]);
    Object.assign(this, organizationObj);
  }

  /**
    * Create a new instance of this model
    * @returns {Organization}
    * @param organizationObj {Object}
    */
  static createInstance(organizationObj) {
    return new Organization(organizationObj);
  }

  /**
   * Create a key string joined from different key parts
   * @param keyChunks {Array}
   * @returns {*}
   */
  static createKey(keyChunks) {
    return keyChunks.map(chunk => chunk).join(':');
  }

  /**
   * Create an array of key parts for this model instance
   * @returns {Array}
   */
  getKeyArray() {
    return this.key.split(":");
  }

  /**
   * Convert the object of this model to a buffer stream
   * @returns {Buffer}
   */
  toBuffer() {
    return Buffer.from(JSON.stringify(this));
  }

  /**
   * Convert the buffer stream received from blockchain into an object of this model
   * @param buffer {Buffer}
   */
  static fromBuffer(buffer) {
    const json = JSON.parse(buffer.toString());
    return new Organization(json);
  }
}

module.exports = Organization;