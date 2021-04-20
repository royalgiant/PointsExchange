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

  showDepositButton(depositMade, contract, key) {
    if (!Boolean(Number(depositMade))) {
      return(<Button href="#" className={styles.actionButtons} onClick={ () => this.sendDepositByBuyerOrSeller(contract, key)}>Send Deposit</Button>)
    }
  }

  sendDepositByBuyerOrSeller(contract, contract_index) {
    if (this.props.account === contract[0]) {
      this.props.buyerDeposit(contract_index, contract[3])
    } else {
      this.props.sellerDeposit(contract_index, contract[3])
    }
  }

  showSendAmountButton(buyer) {
    if (this.props.account === buyer) {
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
                      <th>#</th>
                      <th>Buyer Address</th>
                      <th>Seller Address</th>
                      <th>Amount</th>
                      <th>Deposit</th>
                      <th>Notes</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.props.myContracts.map((contract, key) => {
                      return(
                        <React.Fragment key={key}>
                          <tr key={key} onClick={this.onClickHandler}>
                            <td className={styles.contractIndexKey}><Button className={styles.contractIndexKeyButton} variant="link">{key}</Button></td>
                            <td className={styles.address}>{contract[0]}</td>
                            <td className={styles.address}>{contract[1]}</td>
                            <td>{window.web3.utils.fromWei((contract[2]).toString(), 'Ether')} ETH</td>
                            <td>{window.web3.utils.fromWei((contract[3]).toString(), 'Ether')} ETH</td>
                            <td>{contract[8]}</td>
                            <td>{contract[7]}</td>
                          </tr>
                          <tr className="collapse">
                            <td colSpan="7">
                              <div>
                              <p>The Signature Count is <strong>{contract[4]}</strong> <i>(2 is required to complete the contract)</i>.</p>
                              <p>The Deposit Count is <strong>{contract[5]}</strong> <i>(2 is required to complete the contract)</i>.</p>
                              {this.amountSent(contract[6])}
                              {this.showDepositButton(contract[9], contract, key)}
                              <Button href="#" className={styles.actionButtons}>Reverse Deposit</Button>
                              <Button href="#" className={styles.actionButtons}>Claim Deposits</Button>
                              {this.showSendAmountButton(contract[0])}
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