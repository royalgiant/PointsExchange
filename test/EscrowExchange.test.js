const EscrowExchange = artifacts.require("../contracts/EscrowExchange.sol")

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
	    let result, buyerContractsCount

	    before(async () => {
	      result = await escrowExchange.createContract(buyer, seller, web3.utils.toWei('1', 'Ether'), web3.utils.toWei('0.5', 'Ether'), { from: buyer })
	      buyerContractsCount = await escrowExchange.ownerContractCount(buyer)
	      sellerContractsCount = await escrowExchange.ownerContractCount(seller)
	    })

	    it('creates contract', async () => {
	      // SUCCESS
	      assert.equal(buyerContractsCount, 1)
	      assert.equal(sellerContractsCount, 1)
	      const event = result.logs[0].args
	      assert.equal(event.buyer, buyer, 'buyer is correct')
	      assert.equal(event.seller, seller, 'seller is correct')
	      assert.equal(event.amount, '1000000000000000000', 'amount is correct')
	      assert.equal(event.deposit, '500000000000000000', 'deposit is correct')
	      assert.equal(event.signatureCount, 0, 'signatureCount is correct')
	      assert.equal(event.status, "Open", 'status is correct')

	      // FAILURE: Product must have a buyer
	      // await await escrowExchange.createContract('', web3.utils.toWei('1', 'Ether'), { from: buyer }).should.be.rejected;
	      // FAILURE: Product must have a seller
	      // await await escrowExchange.createContract('iPhone X', 0, { from: buyer }).should.be.rejected;
	      // FAILURE: Product must have a amount
	      // FAILURE: Product must have a deposit


	      /* To replicate ON TRUFFLE CONSOLE, deploy the contract and run the following
			let accounts = await web3.eth.getAccounts()
			escrowExchange.createContract(accounts[0], accounts[1], "2000000000000000000", "1000000000000000000")
			
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
			contractInstance["5"]
	      */

	    })

	    it('gets contract', async () => {
	    	const result = await escrowExchange.getContractForCurrentUser(0, {from: buyer})
	    	assert.equal(result["0"], buyer, 'buyer is correct')
		    assert.equal(result["1"], seller, 'seller is correct')
		    assert.equal(result["2"].toString(), '1000000000000000000', 'amount is correct')
		    assert.equal(result["3"].toString(), '500000000000000000', 'deposit is correct')
		    assert.equal(result["4"].toNumber(), 0, 'signatureCount is correct')
		    assert.equal(result["5"], "Open", 'status is correct')
	    })

	    it('gets contract count with getContractCountForCurrentUser', async () => {
	    	const contractCount = await escrowExchange.getContractCountForCurrentUser({from: buyer})
	    	assert.equal(contractCount, 1, "correct count received")
	    })
	})

})