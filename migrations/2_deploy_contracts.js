var Escrow = artifacts.require("./Escrow.sol");
var EscrowExchange = artifacts.require("./EscrowExchange.sol");

const ether = (n) => new web3.utils.BN(web3.utils.toWei(n, 'ether'));

module.exports = function(deployer, network, accounts) {
	const _buyerAddress = accounts[0]
	const _sellerAddress = accounts[0]
	const _amount = ether('1');
	const _deposit = ether('1');
  	deployer.deploy(Escrow, _buyerAddress, _sellerAddress, _amount, _deposit);
  	deployer.deploy(EscrowExchange);
};