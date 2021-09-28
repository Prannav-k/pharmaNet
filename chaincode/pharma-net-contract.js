'use strict';

const Organization = require('./lib/models/organization');
const OrganizationList = require('./lib/lists/organization-list');
const Drug = require('./lib/models/drug');
const DrugList = require('./lib/lists/drug-list');
const Po = require('./lib/models/po');
const PoList = require('./lib/lists/po-list');
const Shipment = require('./lib/models/shipment');
const ShipmentList = require('./lib/lists/shipment-list');
const { Contract, Context } = require('fabric-contract-api');

class PharmaNetContext extends Context{
    constructor(){
        super();
        this.organizationList = new OrganizationList(this);
        this.drugList = new DrugList(this);
        this.poList  = new PoList(this);
        this.shipmentList = new ShipmentList(this);
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
    

    //Company registration
    async registerCompany(ctx, companyCRN, companyName, location, organisationRole){
        
        //Validation role
        if (ctx.clientIdentity.getMSPID() === 'consumerMSP')
        throw new Error('Requestor is not allowed to perform this action');

        //key - crn and name
        const organizationKey = Organization.createKey([companyCRN,companyName]); 
        const existingOrg = await ctx.organizationList
        .getOrganization(organizationKey)
        .catch(() => console.log('Creating new org as old record isnt present'));

        if (existingOrg)
        throw new Error('Failed to create request for this company as this company`s request already exists');
  
        //TODO hierarchy level
        const organizationObj = { 
            companyCRN,
             companyName,
             location,
             organisationRole,
             hierarchyKey: this.getEntityHirarchy(organisationRole),
        };

        const orgInstance = Organization.createInstance(organizationObj);
        await ctx.organizationList.addOrganization(orgInstance);
        return orgInstance;
    }

      
    //Drug methods
    async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN){
           
        //Validate , check invoker role is manufacturer
        if (ctx.clientIdentity.getMSPID() !== 'manufacturerMSP')
        throw new Error('Requestor is not allowed to perform this action');
       
        //key - crn and name
        const drugKey = Drug.createKey([drugName,serialNo]); 
        const existingDrug = await ctx.drugList
        .getDrug(drugKey)
        .catch(() => console.log('Creating new drug as old record isnt present'));

        if (existingDrug)
        throw new Error('Failed to create request for this drug as this drug`s request already exists');
        
        const organizationKey = Organization.createKey([companyCRN]); 
        const existingOrg = await ctx.organizationList
        .getOrganizationByPartialCompositeKey(organizationKey)
        .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
        const manufacturer = existingOrg.key;
        const shipment = [];
        const owner = manufacturer;
        const drugObj = { 
            drugName,
            serialNo,
            mfgDate,
            expDate,
            owner,
            manufacturer,
            shipment
        };

        const drugInstance = Drug.createInstance(drugObj);
        await ctx.drugList.addDrug(drugInstance);
        return drugInstance;
    }
    
    async viewDrugCurrentState (ctx, drugName, serialNo){
        const drugKey = Drug.createKey([drugName, serialNo]); 
        console.log('constructed drug key is ',drugKey);
        const existingDrug = await ctx.drugList
        .getDrug(drugKey)
        .catch(err => {throw new Error('Faild to fetch. Drug doesnt exist')});
        return existingDrug;
    }

    async viewDrugHistory (ctx, drugName, serialNo){
        const drugKey = Drug.createKey([drugName, serialNo]); 
        console.log('constructed drug key is ',drugKey);
        const existingDrug = await ctx.drugList
        .getDrug(drugKey)
        .catch(err => {throw new Error('Faild to fetch. Drug doesnt exist')});
        
        return await ctx.drugList.getDrugHistory(drugKey);
    }

