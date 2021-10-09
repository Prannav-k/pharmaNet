const express = require('express');
const app = express();
const cors = require('cors');
const port = 4000;
const logger = require('morgan');

// Import all function modules
const addNewUser = require('./utilsO/addNewUser');
const getUserDetails = require('./utilsO/getUserDetails');
const addToWallet = require('./utils/addToWallet');
const updateUserDetails = require('./utilsO/updateUserDetails');
const addNewTest = require('./utilsO/addNewTest');
const updateTestDetails = require("./utilsO/updateTestDetails")
const getTestDetails = require("./utilsO/getTestDetails")
const getPatientTestDetails = require("./utilsO/getPatientTestDetails")
const requestPrice = require("./utilsO/requestPrice")
const getAllPriceRequests = require("./utilsO/getAllPriceRequests")
const getPriceRequest = require("./utilsO/getPriceRequest")
const approvePriceRequest = require("./utilsO/approvePriceRequest")
const getAllTestData = require("./utilsO/getAllTestData")
const getAllUsersData = require("./utilsO/getAllUsersData")
const registerUser = require("./utilsO/registerUser")
const registerAdmin = require("./utils/registerAdmin")
const revokeUser = require("./utilsO/revokeUser")
const getTransactionById = require("./utils/getTransactionById")
const getDrugCurrentState = require("./utils/getDrugCurrentState")
const registerCompany = require("./utils/registerCompany")
const createDrug = require("./utils/createDrug")
const createPo = require("./utils/createPo")
const createShipment = require("./utils/createShipment")
const updateShipment = require("./utils/updateShipment")
const retailDrug = require("./utils/retailDrug")

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Upstac App');
app.use(logger('dev'))

app.get('/', (req, res) => res.send('Hello'));


/**
 * Pharma apis
 */


 app.post('/:org/getDrugCurrentState',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        drugName = req.body.drugName
        drugSerialNumber = req.body.drugSerialNumber
        org = req.params.org
        
        console.log("Getting drug current status");
        // Blockchain Request
        data = await getDrugCurrentState.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, drugName,drugSerialNumber )
            
        // Send Response
        result = {
            success: true,
            data: data
        };

        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

app.post('/:org/registerCompany',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let org 

        let companyCRN
        let companyName
        let location
        let organisationRole
        var result

        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        org = req.params.org

        companyCRN = req.body.companyCRN
        companyName = req.body.companyName
        location = req.body.location,
        organisationRole = req.body.organisationRole

        console.log("Registering org");
        // Blockchain Request
        data = await registerCompany.execute(org, fabricUserName, channelName, chainCodeName, smartContractName,
            companyCRN, companyName, location, organisationRole
            )
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }
});

app.post('/:org/createDrug',async (req, res) => {
    try {

        // Reference
        let fabricUserName 
        let channelName 
        let chainCodeName 
        let smartContractName
        let org 

        var result
        let data

        let drugName
        let drugSerialNumber
        let mfgDate
        let expDate
        let manufacturer
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        org = req.params.org

        drugName = req.body.drugName
        drugSerialNumber = req.body.drugSerialNumber
        mfgDate = req.body.mfgDate
        expDate = req.body.expDate
        manufacturer = req.body.manufacturer
        //shipment = req.body.shipment
        
        console.log("Getting drug current status");
        // Blockchain Request
        data = await createDrug.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, 
            drugName,
            drugSerialNumber,
            mfgDate,
            expDate,
            manufacturer
             )
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});


