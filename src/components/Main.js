import React, { Component } from 'react';

class Main extends Component {

  render() {
    return (
      <div id="content">
        <h1>Start a New Contract</h1>
        <form onSubmit={(event) => {
          event.preventDefault()
          const buyer = this.buyerAddress.value
          const seller = this.sellerAddress.value
          const amount = window.web3.utils.toWei(this.amount.value.toString(), 'Ether')
          const deposit = window.web3.utils.toWei(this.deposit.value.toString(), 'Ether')
          this.props.createContract(buyer, seller, amount, deposit)
        }}>
          <div className="form-group mr-sm-2">
            <input
              id="buyerAddress"
              type="text"
              ref={(input) => { this.buyerAddress = input }}
              className="form-control"
              placeholder="Buyer Address"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="sellerAddress"
              type="text"
              ref={(input) => { this.sellerAddress = input }}
              className="form-control"
              placeholder="Seller Address"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="amount"
              type="text"
              ref={(input) => { this.amount = input }}
              className="form-control"
              placeholder="Amount"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="deposit"
              type="text"
              ref={(input) => { this.deposit = input }}
              className="form-control"
              placeholder="Deposit"
              required />
          </div>
          <button type="submit" className="btn btn-primary">Create Contract</button>
        </form>
      </div>
    );
  }
}

export default Main;