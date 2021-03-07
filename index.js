const contractAddr = "0x7FD134E0CBD1632e9A0bEa0B9e12D5ABEF3E2D2d"
// Unpkg imports
const Web3Modal = window.Web3Modal.default
const WalletConnectProvider = window.WalletConnectProvider.default
const evmChains = window.evmChains

// Web3modal instance
let web3Modal

let provider

let fromAddr

let web3

const abi = [{"constant":false,"inputs":[{"name":"text","type":"string"},{"name":"time","type":"uint256"}],"name":"add","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getList","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"time","type":"uint256"}],"name":"get","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_sender","type":"address"},{"indexed":true,"name":"_text","type":"string"},{"indexed":true,"name":"_time","type":"uint256"}],"name":"Recorded","type":"event"}]

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
  $(".add__time--month").html(timeFormatter(time.getMonth() + 1))
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

  for(var i =len; i>=0; i--){ // 逆序循环
    var item = records[i]
    var text = await contract.methods.get(item).call({
      from: fromAddr
    })

    var date = new Date(parseInt(item))

    var dateStr=`${date.getFullYear()}-${timeFormatter(date.getMonth() + 1)}-${timeFormatter(date.getDate())} ${timeFormatter(date.getHours())}:${timeFormatter(date.getMinutes())}`

    contents += `<div class="list__record--container">
        <div class="list__record--year">${date.getFullYear()}</div>
        <span>${dateStr}</span>
        <div>${text}</div>

      </div>`
  }

  $(".list__record--page").html(contents)
}

function init() {
  console.log("init")
  console.log("WalletConnectProvider is", WalletConnectProvider)
  console.log("window.web3 is", window.web3)
  console.log("window.ethereum is", window.ethereum)

  // like MetaMask, Brave or Opera is added automatically by Web3modal
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "91cb1bb696324b0d904b7e6aff00b5fd",
      }
    }
  }

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  })

  console.log("Web3Modal instance is", web3Modal)
}


$(document).ready(async function() { // 页面加载成功后

  init()

  viewTime()

  $("#sendBtn").click(async function() {
    console.log("send msg")
    var contract = getContract()
    var text = $("#message").val()
    var _currtime = $("#currTime").val()

    var currtime = parseInt(_currtime)

    await contract.methods.add(text, currtime).send({
      from: fromAddr
    })

    fetchList()
  })

  $("#connectBtn").click(async function() {

    console.log("Opening a dialog", web3Modal)

    try {
      provider = await web3Modal.connect()
    } catch (e) {
      console.error("Could not get a wallet connection", e)
      return
    }

    web3 = new Web3(provider)

    console.log("Web3 instance is", web3)

    const newprovider = new ethers.providers.Web3Provider(web3.currentProvider);
    // const signer = await newprovider.getSigner();

    const newAccounts = await newprovider.listAccounts();
    const newAccount  = newAccounts[0];

    const chainId = await web3.eth.getChainId()
    const chainData = evmChains.getChain(chainId)
    const accounts = await web3.eth.getAccounts()
    fromAddr = accounts[0]

    console.log(chainData)
    $("#ethAddr").html(fromAddr)
    $("#ethNetwork").html(chainData.name)

    const balance = await web3.eth.getBalance(fromAddr)

    const ethBalance = web3.utils.fromWei(balance, "ether")
    const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4)

    $("#ethBalance").html(humanFriendlyBalance + " ETH")

    fetchList()

  })

})