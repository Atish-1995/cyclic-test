'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    //INITIALIZE LEDGER
    async initLedger(ctx) {
        console.info('============= Initializing Ledger ===========');
        const records = [
            {
                batchId: '59ff9e8d-e84d-4c6b-9916-ff14eee4a590',
                currentLocation : 'Manufacturer',
                route : ['Manufacturer', 'Distributor-1', 'Storage-2', 'Retailer-4'],
                soldStatus : false,
                actualPath : ['Manufacturer','','','']
            },
            {
                batchId: 'f6b35f39-6752-4c21-8913-a5b4c747d3ab',
                currentLocation : 'Manufacturer',
                route : ['Manufacturer', 'Distributor-2', 'Storage-1', 'Retailer-3'],
                soldStatus : false,
                actualPath : ['Manufacturer','','','']
            },
            {
                batchId: '6db8c2bc-5cf3-4224-a5e8-e27f51ddeb10',
                currentLocation : 'Manufacturer',
                route : ['Manufacturer', 'Distributor', 'Storage', 'Retailer-4'],
                soldStatus : false,
                actualPath : ['Manufacturer','','','']
            },
        ];



        for (let i = 0; i < records.length; i++) {
            // records[i].docType = 'Batch';
            await ctx.stub.putState(records[i].batchId, Buffer.from(JSON.stringify(records[i])));
            console.info('Added <--> ', records[i]);
        }
        console.info('============= Ledger Initialized ===========');
    }

    //QUERY BATCH
    // async queryBatch(ctx, batchId) {
    //     const batchAsBytes = await ctx.stub.getState(batchId); // get the car from chaincode state
    //     if (!batchAsBytes || batchAsBytes.length === 0) {
    //         throw new Error(`${batchId} does not exist`);
    //     }
    //     console.log(batchAsBytes.toString());
    //     return batchAsBytes.toString();
    // }

    //CREATE NEW BATCH
    async createBatch(ctx, batchObj) {
        console.info('============= Creating Batch ===========');
        const BatchObj = JSON.parse(batchObj);
        const BatchId = BatchObj.batchId;
        const Route = BatchObj.route;

        const batch = {
            batchId : BatchId,
            currentLocation : 'Manufacturer',
            route : Route,
            soldStatus : false,
            actualPath : ['Manufacturer','','','']
        };

        await ctx.stub.putState(BatchId, Buffer.from(JSON.stringify(batch)));
        console.info('============= Batch Created ===========');
    }

    // GET CURRENT STATE OF THE BATCH
    async GetBatchDetail(ctx, batchId) {
        const recordJSON = await ctx.stub.getState(batchId);
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The Record ${batchId} does not exist`);
        }
        return recordJSON.toString();
    }

    //RETURNS WHETHER BATCH WITH GIVEN BATCH ID IS PRESENT IN THE WORLD STATE
    async RecordExists(ctx, batchId) {
        const recordJSON = await ctx.stub.getState(batchId);
        return recordJSON && recordJSON.length > 0;
    }

    //GET BLOCK HISTORY FOR A PARTICULAR BATCH ID
    async GetRecordHistory(ctx, batchId) {
        let resultsIterator = await ctx.stub.getHistoryForKey(batchId);
        let results = await this.GetAllResults(resultsIterator, true);
        return JSON.stringify(results);
    }

    //GET PRODUCT MASTER DATA
    async GetProductMasterData(ctx) {
        const recordJSON = await ctx.stub.getState('productMaster');
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`Product Master Data does not exist`);
        }
        return recordJSON.toString();
    }

    //GET LOCATION MASTER DATA
    async GetLocationMasterData(ctx) {
        const recordJSON = await ctx.stub.getState('locationMaster');
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`Location Master Data does not exist`);
        }
        return recordJSON.toString();
    }

    //GET BOD LANE DATA
    async GetBodLaneData(ctx) {
        const recordJSON = await ctx.stub.getState('bod');
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`BOD Lane Data does not exist`);
        }
        return recordJSON.toString();
    }

    //GET ROUTES MASTER DATA
    async GetRoutesMasterData(ctx) {
        const recordJSON = await ctx.stub.getState('routesMaster');
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`Routes Master Data does not exist`);
        }
        return recordJSON.toString();
    }

    //GET TRANSACTIONAL DATA
    async GetTransactionalData(ctx) {
        const recordJSON = await ctx.stub.getState('transacional');
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`Transactional Data does not exist`);
        }
        return recordJSON.toString();
    }


    //GET ALL BATCHES
    async GetAllResults(iterator, isHistory) {
        let allResults = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));
                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            res = await iterator.next();
        }
        iterator.close();
        return allResults;
    }

    //UPDATE CURRENT LOCATION OF THE PRODUCT
    async UpdateCurrentLocation(ctx, batchObj) {
        const BatchObj = JSON.parse(batchObj);
        const BatchId = BatchObj.batchId;
        const location = BatchObj.currentLocation;

        const recordJSON = await ctx.stub.getState(BatchId);
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The Record ${BatchId} does not exist`);
        }

        const updatedRecord = JSON.parse(recordJSON.toString());
        updatedRecord.currentLocation = location;
        ctx.stub.putState(BatchId, Buffer.from(JSON.stringify(updatedRecord)));
        return JSON.stringify(updatedRecord);
    }

    //UPDATE ROUTE OF THE PRODUCT
    async UpdateRoute(ctx, batchObj) {
        const BatchObj = JSON.parse(batchObj);
        const BatchId = BatchObj.batchId;
        const Route = BatchObj.route;

        const recordJSON = await ctx.stub.getState(BatchId);
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The Record ${BatchId} does not exist`);
        }

        const updatedRecord = JSON.parse(recordJSON.toString());
        updatedRecord.route = Route;
        ctx.stub.putState(BatchId, Buffer.from(JSON.stringify(updatedRecord)));
        return JSON.stringify(updatedRecord);
    }

    //UPDATE ACTUAL PATH OF THE PRODUCT
    async UpdateActualPath(ctx, batchObj) {
        const BatchObj = JSON.parse(batchObj);
        const BatchId = BatchObj.batchId;
        const ActualPath = BatchObj.actualPath;

        const recordJSON = await ctx.stub.getState(BatchId);
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The Record ${BatchId} does not exist`);
        }

        const updatedRecord = JSON.parse(recordJSON.toString());
        updatedRecord.actualPath = ActualPath;
        ctx.stub.putState(BatchId, Buffer.from(JSON.stringify(updatedRecord)));
        return JSON.stringify(updatedRecord);
    }

}

module.exports = FabCar;