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
	let depositValue = "10000000000"
  let amountValue = "1000000000"
  let depositValue2 = "10000000000"
  let amountValue2 = "1000000000"

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
	    		contract = escrowExchange.createContract(buyer, seller, amountValue, depositValue, "Some notes", { from: buyer })
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
	    		assert.equal(1, contract_count, "The getContractCountForCurrentUser returns 1 for array size of 1 in if statement");
	    	}).then(function(receipt) {
	    		contract2 = escrowExchange.createContract(buyer, seller, amountValue2, depositValue2, "Some notes 2", { from: buyer })
	    		const contract_count2 = escrowExchange.getContractCountForCurrentUser({from: buyer});
	   			return contract_count2
	    	}).then(function(contract_count2) {
	    		assert.equal(2, contract_count2, "The getContractCountForCurrentUser returns 1 for array size of 2 in else statement");
	    	})
	   	})

	   	it('getContractForCurrentUser', async () => {
	   		return EscrowExchange.deployed().then(function(instance) {
	    		const retrieved_contract = escrowExchange.getContractForCurrentUser(0, {from: buyer});
	   			return retrieved_contract
	    	}).then(function(retrieved_contract) {
	    		assert.equal(retrieved_contract[0], buyer, 'buyer is correct')
			    assert.equal(retrieved_contract[1], seller, 'seller is correct')
			    assert.equal(retrieved_contract[2].toString(), amountValue, 'amount is correct')
			    assert.equal(retrieved_contract[3].toString(), depositValue, 'deposit is correct')
			    assert.equal(retrieved_contract[4].toNumber(), 0, 'signatureCount is correct')
			    assert.equal(retrieved_contract[5], "Open", 'status is correct')
			    assert.equal(retrieved_contract[6], "Some notes", 'notes is correct')
			    assert.equal(retrieved_contract[7].toNumber(), 0, 'buyer depositCheck is correct')
			    assert.equal(retrieved_contract[8].toNumber(), 0, 'buyer amountCheck is correct')
			    assert.equal(retrieved_contract[9].toNumber(), 0, 'buyer signatures is correct')
			    assert.notEqual(retrieved_contract[10], 0x0, "contract address is not 0x0");
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

	describe('EscrowExchange claimDeposits', async () => {
		// Tests for ClaimDeposits
   	it('rejects claimDeposits with buyer ', async () => {
   		await expectRevert(escrowExchange.claimDeposits(1, {from: seller}),  "the buyer has not made a deposit for claimDeposits")
   	})

   	it('allows ClaimDeposits for buyer ending with signatureCount = 1', async() => {
   		return EscrowExchange.deployed().then(function(instance){
   			escrowExchange.buyerDeposit(0, {from: buyer, value: depositValue});
   			escrowExchange.sellerDeposit(0, {from: seller, value: depositValue});
   			const claimDeposit_receipt = escrowExchange.claimDeposits(0, {from: buyer});
   			return claimDeposit_receipt
   		}).then(function(claimDeposit_receipt){
   			expectEvent(claimDeposit_receipt, 'DepositPartialClaim', { msg: "the deposit claim has 1 out of 2 necessary signatures" });
   			const retrieved_contract = escrowExchange.getContractForCurrentUser(0, {from: buyer});
   			return retrieved_contract
    	}).then(function(retrieved_contract){
    		assert.equal(retrieved_contract[9].toNumber(), 1, "signature[buyer] is 1")
    	})
   	})

   	it('rejects buyer claimDeposits when buyer already claimed and has signature', async () => {
   		await expectRevert(escrowExchange.claimDeposits(0, {from: buyer}), "the sender have already signed off on claimDeposit")
   	})

		it('allows ClaimDeposits for seller ending with signatureCount = 2; deposits released', async() => {
	   		return EscrowExchange.deployed().then(function(instance){
	   			const claimDeposit_receipt = escrowExchange.claimDeposits(0, {from: seller});
	   			return claimDeposit_receipt
	   		}).then(function(claimDeposit_receipt){
	   			expectEvent(claimDeposit_receipt, 'DepositsClaimed', { msg: "the deposits have been returned" });
	   			const retrieved_contract = escrowExchange.getContractForCurrentUser(0, {from: seller});
	   			return retrieved_contract
	    	}).then(function(retrieved_contract){
	    		assert.equal(retrieved_contract[4].toNumber(), 2, 'signatureCount is correct')
	    		assert.equal(retrieved_contract[7].toNumber(), 0, 'seller depositCheck is correct')
	    		assert.equal(retrieved_contract[9].toNumber(), 0, "signature[seller] is 0")
	    	})
	   	})
	})
})


contract("EscrowExchange Contract 2 Reverse Deposits", ([deployer, buyer, seller]) => {
	let escrowExchange
	let depositValue = "10000000000"
  let amountValue = "1000000000"
  let depositValue2 = "10000000000"
  let amountValue2 = "1000000000"

	before(async() => {
		escrowExchange = await EscrowExchange.deployed()
	})

	describe('contract', async () => {
	    it('creates contract', async () => {
	    	return EscrowExchange.deployed().then(function(instance) {
	    		escrowInstance = instance;
	    		contract = escrowExchange.createContract(buyer, seller, amountValue, depositValue, "Some notes", { from: buyer })
	    		contract2 = escrowExchange.createContract(buyer, seller, amountValue2, depositValue2, "Some notes", { from: buyer })
	    		return contract
	    	})
	    })
	})

	describe('EscrowExchange BuyerDeposit', async () => {
		// Tests for BuyerDeposit

   	it('allows buyer to deposit', async() => {
   		return EscrowExchange.deployed().then(function(instance){
   			const deposit_receipt = escrowExchange.buyerDeposit(0, {from: buyer, value: depositValue});
   			return deposit_receipt
   		}).then(function(deposit_receipt){
   			expectEvent(deposit_receipt, 'BuyerDeposited', { from: buyer,  msg: "has made the required deposit of", amount: depositValue });
   			const retrieved_contract = escrowExchange.getContractForCurrentUser(0, {from: buyer});
   			return retrieved_contract
    	}).then(function(retrieved_contract){
    		assert.equal(retrieved_contract[7].toNumber(), 1, "buyer has deposited")
    	})	
   	})

   	it('rejects CLAIMDEPOSITS WITH SELLER', async () => {
   		await expectRevert(escrowExchange.claimDeposits(0, {from: seller}),  "the seller has not made a deposit for claimDeposits")
   	})

   	it('rejects buyer deposit with invalid deposit parameter', async () => {
   		await expectRevert(escrowExchange.buyerDeposit(0, {from: buyer, value: "1000"}),  "Invalid deposit")
   	})

   	it('rejects buyer deposit because buyer already deposited', async () => {
   		await expectRevert(escrowExchange.buyerDeposit(0, {from: buyer, value: depositValue}),  "Buyer already deposited")
   	})
	})

	describe('EscrowExchange ReverseBuyerDeposit', async () => {
		// Tests for ReverseBuyerDeposit

   	it('rejects buyer reverseDeposit because buyer has NOT deposited', async () => {
   		await expectRevert(escrowExchange.reverseBuyerDeposit(1, {from: buyer}),  "the buyer has not desposited CANNOT reverseDeposit")
   	})

   	it('rejects buyer reverseDeposit because seller already deposited', async () => {
   	 	escrowExchange.sellerDeposit(0, {from: seller, value: depositValue});
   		await expectRevert(escrowExchange.reverseBuyerDeposit(0, {from: buyer}),  "the seller has deposited already CANNOT reverseDeposit")
   	})

   	it('allows buyer to reverse deposit successfully', async() => {
   		return EscrowExchange.deployed().then(function(instance){
   			escrowExchange.buyerDeposit(1, {from: buyer, value: depositValue});
   			const reverse_deposit_receipt = escrowExchange.reverseBuyerDeposit(1, {from: buyer});
   			return reverse_deposit_receipt
   		}).then(function(reverse_deposit_receipt){
   			expectEvent(reverse_deposit_receipt, 'BuyerDepositReversed', { msg: "the buyer has reversed their deposit" });
   			const retrieved_contract = escrowExchange.getContractForCurrentUser(1, {from: buyer});
   			return retrieved_contract
    	}).then(function(retrieved_contract){
    		assert.equal(retrieved_contract[7].toNumber(), 0, "the buyer has reversed their deposit")
    	})
   	})
	})

	describe('EscrowExchange SellerDeposit', async () => {
		// Tests for SellerDeposit

   	it('allows seller to deposit', async() => {
   		return EscrowExchange.deployed().then(function(instance){
   			const deposit_receipt = escrowExchange.sellerDeposit(1, {from: seller, value: depositValue});
   			return deposit_receipt
   		}).then(function(deposit_receipt){
   			expectEvent(deposit_receipt, 'SellerDeposited', { from: seller,  msg: "has made the required deposit of", amount: depositValue });
   			const retrieved_contract = escrowExchange.getContractForCurrentUser(1, {from: seller});
   			return retrieved_contract
    	}).then(function(retrieved_contract){
    		assert.equal(retrieved_contract[7].toNumber(), 1, "seller has deposited")
    	})
   	})

   	it('rejects seller deposit with invalid deposit parameter', async () => {
   		await expectRevert(escrowExchange.sellerDeposit(0, {from: seller, value: "1000"}),  "Invalid deposit")
   	})

   	it('rejects seller deposit because seller already deposited', async () => {
   		await expectRevert(escrowExchange.sellerDeposit(0, {from: seller, value: depositValue}),  "Seller already deposited")
   	})
	})

	describe('EscrowExchange ReverseSellerDeposit', async () => {
			// Tests for SellerDeposit
	})
})
