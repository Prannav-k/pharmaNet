'use strict';

const { Contract, Context } = require('fabric-contract-api');
const Request = require('./lib/models/request');
const User = require('./lib/models/user');
const Property = require('./lib/models/property');
const RequestList = require('./lib/lists/request-list');
const UserList = require('./lib/lists/user-list');
const PropertyList = require('./lib/lists/property-list');
const { validateUserInitiator } = require('./lib/utils');

class PropnetContext extends Context {
  constructor() {
    super();
    this.requestList = new RequestList(this);
    this.userList = new UserList(this);
    this.propertyList = new PropertyList(this);
  }
}

class UserContract extends Contract {
  constructor() {
    //name of contract for further refering
    super('org.pharma-network.pharmanet.user');
  }

  createContext() {
    return new PropnetContext();
  }

  //normal method, that will be called while instantiating the chaincode
  async instantiate(ctx) {
    console.log('User Smart Contract Instantiated');
  }

  async check(ctx){
    return "samplei";
  }

  //creates a new request asset in ledger
  async requestNewUser(ctx, name, emailId, phoneNumber, aadharId) {
    //check if client is of user
    if (ctx.clientIdentity.getMSPID() !== 'distributorMSP')
    throw new Error('Requested entity is not allowed to perform this action');

    //create composite key using name , adhar
    const userReqKey = Request.createKey([name, aadharId]);
    const existingUserReq = await ctx.requestList
    .getUserRequest(userReqKey)
    .catch(() => console.log('User`s request doesn`t exists. Creating new user request record ...'));

    if (existingUserReq)
      throw new Error('Failed to create request for this user as this user`s request already exists');

    const userReqObj = {
      name,
      emailId,
      phoneNumber,
      aadharId,
      createdAt: new Date(),
    };

    // Create a new instance of request model and save it to ledger
    const newUserReqObj = Request.createInstance(userReqObj);
    await ctx.requestList.addUserRequest(newUserReqObj);
    return newUserReqObj;
  }


  async rechargeAccount(ctx, name, aadharId, txnId) {
    //check if client is of user
    if (ctx.clientIdentity.getMSPID() !== 'distributorMSP')
    throw new Error('Requested entity is not allowed to perform this action');
    
    const userKey = Request.createKey([name, aadharId]);
    let rechargeAmmount;

    // Validate whether user is registered
    const existingUserObj = await ctx.userList
      .getUser(userKey)
      .catch(() => { throw new Error('Given user does not exist') });

    // Recharge amount based on txn id
    switch (txnId) {
      case 'upg100':
        rechargeAmmount = 100;
        break;
      case 'upg500':
        rechargeAmmount = 500;
        break;
      case 'upg1000':
        rechargeAmmount = 1000;
        break;
      default:
        throw new Error('Invalid txn ID');
    }

    existingUserObj.upgradCoins += rechargeAmmount;

    // Create an instance of user model and update the asset on the ledger
    const updatedUserObj = User.createInstance(existingUserObj);
    await ctx.userList.addUser(updatedUserObj);

    return updatedUserObj;
  }

 
  //method to  view user
  async viewUser(ctx, name, aadharId) {
    //check if client is of user
    if (ctx.clientIdentity.getMSPID() !== 'distributorMSP')
    throw new Error('Requested entity is not allowed to perform this action');
    
    const userKey = User.createKey([name, aadharId]);

    // Check if user is present in the list
    const userObj = await ctx.userList
      .getUser(userKey)
      .catch(err => { throw new Error('User does not exists', err) });

    return userObj;
  }

  async propertypharmaRequest(ctx, name, aadharId, propertyId, price, status) {
     //check if client is of user
     if (ctx.clientIdentity.getMSPID() !== 'distributorMSP')
     throw new Error('Requested entity is not allowed to perform this action');
     
    const propertyReqKey = Request.createKey([propertyId, name, aadharId]);

    // Validate whether same request already exists
    const existingPropertyReq = await ctx.requestList
      .getUserRequest(propertyReqKey)
      .catch(() => console.log('Creating property pharma request...'));

    if (existingPropertyReq)
      throw new Error('Property request already exists');

    // owner should be present in the ledger to get txn processed
    await this.viewUser(ctx, name, aadharId);

    const regReqObj = {
      name,
      aadharId,
      owner: propertyReqKey,
      propertyId,
      price: parseInt(price),
      status: this.status,
    };

    // Create a new instance of request model and add the request asset to the ledger
    const propertyReqObj = Request.createInstance(regReqObj);
    await ctx.requestList.addUserRequest(propertyReqObj);

    return propertyReqObj;
  }


