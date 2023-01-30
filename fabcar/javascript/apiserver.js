'use strict'
let express = require('express');
let bodyParser = require('body-parser');
const crypto = require('crypto');
const QR = require('qrcode');
let app = express();
app.use(bodyParser.json());
const { Gateway,Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});


app.get('/api/data/:master', async function (req, res) {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');
        let masterData = '';
        // Evaluate the specified transaction.
        if(req.params.master === 'product') {
            masterData = 'GetProductMasterData';
        } else if (req.params.master === 'location') {
            masterData = 'GetLocationMasterData';
        } else if (req.params.master === 'bod'){
            masterData = 'GetBodLaneData';
        } else if (req.params.master === 'route'){
            masterData = 'GetRoutesMasterData';
        } else if (req.params.master === 'transaction'){
            masterData = 'GetTransactionalData';
        }
        console.group(masterData);
        const result = await contract.evaluateTransaction(masterData);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.status(200).json({response: result.toString()});
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        // process.exit(1);
    }
});




app.get('/api/history/:batch_id', async function (req, res) {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');
        // Evaluate the specified transaction.
        const result = await contract.evaluateTransaction('GetRecordHistory', req.params.batch_id);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.status(200).json({response: result.toString()});
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        // process.exit(1);
    }
});




app.post('/api/updatelocation/', async function (req, res) {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');
        // Submit the specified transaction.
        const location = req.body;
        await contract.submitTransaction('UpdateCurrentLocation', JSON.stringify(location));
        console.log('Current Location Updated Successfully');
        res.send('Transaction has been submitted');
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to update current location: ${error}`);
        // process.exit(1);
    }
});



app.post('/api/updateactualpath/', async function (req, res) {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');
        // Submit the specified transaction.
        const actualPath = req.body;
        await contract.submitTransaction('UpdateActualPath', JSON.stringify(actualPath));
        console.log('Actual Path Updated Successfully');
        res.send('Transaction has been submitted');
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to update actual path: ${error}`);
        // process.exit(1);
    }
});





app.post('/api/updateroute/', async function (req, res) {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');
        // Submit the specified transaction.
        const location = req.body;
        await contract.submitTransaction('UpdateRoute', JSON.stringify(location));
        console.log('Route has been updated successfully');
        res.send('Transaction has been submitted');
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to update route: ${error}`);
        // process.exit(1);
    }
});




app.get('/api/batchdetails/:batch_id', async function (req, res) {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');
        // Evaluate the specified transaction.
        const result = await contract.evaluateTransaction('GetBatchDetail', req.params.batch_id);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.status(200).json({response: result.toString()});
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        // process.exit(1);
    }
});

app.post('/api/addBatch/', async function (req, res) {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);


        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }


        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');


        const contract = network.getContract('fabcar');
        //Generate UUID
        const uuid = crypto.randomUUID({disableEntropyCache : true});
        console.log('#####  UUID : ' + uuid + '  ######');
        //QR Code
        // Print the QR code to terminal
        QR.toString(uuid,{type:'terminal'},
            function (err, QRcode) {

                if(err) {return console.log('error occurred');}

            // Printing the generated code
            // console.log("TERMINAL QR CODE : " + QRcode)
            });

        // Converting the data into base64
        QR.toDataURL(uuid, function (err, code) {
            if(err) {return console.log('error occurred');}

            // Printing the code
            console.log('Base64 QR Code : '+ code);
        });

        const obj = {
            batchId: uuid,
            route:req.body.route,
        };
        // Submit the specified transaction.
        const result = await contract.submitTransaction('createBatch', JSON.stringify(obj));
        console.log(`New Batch Created Successfully with Batch ID : ${uuid}`);
        // console.log('Data : ' + JSON.stringify(obj))
        console.log(result);
        res.send('Transaction has been submitted');
        // Disconnect from the gateway.
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to create a new batch : ${error}`);
        // process.exit(1);
    }
});

//     app.get('/api/drr/:pid/:did', async function (req, res) {
//         try {
//     const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
//             const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
//     // Create a new file system based wallet for managing identities.
//             const walletPath = path.join(process.cwd(), 'wallet');
//             const wallet = await Wallets.newFileSystemWallet(walletPath);
//             console.log(`Wallet path: ${walletPath}`);

