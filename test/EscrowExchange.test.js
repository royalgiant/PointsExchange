const EscrowExchange = artifacts.require("../contracts/EscrowExchange.sol")

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

require('chai').use(require('chai-as-promised')).should()

contract("EscrowExchange", ([deployer, buyer, seller]) => {
	let escrowExchange

	before(async() => {
		escrowExchange = await EscrowExchange.deployed()
	})

	describe('deployment', async () => {
	    it('deploys successfully', async () => {
	      const address = await escrowExchange.address
	      assert.notEqual(address, 0x0)
	      assert.notEqual(address, '')
	      assert.notEqual(address, null)
	      assert.notEqual(address, undefined)
	    })
	})

	describe('contract', async () => {
	    
	    it('creates contract', async () => {
	    	return EscrowExchange.deployed().then(function(instance) {
	    		escrowInstance = instance;
	    		contract = escrowExchange.createContract(buyer, seller, web3.utils.toWei('1', 'Ether'), web3.utils.toWei('0.5', 'Ether'), "Some notes", { from: buyer })
	    		return contract
	    	}).then(function(receipt) {
	    		return escrowInstance.addressToIndex(buyer, 0); // 0 is for the uint index, since we only have one element at index 0, which is 0
	    	}).then(function(addressToIndexBuyerLength) {
	    		assert.equal(addressToIndexBuyerLength, 0, "Buyer's addressToIndex holds 1 contract  – The first element will be 0");
	    	}).then(function(receipt) {
	    		return escrowInstance.addressContractIndexExists(buyer, 0); // 0 is for the uint index, since we only have one element at index 0, which is 0
	    	}).then(function(buyerContractIndexExists) {
	    		assert.equal(buyerContractIndexExists, true, "Buyer's addressContractIndexExists for created contract exists");
	    	}).then(function(receipt){
	    		return escrowInstance.addressToIndex(seller,0); // 0 is for the uint index, since we only have one element at index 0, which is 0
	    	}).then(function(addressToIndexSellerLength) {
	    		assert.equal(addressToIndexSellerLength, 0, "Seller's addressToIndex holds 1 contract – The first element will be 0");
	    	}).then(function(receipt) {
	    		return escrowInstance.addressContractIndexExists(seller, 0); // 0 is for the uint index, since we only have one element at index 0, which is 0
	    	}).then(function(sellerContractIndexExists) {
	    		assert.equal(sellerContractIndexExists, true, "Seller's addressContractIndexExists for created contract exists");
	    	}).then(function(receipt){
	    		return escrowInstance.contractIndexesForUsers(0);
	    	}).then(function(contractAtIndex){
	    		assert.notEqual(contractAtIndex, 0x0, "The contract is in the array contractIndexesForUsers and has an address");
	    	}).then(function(receipt){ // 
	    		return escrowInstance.contractCount();
	    	}).then(function(contractCount){
	    		assert.equal(contractCount, 1, "The contractCount is increased to 1");
	    	})
	    })

	   	it('getContractCountForCurrentUser', async () => {
	   		return EscrowExchange.deployed().then(function(instance) {
	    		const contract_count = escrowExchange.getContractCountForCurrentUser({from: buyer});
	   			return contract_count
	    	}).then(function(contract_count) {
	    		assert.equal(contract_count, 1, "The getContractCountForCurrentUser returns 1 for array size");
	    	})
	   	})

	   	it('getContractForCurrentUser', async () => {
	   		return EscrowExchange.deployed().then(function(instance) {
	    		const retrieved_contract = escrowExchange.getContractForCurrentUser(0);
	   			return retrieved_contract
	    	}).then(function(retrieved_contract) {
	    		assert.equal(retrieved_contract[0], buyer, 'buyer is correct')
			    assert.equal(retrieved_contract[1], seller, 'seller is correct')
			    assert.equal(retrieved_contract[2].toString(), '1000000000000000000', 'amount is correct')
			    assert.equal(retrieved_contract[3].toString(), '500000000000000000', 'deposit is correct')
			    assert.equal(retrieved_contract[4].toNumber(), 0, 'signatureCount is correct')
			    assert.equal(retrieved_contract[5], "Open", 'status is correct')
			    assert.equal(retrieved_contract[6], "Some notes", 'notes is correct')
			    assert.equal(retrieved_contract[7].toNumber(), 0, 'depositCount is correct')
	    	})
	   	})

	   	it('rejects contract without buyer parameter', async () => {
	   		await expectRevert(escrowExchange.createContract(constants.ZERO_ADDRESS, seller, web3.utils.toWei('1', 'Ether'), web3.utils.toWei('0.5', 'Ether'), "Some notes"), "Invalid buyer address")
	   	})

	   	it('rejects contract without seller parameter', async () => {
	   		await expectRevert(escrowExchange.createContract(buyer, constants.ZERO_ADDRESS, web3.utils.toWei('1', 'Ether'), web3.utils.toWei('0.5', 'Ether'), "Some notes"), "Invalid seller address")
	   	})

	   	it('rejects create contract with 0 amount parameter', async () => {
	    	await expectRevert(escrowExchange.createContract(buyer, seller, web3.utils.toWei('0', 'Ether'), web3.utils.toWei('0.5', 'Ether'), "Some notes"), "revert")
	   	})

	   	it('rejects create contract with 0 deposit parameter', async () => {
	   		await expectRevert(escrowExchange.createContract(buyer, seller, web3.utils.toWei('1', 'Ether'), web3.utils.toWei('0', 'Ether'), "Some notes"),  "revert")
	   	})

	      // FAILURE: Product must have a buyer
	      
	      // FAILURE: Product must have a seller
	      // await await escrowExchange.createContract('iPhone X', 0, { from: buyer }).should.be.rejected;
	      // FAILURE: Product must have a amount
	      // FAILURE: Product must have a deposit


	      /* To replicate ON TRUFFLE CONSOLE, deploy the contract and run the following
			let accounts = await web3.eth.getAccounts()
			escrowExchange.createContract(accounts[0], accounts[1], "2000000000000000000", "1000000000000000000", "some notes")
			
			// Get owner's contract count
			escrowExchange.ownerContractCount(accounts[0]).then(function(balance) {numberInstance = balance})
			numberInstance.toNumber()
			// Get Contracresultt Attributes for Owner's 1st contract indexed at 0
			escrowExchange.getContractForCurrentUser(0).then(function(balance) {contractInstance = balance})
			contractInstance["0"]
			contractInstance["1"]
			contractInstance["2"].toString()
			contractInstance["3"].toString()
			contractInstance["4"].toNumber()
			contractInstance["5"].toNumber()
			contractInstance["6"].toNumber()
	      */

	      /* Get Contract and Contract Balance
	      const address = await escrowExchange.address
	      let balance = await web3.eth.getBalance(address)
	      */

	})
})
