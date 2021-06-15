import React, { Component } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import styles from '../css/pointsexchange.module.css';
import Button from 'react-bootstrap/Button';

class Main extends Component {

  onClickHandler = (e) => {
    const hiddenElement = e.currentTarget.nextSibling;
    hiddenElement.className.indexOf("collapse show") > -1 ? hiddenElement.classList.remove("show") : hiddenElement.classList.add("show");
  };

  amountSent(amount){
    if(Boolean(Number(amount))) {
      return(<p>The amount requested of the contract <b>has been</b> filled.</p>)
    } else {
      return(<p>The amount requested of the contract <b>has not</b> been filled.</p>)
    }
  }

  showDepositButton(depositMade, contractDetails, key) {
    if (!Boolean(Number(depositMade))) {
      var contract = this.props.contractObjects[key]
      return(<Button href="#" className={styles.actionButtons} onClick={ () => this.sendDepositByBuyerOrSeller(contract, contractDetails)}>Send Deposit</Button>)
    }
  }

  sendDepositByBuyerOrSeller(contract, contractDetails) {
    if (this.props.account === contractDetails[0]) {
      this.props.buyerDeposit(contract, contractDetails[3])
    } else {
      this.props.sellerDeposit(contract, contractDetails[3])
    }
  }

  reverseDepositButton(depositMade, contractDetails, key) {
    if (Boolean(Number(depositMade))) {
      var contract = this.props.contractObjects[key]
      return(<Button href="#" className={styles.actionButtons} onClick={ () => this.reverseDepositByBuyerOrSeller(contract, contractDetails)}>Reverse Deposit</Button>)
    }
  }

  reverseDepositByBuyerOrSeller(contract, contractDetails) {
    if (this.props.account === contractDetails[0]) {
      this.props.reverseBuyerDeposit(contract)
    } else {
      this.props.reverseSellerDeposit(contract)
    }
  }

  showSendAmountButton(buyer, depositCheck) {
    if (this.props.account === buyer && Boolean(Number(depositCheck)) === false) {
      return(<Button href="#" className={styles.actionButtons}>Send Amount Requested</Button>)
    }
  }

  render() {
    return (
      <Container fluid>
        <Row className="justify-content-md-center">
          <Col md="auto">
            <Tabs fill justify defaultActiveKey="create-contract" id="uncontrolled-contract-template" variant="pills">
              <Tab eventKey="create-contract" title="Create Contract">
                <h1>Start a New Contract</h1>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const buyer = this.buyerAddress.value
                  const seller = this.sellerAddress.value
                  const amount = window.web3.utils.toWei(this.amount.value.toString(), 'Ether')
                  const deposit = window.web3.utils.toWei(this.deposit.value.toString(), 'Ether')
                  const notes = this.notes.value
                  this.props.createContract(buyer, seller, amount, deposit, notes)
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
                   <div className="form-group mr-sm-2">
                    <textarea
                      id="notes"
                      type="text"
                      ref={(input) => { this.notes = input }}
                      className="form-control"
                      placeholder="Notes"
                      required />
                  </div>
                  <button type="submit" className="btn btn-primary">Create Contract</button>
                </form>
              </Tab>
              <Tab eventKey="my-contracts" title="My Contracts">
                <h1><center>My Contracts</center></h1>
                <Table size="sm" responsive="sm" hover>
                  <thead>
                    <tr>
                      <th>Contract Addresses:</th>
                      <th>Amount</th>
                      <th>Deposit</th>
                      <th>Notes</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.props.myContractsDetails.map((contractDetails, key) => {
                      var buyer = contractDetails[0]
                      var seller = contractDetails[1]
                      var amount = contractDetails [2]
                      var deposit = contractDetails[3]
                      var signatureCount = contractDetails[4]
                      var status = contractDetails[5]
                      var notes = contractDetails[6]
                      var depositCheck = contractDetails[7]
                      var contractAddress = contractDetails[10]
                      return(
                        <React.Fragment key={key}>
                          <tr key={key} onClick={this.onClickHandler}>
                            <td className={styles.contractIndexKey}>
                              <Button className={styles.contractIndexKeyButton} variant="link">Contract Address:{contractAddress}</Button>
                              <p className={styles.address}><b>Buyer Address:</b> {buyer}</p>
                              <p className={styles.address}><b>Seller Address:</b>{seller}</p>
                            </td>
                            <td>{window.web3.utils.fromWei((amount).toString(), 'Ether')} ETH</td>
                            <td>{window.web3.utils.fromWei((deposit).toString(), 'Ether')} ETH</td>
                            <td>{notes}</td>
                            <td>{status}</td>
                          </tr>
                          <tr className="collapse">
                            <td colSpan="7">
                              <div>
                              <p>The Signature Count is <strong>{signatureCount}</strong> <i>(2 is required to reclaim Deposit)</i>.</p>
                              {this.showDepositButton(depositCheck, contractDetails, key)}
                              {this.reverseDepositButton(depositCheck, contractDetails, key)}
                              <Button href="#" className={styles.actionButtons}>Claim Deposits</Button>
                              {this.showSendAmountButton(buyer, depositCheck)}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </Table>
              </Tab>
            </Tabs>   
          </Col>
        </Row>
      </Container>

    );
  }
}

export default Main;