//             // Check to see if we've already enrolled the user.
//             const identity = await wallet.get('appUser');
//             if (!identity) {
//                 console.log('An identity for the user "appUser" does not exist in the wallet');
//                 console.log('Run the registerUser.js application before retrying');
//                 return;
//             }
//       // Create a new gateway for connecting to our peer node.
//             const gateway = new Gateway();
//             await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

//             // Get the network (channel) our contract is deployed to.
//             const network = await gateway.getNetwork('mychannel');

//             // Get the contract from the network.
//             const contract = network.getContract('fabcar');
//     // Evaluate the specified transaction.
//             // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
//             // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
//             const obj = {
//                 'patientId':req.params.pid,
//                 'doctorId':req.params.did
//             }
//             const result = await contract.evaluateTransaction('DoctorReadRecord', JSON.stringify(obj));
//             console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
//             res.status(200).json({response: result.toString()});
//     } catch (error) {
//             console.error(`Failed to evaluate transaction: ${error}`);
//             res.status(500).json({error: error});
//             process.exit(1);
//         }
//     });


// app.post('/api/grant/', async function (req, res) {
//         try {
//     const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
//             const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
//     // Create a new file system based wallet for managing identities.
//             const walletPath = path.join(process.cwd(), 'wallet');
//             const wallet = await Wallets.newFileSystemWallet(walletPath);
//             console.log(`Wallet path: ${walletPath}`);

//             // Check to see if we've already enrolled the user.
//             const identity = await wallet.get('appUser');
//             if (!identity) {
//                 console.log('An identity for the user "appUser" does not exist in the wallet');
//                 console.log('Run the registerUser.js application before retrying');
//                 return;
//             }
//       // Create a new gateway for connecting to our peer node.
//             const gateway = new Gateway();
//             await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

//             // Get the network (channel) our contract is deployed to.
//             const network = await gateway.getNetwork('mychannel');

//             // Get the contract from the network.
//             const contract = network.getContract('fabcar');
//     // Submit the specified transaction.
//             // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
//             // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
//             const obj = {
//                     'patientId': "Patient1",
//                     'doctorId': "Doc666",
//                 }
//             const data = req.body
//             const dd = JSON.stringify(data)
//             console.log("REQ BODY : " + req.body)
//             console.log("DATA : " + data)
//             console.log("stringify dATA : " + JSON.stringify(data))
//             console.log("OBJ dATA : " + JSON.stringify(obj))
//             const result = await contract.submitTransaction('GrantAccess', JSON.stringify(obj));
//             console.log('Transaction has been submitted');
//             res.send('Transaction has been submitted');
//     // Disconnect from the gateway.
//             await gateway.disconnect();
//     } catch (error) {
//             console.error(`Failed to submit transaction: ${error}`);
//             process.exit(1);
//         }
//     })

//     app.post('/api/revoke/', async function (req, res) {
//         try {
//     const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
//             const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
//     // Create a new file system based wallet for managing identities.
//             const walletPath = path.join(process.cwd(), 'wallet');
//             const wallet = await Wallets.newFileSystemWallet(walletPath);
//             console.log(`Wallet path: ${walletPath}`);

//             // Check to see if we've already enrolled the user.
//             const identity = await wallet.get('appUser');
//             if (!identity) {
//                 console.log('An identity for the user "appUser" does not exist in the wallet');
//                 console.log('Run the registerUser.js application before retrying');
//                 return;
//             }
//       // Create a new gateway for connecting to our peer node.
//             const gateway = new Gateway();
//             await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

//             // Get the network (channel) our contract is deployed to.
//             const network = await gateway.getNetwork('mychannel');

//             // Get the contract from the network.
//             const contract = network.getContract('fabcar');
//     // Submit the specified transaction.
//             // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
//             // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
//             const data = req.body
//             const dd = JSON.stringify(data)
//             console.log("REQ BODY : " + req.body)
//             console.log("DATA : " + data)
//             console.log("stringify dATA : " + JSON.stringify(data))
//             //console.log("OBJ dATA : " + JSON.stringify(obj))
//             const result = await contract.submitTransaction('RevokeAccess', JSON.stringify(data));
//             console.log('Transaction has been submitted');
//             res.send('Transaction has been submitted');
//     // Disconnect from the gateway.
//             await gateway.disconnect();
//     } catch (error) {
//             console.error(`Failed to submit transaction: ${error}`);
//             process.exit(1);
//         }
//     })


app.listen(8080);