  async viewPropertyRequest(ctx, name, aadharId, propertyId) {
      //check if client is of user
      if (ctx.clientIdentity.getMSPID() !== 'distributorMSP')
      throw new Error('Requested entity is not allowed to perform this action');
      
    const userKey = Request.createKey([propertyId, name, aadharId]);

    // Fetch the property asset from the ledger
    const userObj = await ctx.requestList
      .getUserRequest(userKey)
      .catch(err => { throw new Error('Failed to fetch property request. Request does not exists', err) });

    return userObj;
  }


  async viewProperty(ctx, name, aadharId, propertyId) {
     //check if client is of user
     if (ctx.clientIdentity.getMSPID() !== 'distributorMSP')
     throw new Error('Requested entity is not allowed to perform this action');
     
    const propertyKey = Property.createKey([propertyId, name, aadharId]);

    // Fetch the existing proprty asset for the user
    const propertyObj = await ctx.propertyList
      .getProperty(propertyKey)
      .catch(err => { throw new Error('Failed to fetch property. Property does not exist for the user', err) });

    return propertyObj;
  }


  async updatePropertyStatus(ctx, name, aadharId, propertyId, status) {
    //check if client is of user
    if (ctx.clientIdentity.getMSPID() !== 'distributorMSP')
    throw new Error('Requested entity is not allowed to perform this action');
      
    // Fetch the registered property asset for the user
    const propertyObj = await this.viewProperty(ctx, name, aadharId, propertyId);
    const { owner } = propertyObj;
    const expectedOwner = `"${propertyId}":"${name}":"${aadharId}"`;

    // Validate whether the requested user is the owner of the property
    if (owner !== expectedOwner)
      throw new Error('Access Denied! Requestor is not the owner of the property.');

    // Create a new instance of property model and update the status of the property asset on the ledger
    const updatedPropertyObj = Property.createInstance(Object.assign(propertyObj, { status }));
    await ctx.propertyList.addProperty(updatedPropertyObj);

    return updatedPropertyObj;
  }


  async purchaseProperty(ctx, propertyId, buyerName, buyerAadharId) {
    try {

      //check if client is of user
      if (ctx.clientIdentity.getMSPID() !== 'distributorMSP')
      throw new Error('Requested entity is not allowed to perform this action');
              
  
      //formualte key
      const propertyKey = Property.createKey([propertyId]);

      //Fetch existing details
      const fetchedBuyerObj = await this.viewUser(ctx, buyerName, buyerAadharId);
      const { upgradCoins: buyerBalance } = fetchedBuyerObj;
      const propertyObj = await ctx.propertyList
        .getPropertyByPartialCompositeKey(propertyKey)
        .catch(err => { throw new Error('Requested property does not exists', err) });

      const { status, price: propertyPrice, name: sellerName, aadharId: sellerAadharId } = propertyObj;
      const sellerObj = await this.viewUser(ctx, sellerName, sellerAadharId);
      const { upgradCoins: sellerBalance } = sellerObj;

      // if on sale  or not
      if (status != 'onSale')
        throw new Error('Property is not currently for sale');

      // check balance
      if (buyerBalance < propertyPrice)
        throw new Error('Not enough balance');

      //Update balances of distributor and update them in the ledger
      const updatedBuyerObj = Object.assign({}, fetchedBuyerObj, { upgradCoins: (buyerBalance - propertyPrice) });
      const updatedSellerObj = Object.assign({}, sellerObj, { upgradCoins: sellerBalance + propertyPrice });
      const buyerInstance = User.createInstance(updatedBuyerObj);
      const sellerInstance = User.createInstance(updatedSellerObj);
      await ctx.userList.addUser(buyerInstance);
      await ctx.userList.addUser(sellerInstance);

      //Update the property 
      const updatedPropertyKey = Property.createKey([propertyId, buyerName, buyerAadharId]);
      const updatedProperty =  { key: updatedPropertyKey, name: buyerName, aadharId: buyerAadharId, owner: updatedPropertyKey, status: 'registered' };
      const updatedPropertyObj = Object.assign({},propertyObj,updatedProperty);

      // Delete and update old and new ones
      const deletePropertyInstance = Property.createInstance(propertyObj);
      const updatePropertyInstance = Property.createInstance(updatedPropertyObj);
      await ctx.propertyList.deleteProperty(deletePropertyInstance);
      await ctx.propertyList.addProperty(updatePropertyInstance);

      return updatePropertyInstance;
    } catch (err) {
      console.log('Property purchase failed');
      throw err;
    }
  }
}

module.exports = UserContract;