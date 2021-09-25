'use strict';

const Organization = require('./lib/models/organization');
const OrganizationList = require('./lib/lists/organization-list');
const Drug = require('./lib/models/drug');
const DrugList = require('./lib/lists/drug-list');
const Po = require('./lib/models/po');
const PoList = require('./lib/lists/po-list');
const Shipment = require('./lib/models/shipment');
const ShipmentList = require('./lib/lists/shipment-list');
//s
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
    
    async check(ctx){
        return "samplei";
      }
    //Company registration
    async registerCompany(ctx, companyCRN, companyName, location, organisationRole){
        
        //TODO validation role


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
      
    //Drug methods
    async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN){
           
        //TODO validate , check invoker role is manufacturer
        //
        //key - crn and name
        const drugKey = Drug.createKey([drugName,serialNo]); 
        const existingDrug = await ctx.drugList
        .getDrug(drugKey)
        .catch(() => console.log('Creating new drug as old record isnt present'));

        //TODO shipemnt
        if (existingDrug)
        throw new Error('Failed to create request for this drug as this drug`s request already exists');
  

        const organizationKey = Organization.createKey([companyCRN]); 
        const existingOrg = await ctx.organizationList
        .getOrganizationByPartialCompositeKey(organizationKey)
        .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });

        const manufacturer = existingOrg.key;
        console.log('Org key fetched is ',manufacturer);

        const shipment = [];
        //at start owner, manufacturer will be same    
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

    async createPo(ctx,buyerCRN, sellerCRN, drugName, quantity){
       //key - buyer andcrn and drug name
       const poKey = Po.createKey([buyerCRN, drugName]); 
       console.log('p key formulated is ',poKey);
       const existingPo = await ctx.poList
       .getPo(poKey)
       .catch(() => console.log('Creating new Po as old record isnt present'));

       if (existingPo)
       throw new Error('Failed to create request for this po as this po`s request already exist');
 
       console.log('existing po is ',existingPo);

       //Fetch buyer key
       const buyerPartialKey = Organization.createKey([buyerCRN]);
       console.log('1');
       const buyerObj = await ctx.organizationList
       .getOrganizationByPartialCompositeKey(buyerPartialKey)
       .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
       console.log('2');
       const buyer = buyerObj.key;
       
       //Fetch seller key
       const sellerPartialKey = Organization.createKey([sellerCRN]);
       console.log('3');
       const sellerObj = await ctx.organizationList
       .getOrganizationByPartialCompositeKey(sellerPartialKey)
       .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
       const seller = sellerObj.key;

       //TODO have buyer and buyer crn too?
       const poObj = { 
        buyerCRN, buyer, seller, drugName, quantity
       };
       console.log('4',poObj);
       const poInstance = Po.createInstance(poObj);
       console.log('5',poInstance);
       await ctx.poList.addPo(poInstance);
       console.log('6');

       return poInstance;
    }

    async viewPo(ctx, buyerCRN, drugName) {
        const poKey = Po.createKey([buyerCRN, drugName]); 
        const existingPo = await ctx.poList
        .getPo(poKey)
        .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
        return existingPo;
    }

    async createShipment(ctx,buyerCRN, drugName, listOfAssets, transporterCRN){
        //key - crn and name
        const shipmentKey = Shipment.createKey([buyerCRN, drugName]); 
        const existingShipment = await ctx.shipmentList
        .getShipment(shipmentKey)
        .catch(() => console.log('Creating new shipment as old record isnt present'));
 
        const shipmentCreator = ctx.clientIdentity.getMSPID();
        //TODO shipemnt
        if (existingShipment)
        throw new Error('Failed to create request for this shipment as this shipment`s request already exist');
        
        const status = "in-transit";
        const assets = listOfAssets.split(",");
        const creator = await this.getCompanyKeyFromCrn(ctx,buyerCRN);
        const transporter = await this.getCompanyKeyFromCrn(ctx,transporterCRN);
        //TODO have buyer, seller composite keys? not crns?
        const shipmentObj = { 
            creator, assets , transporter, status, buyerCRN, drugName
        };
 
        const shipmentInstance = Shipment.createInstance(shipmentObj);
        await ctx.shipmentList.addShipment(shipmentInstance);
        return shipmentInstance;
     }

     async updateShipment(ctx,buyerCRN, drugName, transporterCRN){

        //validation for transporter invocation
        const shipmentKey = Shipment.createKey([buyerCRN, drugName]); 
        var existingShipment = await ctx.shipmentList
        .getShipment(shipmentKey)
        .catch(err => { throw new Error('Failed to fetch shipment. Shipment doesnt exist', err) });

        console.log("existingShipment is ",existingShipment);
        //update status
        //update shipment objs in drug
        //update owner of each drug

        const buyerKey = await this.getCompanyKeyFromCrn(ctx,buyerCRN);
        //for each drug in shipment.assets ,  change owner and add this shipment there
        existingShipment.status = "delivered";
        console.log('existing shipment is ',existingShipment.assets);
        const drugAssets = existingShipment.assets;
        
        let i=0;
        let drugLength = drugAssets.length;
        while(i<drugLength){
            const drug = await drugAssets[i];
            console.log("Updating asset ",drug);
            await this.updateShipmentInDrug(ctx,shipmentKey, drug, buyerKey);
            console.log('increasing i')
            i++;
        }
        // drugAssets.forEach(async (element) => {
            
        // });

        const shipmentInstance = Shipment.createInstance(existingShipment);
        await ctx.shipmentList.addShipment(shipmentInstance);
        return shipmentInstance;
     }
 
     async viewShipment(ctx, buyerCRN, drugName) {
         const shipmentKey = Shipment.createKey([buyerCRN, drugName]); 
         const existingShipment = await ctx.shipmentList
         .getShipment(shipmentKey)
         .catch(err => { throw new Error('Failed to fetch shipment. Shipment doesnt exist', err) });
         return existingShipment;
     }

     async retailDrug(drugName, serialNo, retailerCRN, customerAadhar){
        //validation invoker/retailer should be of role retailer
        const drugKey = Drug.createKey([drugName, serialNo]); 
        const existingDrug = await ctx.drugList
        .getDrug(drugKey)
        .catch(err => {throw new Error('Faild to fetch. Drug doesnt exist')});
        
        existingDrug.owner = customerAadhar;

        const drugInstance = Drug.createInstance(existingDrug);
        await ctx.drugList.addDrug(drugInstance);
        return drugInstance;

     }

     //util
     async getCompanyKeyFromCrn(ctx,companyCrn){
             //Fetch seller key
       const partialKey = Organization.createKey([companyCrn]);
       const companyObj = await ctx.organizationList
       .getOrganizationByPartialCompositeKey(partialKey)
       .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
       const seller = companyObj.key;
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
   
    
}


module.exports = pharmaContract;
