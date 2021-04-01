import React, { Component } from 'react';
import Web3 from 'web3'
import EscrowExchange from '../abis/EscrowExchange.json'
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
    if(EscrowExchangeNetworkData) {
      const escrowExchange = new web3.eth.Contract(EscrowExchange.abi, EscrowExchangeNetworkData.address)
      this.setState({ escrowExchange })
      // const contractCount = await marketplace.methods.contractCount().call()
      // this.setState({ contractCount })
      // Load Contracts FOR CURRENT USER
      // for (var i = 1; i <= contractCount; i++) {
      //   const product = await marketplace.methods.products(i).call()
      //   this.setState({
      //     products: [...this.state.products, product]
      //   })
      // }
      var buyers, sellers, amounts, deposits, signatureCounts, statuses = await escrowExchange.methods.getContractsForCurrentUser({from: web3.eth.accounts[0]}).call()
      console.log("Done")
      console.log(buyers)
      console.log(sellers)
      // this.setState({ address, status })
      // console.log(address)
      // console.log(status)
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
    this.createContract = this.createContract.bind(this)
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
    this.setState({ loading: true })
    this.state.escrowExchange.methods.createContract(buyer, seller, amount, deposit)
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  buyerDeposit() {
    this.setState({ loading: true })
    this.state.escrowExchange.methods.buyerDeposit()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  sellerDeposit(){
    this.setState({ loading: true })
    this.state.escrowExchange.methods.sellerDeposit()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  reverseBuyerDeposit() {
    this.setState({ loading: true })
    this.state.escrowExchange.methods.reverseBuyerDeposit()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  reverseSellerDeposit() {
    this.setState({ loading: true })
    this.state.escrowExchange.methods.reverseSellerDeposit()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  claimDeposits() {
    this.setState({ loading: true })
    this.state.escrowExchange.methods.claimDeposits()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  sendAmount() {
    this.setState({ loading: true })
    this.state.escrowExchange.methods.sendAmount()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  paySeller() {
    this.setState({ loading: true })
    this.state.escrowExchange.methods.paySeller()
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  refundBuyer() {
    this.setState({ loading: true })
    this.state.escrowExchange.methods.refundBuyer()
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
                  createContract={this.createContract}
                  buyerDeposit={this.buyerDeposit}
                  sellerDeposit={this.sellerDeposit}
                  reverseBuyerDeposit={this.reverseBuyerDeposit}
                  reverseSellerDeposit={this.reverseSellerDeposit}
                  claimDeposits={this.claimDeposits}
                  sendAmount={this.sendAmount}
                  paySeller={this.paySeller}
                  refundBuyer={this.refundBuyer}
                  />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;