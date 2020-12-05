var contractAddr = "0x7FD134E0CBD1632e9A0bEa0B9e12D5ABEF3E2D2d"
var infuraUrl = "https://ropsten.infura.io/v3/91cb1bb696324b0d904b7e6aff00b5fd"
var privateKey = "0x2aec87ab2752c3d99c115185cca446411b4a9a1615f0db2cf8e2f3da1501118b"

var web3 = new Web3(infuraUrl)
var account = web3.eth.accounts.privateKeyToAccount(privateKey)

web3.eth.defaultChain = 'ropsten';

var fromAddr = account.address // 0xe24cE7a12bCC59c78fE310afaDa82bD6f7848aEf"

var abi = [{"constant":false,"inputs":[{"name":"text","type":"string"},{"name":"time","type":"uint256"}],"name":"add","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getList","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"time","type":"uint256"}],"name":"get","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_sender","type":"address"},{"indexed":true,"name":"_text","type":"string"},{"indexed":true,"name":"_time","type":"uint256"}],"name":"Recorded","type":"event"}]

function timeFormatter(time) {
  return ('' + time).padStart(2, '0')
}

function getContract() {
  var contract = new web3.eth.Contract(abi, contractAddr)
  return contract
}

function viewTime() {
  var time = new Date()

  $("#currTime").val(+time)
  $(".add__time--year").html(time.getFullYear())
  $(".add__time--month").html(time.getMonth() + 1)
  $(".add__time--day").html(timeFormatter(time.getDate()))

  $(".add__time--hour").html(timeFormatter(time.getHours()))
  $(".add__time--min").html(timeFormatter(time.getMinutes()))
}

async function fetchList() {

  console.log("fetchList")

  var contract = getContract()

  var records = await contract.methods.getList().call({
    from: fromAddr
  })

  var len = records.length - 1
  var contents = ""

  for(var i =len; i>=0; i--){
    var item = records[i]
    var text = await contract.methods.get(item).call({
      from: fromAddr
    })

    var date = new Date(parseInt(item))

    var dateStr=`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${timeFormatter(date.getHours())}:${timeFormatter(date.getMinutes())}`

    contents += `<div class="list__record--container">
        <div class="list__record--year">${date.getFullYear()}</div>
        <span>${dateStr}</span>
        <div>${text}</div>
      </div>`
  }

  $(".list__record--page").html(contents)
}

 // Unpkg imports
 const Web3Modal = window.Web3Modal.default;
 const WalletConnectProvider = window.WalletConnectProvider.default;
 const evmChains = window.evmChains;

 // Web3modal instance
 let web3Modal

 // Chosen wallet provider given by the dialog window
 let provider;

 // Address of the selected account
 let selectedAccount;

function init() {
  console.log("Initializing example");
  console.log("WalletConnectProvider is", WalletConnectProvider);
  console.log("window.web3 is", window.web3);
  console.log("window.ethereum is", window.ethereum);

  // like MetaMask, Brave or Opera is added automatically by Web3modal
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "91cb1bb696324b0d904b7e6aff00b5fd",
      }
    }
  };

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });

  console.log("Web3Modal instance is", web3Modal);
}


$(document).ready(async function() {

  init();

  viewTime()
  fetchList()

  $("#sendBtn").click(async function() {

    console.log("send msg")
    var contract = getContract()
    var text = $("#message").val()
    var _currtime = $("#currTime").val()

    var currtime = parseInt(_currtime)

    var code = contract.methods.add(text, currtime).encodeABI()

    var txCount = await web3.eth.getTransactionCount(fromAddr)

    const txObj = {
      nonce:    web3.utils.toHex(txCount),
      to:       contractAddr,
      value:    web3.utils.toHex(web3.utils.toWei('0', 'ether')),
      gasLimit: web3.utils.toHex(3000000),
      gasPrice: web3.utils.toHex(web3.utils.toWei('6', 'gwei')),
      data: code
    }

    var signedTx = await web3.eth.accounts.signTransaction(txObj, privateKey)

    var txResule = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    console.log(txResule.transactionHash)

    alert("交易成功，交易hash：" + txResule.transactionHash)
    // https://ethereum.stackexchange.com/a/36363
    // https://github.com/ethereumjs/browser-builds/raw/master/dist/ethereumjs-tx/ethereumjs-tx-1.3.3.min.js
  })


  $("#connectBtn").click(async function(){
    console.log("Opening a dialog", web3Modal);

    try {
      provider = await web3Modal.connect();
    } catch(e) {
      console.log("Could not get a wallet connection", e);
      return;
    }

    const web3 = new Web3(provider);

    console.log("Web3 instance is", web3);

    const chainId = await web3.eth.getChainId();
    const chainData = evmChains.getChain(chainId);
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];

    $("#ethAddr").html(account);
    $("#ethNetwork").html(chainData.name);

    const balance = await web3.eth.getBalance(account);

    const ethBalance = web3.utils.fromWei(balance, "ether");
    const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);

    $("#ethBalance").html(humanFriendlyBalance + " ETH");

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
    //   fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
    //   fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
    //   fetchAccountData();
    });

    // await refreshAccountData();
  });

})