app.post('/:org/createPo',async (req, res) => {
    try {

        // Reference
        let fabricUserName 
        let channelName 
        let chainCodeName 
        let smartContractName
        let org 

        var result
        let data
      
        let buyerCRN
        let sellerCRN
        let drugName
        let quantity

        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        org = req.params.org

        buyerCRN = req.body.buyerCRN
        sellerCRN = req.body.sellerCRN
        drugName = req.body.drugName
        quantity =  req.body.quantity
        
        console.log("Getting drug current status");
        // Blockchain Request
        data = await createPo.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, buyerCRN, sellerCRN, drugName, quantity)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

app.post('/:org/createShipment',async (req, res) => {
    try {

        // Reference
        let fabricUserName 
        let channelName 
        let chainCodeName 
        let smartContractName
        let org 

        var result
        let data
      
        let buyerCRN
        let drugName
        let listOfAssets
        let transporterCRN

        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        org = req.params.org

        buyerCRN = req.body.buyerCRN
        drugName = req.body.drugName
        listOfAssets =  req.body.listOfAssets
        transporterCRN = req.body.transporterCRN
        
        console.log("Creating shipment");
        // Blockchain Request
        data = await createShipment.execute(org, fabricUserName, channelName, chainCodeName, smartContractName,buyerCRN, drugName, listOfAssets, transporterCRN)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

app.put('/:org/updateShipment',async (req, res) => {
    try {

        // Reference
        let fabricUserName 
        let channelName 
        let chainCodeName 
        let smartContractName
        let org 

        var result
        let data
      
        let buyerCRN
        let drugName
        let transporterCRN

        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        org = req.params.org

        buyerCRN = req.body.buyerCRN
        drugName = req.body.drugName
        transporterCRN = req.body.transporterCRN
        
        console.log("Updating shipment");
        // Blockchain Request
        data = await updateShipment.execute(org, fabricUserName, channelName, chainCodeName, smartContractName,buyerCRN, drugName, transporterCRN)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

app.put('/:org/retailDrug',async (req, res) => {
    try {

        // Reference
        let fabricUserName 
        let channelName 
        let chainCodeName 
        let smartContractName
        let org 

        var result
        let data
      
        let drugName
        let serialNo
        let retailerCRN
        let customerAadhar

        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        org = req.params.org

        serialNo = req.body.serialNo
        drugName = req.body.drugName
        retailerCRN = req.body.retailerCRN
        customerAadhar = req.body.customerAadhar

        console.log("Retailing drug");
        // Blockchain Request
        data = await retailDrug.execute(org, fabricUserName, channelName, chainCodeName, smartContractName,drugName, serialNo, retailerCRN, customerAadhar)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

app.post('/:org/addToWallet', (req, res) => {

    addToWallet.execute(req.params.org, req.body.certificatePath, req.body.privateKeyPath, req.body.fabricUserName, req.body.mspName).then (() => {      
        const result = {
            status: 'success',
            message: 'User credentials added to wallet'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });

});

app.post('/:org/registerUser', (req, res) => {
    registerUser.execute(req.params.org, req.body.fabricUserName).then (() => {
        const result = {
            status: 'success',
            message: 'User credentials added to wallet'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/:org/registerAdmin', (req, res) => {
    
    registerAdmin.execute(req.params.org).then (() => {
        const result = {
            status: 'success',
            message: 'User credentials added to wallet'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/:org/revokeUser', (req, res) => {
    revokeUser.execute(req.params.org, req.body.fabricUserName).then (() => {
        const result = {
            status: 'success',
            message: 'User credentials revoked from wallet'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});


app.post('/:org/addNewUser',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let role
        let firstName
        let lastName
        let gender
        let dob
        let phone
        let email
        let address
        let pinCode
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        role = req.body.role
        firstName = req.body.firstName
        lastName = req.body.lastName
        gender = req.body.gender
        dob = req.body.dob
        phone = req.body.phone
        email = req.body.email
        address = req.body.address
        pinCode = req.body.pinCode
        org = req.params.org

        // Blockchain Request        
        data = await addNewUser.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, role, firstName, lastName, gender, dob, phone, email, address, pinCode)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

app.post('/:org/getUserDetails',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let phone
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        phone = req.body.phone
        org = req.params.org
       
        // Blockchain Request
        data = await getUserDetails.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, phone)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }
    
});

app.post('/:org/updateUserDetails',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let phone
        let newDetailsPayload
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        phone = req.body.phone
        newDetailsPayload = req.body.newDetailsPayload
        org = req.params.org
       
        // Blockchain Request
        data = await updateUserDetails.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, phone, newDetailsPayload)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }
    
});

app.post('/:org/addNewTest',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let testId
        let phone
        let description
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        phone = req.body.phone
        description = req.body.description    
        org = req.params.org

        // Blockchain Request
        data = await addNewTest.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, testId, phone, description)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});


app.post('/:org/updateTestDetails',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let testId
        let newDetailsPayload
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        newDetailsPayload = req.body.newDetailsPayload
        org = req.params.org
       
        // Blockchain Request
        data = await updateTestDetails.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, testId, newDetailsPayload)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }
    
});

app.post('/:org/getTestDetails',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let testId
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        org = req.params.org
       
        // Blockchain Request
        data = await getTestDetails.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, testId)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }
    
});


app.post('/:org/getPatientTestDetails',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let phone
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        phone = req.body.phone
        org = req.params.org
       
        // Blockchain Request
        data = await getPatientTestDetails.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, phone)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }
    
});

app.post('/:org/requestPrice',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let testId
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        org = req.params.org
        
        // Blockchain Request
        data = await requestPrice.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, testId)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

app.post('/:org/getAllPriceRequests',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        org = req.params.org
        
        // Blockchain Request
        data = await getAllPriceRequests.execute(org, fabricUserName, channelName, chainCodeName, smartContractName)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

app.post('/:org/getPriceRequest',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let testId
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        org = req.params.org
        
        // Blockchain Request
        data = await getPriceRequest.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, testId)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

app.post('/:org/approvePriceRequest',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        let testId
        let price
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        testId = req.body.testId
        price = req.body.price
        org = req.params.org

        // Blockchain Request
        data = await approvePriceRequest.execute(org, fabricUserName, channelName, chainCodeName, smartContractName, testId, price)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

app.post('/:org/getAllUsersData',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        org = req.params.org
        
        // Blockchain Request
        data = await getAllUsersData.execute(org, fabricUserName, channelName, chainCodeName, smartContractName)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

app.post('/:org/getAllTestData',async (req, res) => {

    try {

        // Reference
        let fabricUserName 
        let channelName
        let chainCodeName 
        let smartContractName
        var result
        let data
        let org
        
        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        chainCodeName = req.body.chainCodeName
        smartContractName = req.body.smartContractName
        org = req.params.org
        
        // Blockchain Request
        data = await getAllTestData.execute(org, fabricUserName, channelName, chainCodeName, smartContractName)
            
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }

});

// Query Get Transaction by Transaction ID
app.post('/:org/getTransactionById', async function(req, res) {
    
    try {

        // Reference
        var result
        let data
        let txId
        let channelName
        let chainCodeName

        // Parse Request
        fabricUserName = req.body.fabricUserName
        channelName = req.body.channelName
        smartContractName = req.body.smartContractName
        org = req.params.org
        txId = req.body.txId;
    
        // Get Data
        data = await getTransactionById.execute(org, fabricUserName, channelName, txId);
        
        // Send Response
        result = {
            success: true,
            data: data
        };
        res.json(result);
        
    } catch (error) {
        result = {
            success: false,
            error: error.message
        };
        res.status(500).send(result);
    }
    
   
});

app.listen(port, () => console.log(`Distributed App listening on port ${port}!`));
