'use strict';

const Organization = require('./lib/models/organization');
const OrganizationList = require('./lib/lists/organization-list');
const Drug = require('./lib/models/drug');
const DrugList = require('./lib/lists/drug-list');
const Po = require('./lib/models/po');
const PoList = require('./lib/lists/po-list');

const { Contract, Context } = require('fabric-contract-api');

class PharmaNetContext extends Context{
    constructor(){
        super();
        this.organizationList = new OrganizationList(this);
        this.drugList = new DrugList(this);
        this.poList  = new PoList(this);
    }
}

class pharmaContract extends Contract {
    constructor() {
        //TODO , name of contract?
        super('org.phrama-network.phramanet.pharmaContract');
    }

    createContext() {
        return new PharmaNetContext();
    }

    async instantiate(ctx) {
        console.log('pharma-net Smart Contract Instantiated');
    }
    
    async check(ctx){
        return "samplei";
      }
    //Company registration
    async registerCompany(ctx, companyCRN, companyName, location, organisationRole){
        //TODO
        //key - crn and name
        const organizationKey = Organization.createKey([companyCRN,companyName]); 
        const existingOrg = await ctx.organizationList
        .getOrganization(organizationKey)
        .catch(() => console.log('Creating new org as old record isnt present'));

        if (existingOrg)
        throw new Error('Failed to create request for this company as this company`s request already exists');
  
        //TODO hierarchy level
        var hierarchy = 1;
        const organizationObj = { 
            companyCRN, companyName, location, organisationRole, hierarchy
        };

        const orgInstance = Organization.createInstance(organizationObj);
        await ctx.organizationList.addOrganization(orgInstance);
        return orgInstance;
    }

    // //debug method
    async viewCompany(ctx, companyCRN, companyName) {
        const organizationKey = Organization.createKey([companyCRN,companyName]); 
        const existingOrg = await ctx.organizationList
        .getOrganization(organizationKey)
        .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
        return existingOrg;
      }

      
    //Drug methods
    async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN){
           
        //key - crn and name
        const drugKey = Drug.createKey([drugName,serialNo]); 
        const existingDrug = await ctx.drugList
        .getDrug(drugKey)
        .catch(() => console.log('Creating new drug as old record isnt present'));

        //TODO shipemnt
        if (existingDrug)
        throw new Error('Failed to create request for this drug as this drug`s request already exists');
  
        const owner = ctx.clientIdentity.getMSPID();
        const organizationObj = { 
            drugName, serialNo, mfgDate, expDate, companyCRN, owner
        };

        const orgInstance = Drug.createInstance(organizationObj);
        await ctx.drugList.addDrug(orgInstance);
        return orgInstance;
    }
    
    async viewDrugCurrentState (ctx, drugName, serialNo){
        const drugKey = Drug.createKey([drugName, serialNo]); 
        const existingDrug = await ctx.drugList
        .getDrug(drugKey)
        .catch(err => {throw new Error('Faild to fetch. Drug doesnt exist')});
        return existingDrug;
    }

    async createPo(ctx,buyerCRN, sellerCRN, drugName, quantity){
       //key - crn and name
       const poKey = Po.createKey([buyerCRN, drugName]); 
       const existingPo = await ctx.poList
       .getPo(poKey)
       .catch(() => console.log('Creating new Po as old record isnt present'));

       //TODO shipemnt
       if (existingPo)
       throw new Error('Failed to create request for this po as this po`s request already exist');
 
       //TODO have buyer, seller composite keys? not crns?
       const poObj = { 
        buyerCRN, sellerCRN, drugName, quantity
       };

       const poInstance = Po.createInstance(poObj);
       await ctx.poList.addPo(poInstance);
       return poInstance;
    }

    async viewPo(ctx, buyerCRN, drugName) {
        const poKey = Po.createKey([buyerCRN, drugName]); 
        const existingPo = await ctx.poList
        .getPo(poKey)
        .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
        return existingPo;
      }
    
}


module.exports = pharmaContract;