    //PO methods
    async createPo(ctx,buyerCRN, sellerCRN, drugName, quantity){
       
       if (!['distributorMSP', 'retailerMSP'].includes(ctx.clientIdentity.getMSPID()))
        throw new Error('Requestor is not allowed to perform this action');
       
       //key - buyer andcrn and drug name
       const poKey = Po.createKey([buyerCRN, drugName]); 
       const existingPo = await ctx.poList
       .getPo(poKey)
       .catch(() => console.log('Creating new Po as old record isnt present'));

       if (existingPo)
       throw new Error('Failed to create request for this po as this po`s request already exist');
 
       console.log('existing po is ',existingPo);

       //Fetch buyer obj, key
       const buyerPartialKey = Organization.createKey([buyerCRN]);
       const buyerObj = await ctx.organizationList
       .getOrganizationByPartialCompositeKey(buyerPartialKey)
       .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
       const buyer = buyerObj.key;
       const buyerHierarchy = buyerObj.hierarchyKey;

       //Fetch seller obj , key
       const sellerPartialKey = Organization.createKey([sellerCRN]);
       console.log('3');
       const sellerObj = await ctx.organizationList
       .getOrganizationByPartialCompositeKey(sellerPartialKey)
       .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
       const seller = sellerObj.key;
       const sellerHierarchy = sellerObj.hierarchyKey;


       //Check hierarchy
       //distributor(0) only from manufacturer(0) 
       if(buyerHierarchy == 1)
        if(sellerHierarchy !== 0)
            throw new Error('Distributor can only buy from Seller');
       
       //retailer (2) only from distributor(1) 
       if(buyerHierarchy == 2)
       if(sellerHierarchy !== 1)
           throw new Error('Retailer can only buy from Distributor');
      
       const poObj = { 
        buyerCRN, buyer, seller, drugName, quantity
       };
       const poInstance = Po.createInstance(poObj);
       await ctx.poList.addPo(poInstance);
       return poInstance;
    }


    async createShipment(ctx,buyerCRN, drugName, listOfAssets, transporterCRN){
        //org Validation
        if (!['manufacturerMSP', 'distributorMSP'].includes(ctx.clientIdentity.getMSPID()))
        throw new Error('Requestor is not allowed to perform this action');
  
        //key - crn and name
        const shipmentKey = Shipment.createKey([buyerCRN, drugName]); 
        const existingShipment = await ctx.shipmentList
        .getShipment(shipmentKey)
        .catch(() => console.log('Creating new shipment as old record isnt present'));
 
        if (existingShipment)
        throw new Error('Failed to create request for this shipment as this shipment`s request already exist');
        
        //fetch purchase order
        const poKey = Po.createKey([buyerCRN, drugName]); 
        const poObj = await ctx.poList
        .getPo(poKey)
        .catch(err => { throw new Error('Failed to fetch PO. PO for this shipment doesnt exist', err) });
        const poQuantity = parseInt(poObj.quantity);

        const assets = listOfAssets.split(",");

        //Quantity validation with PO
        if (parseInt(poQuantity) !== assets.length)
        throw new Error('Validation Failed, PO quantity does not match with the shipment quantity');
  

        const status = "in-transit";
        const creator = await this.getCompanyKeyFromCrn(ctx,buyerCRN);
        const transporter = await this.getCompanyKeyFromCrn(ctx,transporterCRN);
        const shipmentObj = { 
            creator, assets , transporter, status, buyerCRN, drugName
        };
 
        const shipmentInstance = Shipment.createInstance(shipmentObj);
        await ctx.shipmentList.addShipment(shipmentInstance);
        return shipmentInstance;
     }

     async updateShipment(ctx,buyerCRN, drugName, transporterCRN){

        const shipmentKey = Shipment.createKey([buyerCRN, drugName]); 
        var existingShipment = await ctx.shipmentList
        .getShipment(shipmentKey)
        .catch(err => { throw new Error('Failed to fetch shipment. Shipment doesnt exist', err) });

        //validation for transporter invocation
        const existingTransporter = existingShipment.transporter;
        const existingTransporterCrn = existingTransporter.split(':')[0];
        console.log('transporter from existingShipment is ',existingTransporter,existingTransporterCrn);
        if(existingTransporterCrn !== transporterCRN)
            throw new Error('Only transporter is allowed to perform this action')

        console.log("existingShipment is ",existingShipment);
        const buyerKey = await this.getCompanyKeyFromCrn(ctx,buyerCRN);
        //for each drug in shipment.assets ,  change owner and add this shipment there
        existingShipment.status = "delivered";
        console.log('existing shipment is ',existingShipment.assets);
        const drugAssets = existingShipment.assets;
        
        //Iterate over shipment assets and update them
        let i=0;
        let drugLength = drugAssets.length;
        while(i<drugLength){
            const drug = await drugAssets[i];
            console.log("Updating asset ",drug);
            await this.updateShipmentInDrug(ctx,shipmentKey, drug, buyerKey);
            i++;
        }

        const shipmentInstance = Shipment.createInstance(existingShipment);
        await ctx.shipmentList.addShipment(shipmentInstance);
        return shipmentInstance;
     }


