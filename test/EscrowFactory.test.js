const EscrowFactory = artifacts.require("../contracts/EscrowFactory.sol")

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

require('chai').use(require('chai-as-promised')).should()

contract("EscrowFactory", ([deployer, buyer, seller]) => {
  let contract;
  let contract2;
  let depositValue = "10"
  let amountValue = "10"
  let depositValue2 = "15"
  let amountValue2 = "15"

  before(async() => {
    contract = await EscrowFactory.new(buyer, seller, amountValue, depositValue, "Some notes")
    contract2 = await EscrowFactory.new(buyer, seller, amountValue2, depositValue2, "Some notes")
  })

  describe('EscrowFactory claimDeposits', async () => {
    it('rejects claimDeposits with buyer ', async () => {
      await expectRevert(contract.claimDeposits({from: buyer}),  "the buyer has not made a deposit for claimDeposits")
      await contract.buyerDeposit({from: buyer, value: depositValue});
    })

    it('rejects claimDeposits with seller ', async () => {
      await expectRevert(contract.claimDeposits({from: seller}),  "the seller has not made a deposit for claimDeposits")
      await contract.sellerDeposit({from: seller, value: depositValue});
    })

    it('allows ClaimDeposits for buyer ending with signatureCount = 1', async() => {
      var claimDeposit_receipt = await contract.claimDeposits({from: buyer});
      expectEvent(claimDeposit_receipt, 'DepositPartialClaim', { msg: "the deposit claim has 1 out of 2 necessary signatures" });
      var buyer_signature = await contract.getSignature(buyer)
      assert.equal(buyer_signature, 1, "signature[buyer] is 1")  
    })
  })
})