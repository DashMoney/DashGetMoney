//THIS IS THE DGM - REGISTER DATA CONTRACT

const Dash = require('dash');

const clientOpts = {
  network: 'testnet',
  
  wallet: {
    mnemonic: '12 word', // <- CHECK
    
    unsafeOptions: {
      skipSynchronizationBeforeHeight: 853000, //<- CHANGE*********
      
    },
  },
};

const client = new Dash.Client(clientOpts);

const registerContract = async () => {
  const { platform } = client;
  const identity = await platform.identities.get(
    'identity put here'// <- CHECK
  );


  const contractDocuments = {
    dgmaddress: {
      type: 'object',
      indices: [
        {
          name: 'ownerId',
          properties: [{ $ownerId: 'asc' }],
          unique: false,
        }
      ],
      properties: {
        address: {
          type: 'string',
          minLength: 34,
          maxLength: 34,
        }
      }
      ,required: ['address',"$createdAt", "$updatedAt"]
      ,additionalProperties: false,
    },
    
    dgmmsg: {
      
      type: 'object',
      indices: [
        {//This is Sender QUERY
          name: 'ownerIdAndtimeStamp',
          properties: [{ $ownerId: 'asc' }, { timeStamp: 'asc' }],
          unique: false,
        },        
        { //This is Receipient QUERY
          name: 'toIdandtimeStamp',
          properties: [{ toId: 'asc' }, { timeStamp: 'asc' }],
          unique: false,
        },
        
      ],
      properties: {
        msg: { 
          type: 'string',
          minLength: 1,
          maxLength: 250,
        },
        timeStamp: {
          type: 'integer',
          minimum: 0,
          maximum: 2546075019551,
          //FIGURE THIS OUT -> PUT A MAX -> timeStamp: 2546075019551 - Date.now(), 
        },
        
        toId: { //This is the Receipient ownerId
          type: 'array',
          byteArray: true,
          minItems: 32,
          maxItems: 32,
          contentMediaType: 'application/x.dash.dpp.identifier',
        },
        txId:{ 
          type: 'string',
          minLength: 64,
          maxLength: 64,
        } 
      },
      required:['timeStamp','toId','txId',"$createdAt", "$updatedAt"], 
      additionalProperties: false,
    },

    dgmthr: {
      type: 'object',
      indices: [      
        {
          name: 'msgIdandtimeStamp',
          properties: [{msgId: 'asc' }, {timeStamp: 'asc' }],
          unique: false,
        }
      ],
      properties: {
        timeStamp: {
          type: 'integer',
          minimum: 0,
          maximum: 2546075019551,
          //FIGURE THIS OUT -> PUT A MAX ->  timeStamp: 2546075019551 - Date.now(), 
        },
        msg: {
          type: 'string',
          minLength: 1,
          maxLength: 250,
        },
        msgId: {//this is the msg doc Id
          type: 'array',
          byteArray: true,
          minItems: 32,
          maxItems: 32,
          contentMediaType: 'application/x.dash.dpp.identifier',
        },
      },
      required: ['timeStamp', 'msg','msgId', "$createdAt", "$updatedAt"], 
      additionalProperties: false,
    },
  };


  const contract = await platform.contracts.create(contractDocuments, identity);
  console.dir({ contract: contract.toJSON() });


  const validationResult = await platform.dpp.dataContract.validate(contract);

  if (validationResult.isValid()) {
    console.log('Validation passed, broadcasting contract..');
    // Sign and submit the data contract
    return platform.contracts.publish(contract, identity);
  }
  console.error(validationResult); // An array of detailed validation errors
  throw validationResult.errors[0];
};

registerContract()
  .then((d) => console.log('Contract registered:\n', d.toJSON()))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect());