     async retailDrug(ctx,drugName, serialNo, retailerCRN, customerAadhar){
        if (ctx.clientIdentity.getMSPID() !== 'retailerMSP')
        throw new Error('Failed! Only Retailer is allowed to perform this action');

        const drugKey = Drug.createKey([drugName, serialNo]); 
        const existingDrug = await ctx.drugList
        .getDrug(drugKey)
        .catch(err => {throw new Error('Faild to fetch. Drug doesnt exist')});
        
        if(existingDrug.owner != retailerCRN){
            throw new Error('Retailer provided is not the owner of the drug')
        }

        existingDrug.owner = customerAadhar;

        const drugInstance = Drug.createInstance(existingDrug);
        await ctx.drugList.addDrug(drugInstance);
        return drugInstance;

     }

     //util methods
     async getCompanyKeyFromCrn(ctx,companyCrn){
             //Fetch seller key
       const partialKey = Organization.createKey([companyCrn]);
       const companyObj = await ctx.organizationList
       .getOrganizationByPartialCompositeKey(partialKey)
       .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
       return companyObj.key;
     }

     async updateShipmentInDrug(ctx,shipmentKey, assetId, buyer){
        const drugKey = assetId; 
        console.log('Drug/asset key is ',drugKey)
        const existingDrug = await ctx.drugList
        .getDrug(drugKey)
        .catch(err => {throw new Error('Faild to fetch. Drug doesnt exist')});
        
        const shipment = existingDrug.shipment;
        
        console.log('existing shipment is ',shipment);
        shipment.push(shipmentKey);
        console.log("updated shipment is ",shipment);

        existingDrug.shipment = shipment;
        existingDrug.owner = buyer;
    
        console.log("Updated drug ",existingDrug);
        const drugInstance = Drug.createInstance(existingDrug);
        await ctx.drugList.addDrug(drugInstance);
        return drugInstance;
    }

    //debug method
    async viewCompany(ctx, companyCRN, companyName) {
        const organizationKey = Organization.createKey([companyCRN,companyName]); 
        const existingOrg = await ctx.organizationList
        .getOrganization(organizationKey)
        .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
        return existingOrg;
      }

    //debug method
    async viewCompanyPartial(ctx, companyCRN) {
        const organizationKey = Organization.createKey([companyCRN]); 
        const existingOrg = await ctx.organizationList
        .getOrganizationByPartialCompositeKey(organizationKey)
        .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
        return existingOrg;
      }

    async viewPo(ctx, buyerCRN, drugName) {
        const poKey = Po.createKey([buyerCRN, drugName]); 
        const existingPo = await ctx.poList
        .getPo(poKey)
        .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
        return existingPo;
    }      

    async viewShipment(ctx, buyerCRN, drugName) {
        const shipmentKey = Shipment.createKey([buyerCRN, drugName]); 
        const existingShipment = await ctx.shipmentList
        .getShipment(shipmentKey)
        .catch(err => { throw new Error('Failed to fetch shipment. Shipment doesnt exist', err) });
        return existingShipment;
    }


      // Get the organisation's hirarchy
    getEntityHirarchy = orgRole => {
    switch (orgRole) {
      case 'manufacturer':
        return 1;
      case 'distributor':
        return 2;
      case 'retailer':
        return 3;
      case 'transporter':
        return null;
      default:
        throw new Error(`Please mention correct org role - ${orgRole} to fetch entity's hirarchy`);
    }
  }
  
}


module.exports = pharmaContract;
