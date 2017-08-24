var accounts;
var account;

function setStatus(message) {
  var status = document.getElementById("status");
  status.innerHTML = message;
};

function refreshView() {
  var oracle = SimpleOracle.deployed();

  oracle.getResults.call({from: account}).then(function(val) {
    var random_element = document.getElementById("random");
    var time_element = document.getElementById("time");
    random_element.innerHTML = val[0].valueOf();
    time_element.innerHTML = val[1].valueOf();
  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting results; see log.");
  });
};

function query() {
  var oracle = SimpleOracle.deployed();
  var error = false;
  var number = web3.eth.blockNumber;

  setStatus("Initiating oracle query... (please wait)");

    var myEvent;
    myEvent = oracle.Query({fromBlock: number});
    myEvent.watch((err, response) => {

      //this part emulates communication with data source
      var random = 1 + Math.random()*6|0;
      var time = Date.now()/1000|0;

      oracle.registerResponse.sendTransaction(random, time, {from: account, gas: 3000000}).then(function(tx) {
        return web3.eth.getTransactionReceiptMined(tx);
      }).catch(function(e) {
        console.log(e);
        setStatus("Error during registry; see log.");
        error = true;
      }).then(function(receipt) {   
        if (!error)
          setStatus("Oracle request complete!");
        refreshView();
        myEvent.stopWatching();
      }).catch(function(e) {
        console.log(e);
      });
    })
    
    //we registered the callback for event, now we can initaite the query
    oracle.queryOracle.sendTransaction({from: account, gas: 3000000});
};

window.onload = function() {

  web3.eth.getTransactionReceiptMined=function(txnHash,interval){var transactionReceiptAsync;interval=interval?interval:500;transactionReceiptAsync=function(txnHash,
  resolve,reject){web3.eth.getTransactionReceipt(txnHash,(error,receipt)=>{if(error){reject(error);}else{if(receipt==null){setTimeout(function(){transactionReceiptAsync(txnHash,
  resolve,reject);},interval);}else{resolve(receipt);}}});};if(Array.isArray(txnHash)){var promises=[];txnHash.forEach(function(oneTxHash){promises.push(
  web3.eth.getTransactionReceiptMined(oneTxHash,interval));});return Promise.all(promises);}else{return new Promise(function(resolve,reject){transactionReceiptAsync(txnHash,resolve,reject);});}};

  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];

    refreshView();
  });
}
