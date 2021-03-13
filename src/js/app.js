App = {
  loading: false,
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    // Create a JavaScript version of the smart contract
    const escrowExchange = await $.getJSON('EscrowExchange.json')
    App.contracts.EscrowExchange = TruffleContract(escrowExchange)
    App.contracts.EscrowExchange.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.escrowExchange = await App.contracts.EscrowExchange.deployed()

    const escrow = await $.getJSON('Escrow.json')
    App.contracts.Escrow = TruffleContract(escrow)
    App.contracts.Escrow.setProvider(App.web3Provider)
    App.escrow = await App.contracts.Escrow.deployed()
  },

  listenForEvents: function() {
    App.contracts.Escrow.deployed().then(function(instance) {
      instance.SellerPaid({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $('#account').html(App.account)

    // Render Tasks
    // await App.renderTasks()

    // Update loading state
    App.setLoading(false)
  },

  // EscrowExchange Calls

  addContractAddressToRegistry: (buyerAddress, sellerAddress, contractAddress) => {
    App.setLoading(true)
    await App.escrowExchange.addContractAddressToRegistry(buyerAddress, sellerAddress, contractAddress)
    window.location.reload()
  },
  
  // Escrow Calls
  buyerDeposit: () => {

  },

  sellerDeposit: () => {

  },

  reverseBuyerDeposit: () => {

  },

  reverseSellerDeposit: () => {

  },

  claimDeposits: () => {

  },

  sendAmount: () => {

  },

  paySeller: () => {

  },

  refundBuyer: () => {

  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
