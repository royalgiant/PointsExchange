var EscrowFactory = artifacts.require("./EscrowFactory.sol");
var EscrowExchange = artifacts.require("./EscrowExchange.sol");

const ether = (n) => new web3.utils.BN(web3.utils.toWei(n, 'ether'));

module.exports = function(deployer, network, accounts) {
  	deployer.deploy(EscrowFactory);
  	deployer.deploy(EscrowExchange);
};