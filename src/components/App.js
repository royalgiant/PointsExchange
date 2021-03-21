import React, { Component } from 'react';
import Web3 from 'web3'
import EscrowExchange from '../abis/EscrowExchange.json'
import Escrow from '../abis/Escrow.json'
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const EscrowExchangeNetworkData = EscrowExchange.networks[networkId]
    const EscrowNetworkData = Escrow.networks[networkId]
    if(EscrowExchangeNetworkData && EscrowNetworkData) {
      const escrow = new web3.eth.Contract(Escrow.abi, EscrowNetworkData.address)
      const escrowExchange = new web3.eth.Contract(EscrowExchange.abi, EscrowExchangeNetworkData.address)
      this.setState({ escrow, escrowExchange })
      // const contractCount = await marketplace.methods.contractCount().call()
      // this.setState({ contractCount })
      // Load Contracts FOR CURRENT USER
      // for (var i = 1; i <= contractCount; i++) {
      //   const product = await marketplace.methods.products(i).call()
      //   this.setState({
      //     products: [...this.state.products, product]
      //   })
      // }
      var address, status = await escrowExchange.methods.getContractsForCurrentUser(web3.eth.accounts[0])
      this.setState({ address, status })
      console.log(address)
      console.log(status)
      this.setState({ loading: false})
    } else {
      window.alert('Escrow and EscrowExchange contracts not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      buyer:'',
      seller: '',
      amount: 0,
      deposit: 0,
      loading: true
    }

    this.addContractAddressToRegistry = this.addContractAddressToRegistry.bind(this)
    this.buyerDeposit = this.buyerDeposit.bind(this)
    this.sellerDeposit = this.sellerDeposit.bind(this)
    this.reverseBuyerDeposit = this.reverseBuyerDeposit.bind(this)
    this.reverseSellerDeposit = this.reverseSellerDeposit.bind(this)
    this.claimDeposits = this.claimDeposits.bind(this)
    this.sendAmount = this.sendAmount.bind(this)
    this.paySeller = this.paySeller.bind(this)
    this.refundBuyer = this.refundBuyer.bind(this)
  }

  // EscrowExchange Calls

  addContractAddressToRegistry(buyerAddress, sellerAddress, contractAddress) {
    this.setState({ loading: true })
    this.state.escrowExchange.methods.addContractAddressToRegistry(buyerAddress, sellerAddress, contractAddress)
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }
  
  // Escrow Calls

  createContract(buyer, seller, amount, deposit) {
    const web3 = window.web3
    new web3.eth.Contract(Escrow.abi)
    .deploy({ 
        data: Escrow.bytecode, 
        arguments: [this.state.buyer, this.state.seller, this.state.amount, this.state.deposit] // Writing you arguments in the array
    }).send({ from: this.state.account});
  }

  buyerDeposit() {
    this.setState({ loading: true })
    this.state.escrow.methods.buyerDeposit()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  sellerDeposit(){
    this.setState({ loading: true })
    this.state.escrow.methods.sellerDeposit()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  reverseBuyerDeposit() {
    this.setState({ loading: true })
    this.state.escrow.methods.reverseBuyerDeposit()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  reverseSellerDeposit() {
    this.setState({ loading: true })
    this.state.escrow.methods.reverseSellerDeposit()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  claimDeposits() {
    this.setState({ loading: true })
    this.state.escrow.methods.claimDeposits()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  sendAmount() {
    this.setState({ loading: true })
    this.state.escrow.methods.sendAmount()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  paySeller() {
    this.setState({ loading: true })
    this.state.escrow.methods.paySeller()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  refundBuyer() {
    this.setState({ loading: true })
    this.state.escrow.methods.refundBuyer()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Main
                  products={this.state.products}
                  createProduct={this.createProduct}
                  purchaseProduct={this.purchaseProduct} />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;