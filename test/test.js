web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
  var transactionReceiptAsync;
  interval = interval ? interval : 500;
  transactionReceiptAsync = function(txnHash, resolve, reject) {
    web3.eth.getTransactionReceipt(txnHash, (error, receipt) => {
      if (error) {
        reject(error);
      } else {
        if (receipt == null) {
          setTimeout(function () {
            transactionReceiptAsync(txnHash, resolve, reject);
          }, interval);
        } else {
          resolve(receipt);
        }
      }
    });
  };
  if (Array.isArray(txnHash)) {
    var promises = [];
    txnHash.forEach(function (oneTxHash) {
      promises.push(web3.eth.getTransactionReceiptMined(oneTxHash, interval));
    });
    return Promise.all(promises);
  } else {
    return new Promise(function (resolve, reject) {
      transactionReceiptAsync(txnHash, resolve, reject);
    });
  }
};

contract('SimpleOracle', function(accounts) {
  let owner, contract, number;

  before("prepares accounts", function() {
    owner = accounts[0];      
    contract = SimpleOracle.deployed();
    number = web3.eth.blockNumber;
    console.log("current block="+number);     
  });

  it("displays current values", function() {
    contract.getResults.call().then((res)=> {
      console.log("random value="+res[0]);
      console.log("oracle time="+res[1]);
      assert.isOk(contract, "problem with contract");  
    });
  });

  it("sets up oracle", function() {
    var myEvent;
    myEvent = contract.Query({fromBlock: number});
    myEvent.watch((err, response) => {
      console.log("caught event");
      myEvent.stopWatching();
      
      //this part emulates communication with data source
      var random = 1 + Math.random()*6|0;
      var time = Date.now()/1000|0;

      // now that we have response for the contract we register it using unlocked coinbase account
      contract.registerResponse.sendTransaction(random, time, {from: owner, gas: 3000000}).then((tx)=> {
        return web3.eth.getTransactionReceiptMined(tx);
      }).then(function(receipt) {
        return contract.getResults.call();
      }).then((res)=> {
        console.log("new random value="+res[0]);
        console.log("new oracle time="+res[1]);
      });
    })
    //we registered the callback for event, now we can initaite the query
    contract.queryOracle.sendTransaction({from: owner, gas: 3000000});
    assert.isOk(contract, "problem with contract");  
  });

});
