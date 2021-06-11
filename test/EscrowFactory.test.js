const EscrowFactory = artifacts.require("../contracts/EscrowFactory.sol")

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

require('chai').use(require('chai-as-promised')).should()

contract("EscrowFactory", ([deployer, buyer, seller]) => {
  let contractClaimDeposit;
  let contractBuyerSellerDeposit;
  let contractReverseBuyerDeposit;
  let contractReverseSellerDeposit;
  let contractSendAmount;
  let contractPaySeller;
  let contractRefundBuyer;
  let contract2;
  let depositValue = "10"
  let amountValue = "10"

  before(async() => {
    contractClaimDeposit = await EscrowFactory.new(buyer, seller, amountValue, depositValue, "Some notes")
    contractBuyerSellerDeposit = await EscrowFactory.new(buyer, seller, amountValue, depositValue, "Some notes")
    contractReverseBuyerDeposit = await EscrowFactory.new(buyer, seller, amountValue, depositValue, "Some notes")
    contractReverseSellerDeposit = await EscrowFactory.new(buyer, seller, amountValue, depositValue, "Some notes")
    contractSendAmount = await EscrowFactory.new(buyer, seller, amountValue, depositValue, "Some notes")
    contractPaySeller = await EscrowFactory.new(buyer, seller, amountValue, depositValue, "Some notes")
    contractRefundBuyer = await EscrowFactory.new(buyer, seller, amountValue, depositValue, "Some notes")
    contract2 = await EscrowFactory.new(buyer, seller, amountValue, depositValue, "Some notes")
  })

  describe('EscrowFactory BuyerDeposit', async () => {
    it('rejects buyerDeposit with Invalid deposit ', async () => {
      await expectRevert(contractBuyerSellerDeposit.buyerDeposit({from: buyer, value: "1000"}),  "Invalid deposit")
    })

    it('buyer deposits', async() => {
      var buyerDeposit_receipt = await contractBuyerSellerDeposit.buyerDeposit({from: buyer, value: depositValue});
      expectEvent(buyerDeposit_receipt, 'BuyerDeposited', {from: buyer, msg: "has made the required deposit of", amount: depositValue });
      var buyer_deposit = await contractBuyerSellerDeposit.getIfAddressDeposited(buyer)
      assert.equal(buyer_deposit, 1, "depositCheck[buyer] is 1")
      var balance = await contractBuyerSellerDeposit.getContractBalance()
      assert.equal(balance, parseInt(depositValue))
    })

    it('rejects buyerDeposit with Buyer already deposited ', async () => {
      await expectRevert(contractBuyerSellerDeposit.buyerDeposit({from: buyer, value: depositValue}),  "Buyer already deposited")
    })
  })

  describe('EscrowFactory SellerDeposit', async () => {
    it('rejects sellerDeposit with Invalid deposit ', async () => {
      await expectRevert(contractBuyerSellerDeposit.sellerDeposit({from: seller, value: "1000"}),  "Invalid deposit")
    })

    it('seller deposits', async() => {
      var sellerDeposit_receipt = await contractBuyerSellerDeposit.sellerDeposit({from: seller, value: depositValue});
      expectEvent(sellerDeposit_receipt, 'SellerDeposited', {from: seller, msg: "has made the required deposit of", amount: depositValue });
      var seller_deposit = await contractBuyerSellerDeposit.getIfAddressDeposited(seller)
      assert.equal(seller_deposit, 1, "depositCheck[seller] is 1")
      var balance = await contractBuyerSellerDeposit.getContractBalance()
      assert.equal(balance, parseInt(depositValue) + parseInt(depositValue))
    })

    it('rejects SellerDeposit with Seller already deposited ', async () => {
      await expectRevert(contractBuyerSellerDeposit.sellerDeposit({from: seller, value: depositValue}),  "Seller already deposited")
    })
  })

  describe('EscrowFactory ReverseBuyerDeposit', async () => {
    it('rejects ReverseBuyerDeposit with the buyer has not desposited CANNOT reverseDeposit', async () => {
      await expectRevert(contractReverseBuyerDeposit.reverseBuyerDeposit({from: buyer}),  "the buyer has not desposited CANNOT reverseDeposit")
    })

    it('succeeds', async() => {
      await contractReverseBuyerDeposit.buyerDeposit({from: buyer, value: depositValue});
      var balance = await contractReverseBuyerDeposit.getContractBalance()
      assert.equal(balance, depositValue)
      var buyerReverseDeposit_receipt = await contractReverseBuyerDeposit.reverseBuyerDeposit({from: buyer})
      expectEvent(buyerReverseDeposit_receipt, 'BuyerDepositReversed', {msg: "the buyer has reversed their deposit"});
      var buyer_reverse_deposit = await contractReverseBuyerDeposit.getIfAddressDeposited(buyer)
      assert.equal(buyer_reverse_deposit, 0, "depositCheck[buyer] is 0")
      var balance = await contractReverseBuyerDeposit.getContractBalance()
      assert.equal(balance, 0)
      await contractReverseBuyerDeposit.buyerDeposit({from: buyer, value: depositValue});
    })

    it('rejects ReverseBuyerDeposit with the the seller has deposited already CANNOT reverseDeposit', async () => {
      await contractReverseBuyerDeposit.sellerDeposit({from: seller, value: depositValue});
      await expectRevert(contractReverseBuyerDeposit.reverseBuyerDeposit({from: buyer}),  "the seller has deposited already CANNOT reverseDeposit")
    })
  })

  describe('EscrowFactory ReverseSellerDeposit', async () => {
    it('rejects ReverseSellerDeposit with the seller has not desposited CANNOT reverseDeposit', async () => {
      await expectRevert(contractReverseSellerDeposit.reverseSellerDeposit({from: seller}),  "the seller has not desposited CANNOT reverseDeposit")
    })

    it('succeeds', async() => {
      await contractReverseSellerDeposit.sellerDeposit({from: seller, value: depositValue});
      var balance = await contractReverseSellerDeposit.getContractBalance()
      assert.equal(balance, depositValue)
      var sellerReverseDeposit_receipt = await contractReverseSellerDeposit.reverseSellerDeposit({from: seller})
      expectEvent(sellerReverseDeposit_receipt, 'SellerDepositReversed', {msg: "the seller has reversed their deposit"});
      var seller_reverse_deposit = await contractReverseSellerDeposit.getIfAddressDeposited(seller)
      assert.equal(seller_reverse_deposit, 0, "depositCheck[seller] is 0")
      var balance = await contractReverseSellerDeposit.getContractBalance()
      assert.equal(balance, 0)
      await contractReverseSellerDeposit.sellerDeposit({from: seller, value: depositValue});
    })

    it('rejects ReverseSellerDeposit with the the buyer has deposited already CANNOT reverseDeposit', async () => {
      await contractReverseSellerDeposit.buyerDeposit({from: buyer, value: depositValue});
      await expectRevert(contractReverseSellerDeposit.reverseSellerDeposit({from: seller}),  "the buyer has deposited already CANNOT reverseDeposit")
    })
  })

  describe('EscrowFactory ClaimDeposits', async () => {
    it('rejects claimDeposits with buyer ', async () => {
      await expectRevert(contractClaimDeposit.claimDeposits({from: buyer}),  "the buyer has not made a deposit for claimDeposits")
      await contractClaimDeposit.buyerDeposit({from: buyer, value: depositValue});
    })

    it('rejects claimDeposits with seller ', async () => {
      await expectRevert(contractClaimDeposit.claimDeposits({from: seller}),  "the seller has not made a deposit for claimDeposits")
      await contractClaimDeposit.sellerDeposit({from: seller, value: depositValue});
      var balance = await contractClaimDeposit.getContractBalance()
      assert.equal(balance, parseInt(depositValue)+parseInt(depositValue))
    })

    it('allows ClaimDeposits for buyer ending with signatureCount = 1', async() => {
      var claimDeposit_receipt = await contractClaimDeposit.claimDeposits({from: buyer});
      expectEvent(claimDeposit_receipt, 'DepositPartialClaim', { msg: "the deposit claim has 1 out of 2 necessary signatures" });
      var buyer_signature = await contractClaimDeposit.getSignature(buyer)
      assert.equal(buyer_signature, 1, "signature[buyer] is 1")  
    })

    it('rejects claimDeposits with buyer signature already signed ', async () => {
      await expectRevert(contractClaimDeposit.claimDeposits({from: buyer}),  "the sender have already signed off on claimDeposit")
    })

    it('allows ClaimDeposits for seller ending with signatureCount = 0', async() => {
      var claimDeposit_receipt = await contractClaimDeposit.claimDeposits({from: seller});
      expectEvent(claimDeposit_receipt, 'DepositsClaimed', { msg: "the deposits have been returned" });
      var buyer_deposit = await contractClaimDeposit.getIfAddressDeposited(buyer)
      var seller_deposit = await contractClaimDeposit.getIfAddressDeposited(seller)
      var buyer_signature = await contractClaimDeposit.getSignature(buyer)
      var seller_signature = await contractClaimDeposit.getSignature(seller)
      var signature_count = await contractClaimDeposit.getSignatureCount()
      var balance = await contractClaimDeposit.getContractBalance()
      assert.equal(balance, 0)
      assert.equal(buyer_signature, 0, "depositCheck[buyer] is 0")
      assert.equal(seller_signature, 0, "depositCheck[seller] is 0")
      assert.equal(buyer_signature, 0, "signature[buyer] is 0")
      assert.equal(seller_signature, 0, "signature[seller] is 0")
      assert.equal(signature_count, 0, "signatureCount is 0")
      await contractClaimDeposit.buyerDeposit({from: buyer, value: depositValue});
      await contractClaimDeposit.sellerDeposit({from: seller, value: depositValue});
      await contractClaimDeposit.sendAmount({from: buyer, value: amountValue});
    })

    it('rejects claimDeposits with amountCheck ', async () => {
      await expectRevert(contractClaimDeposit.claimDeposits({from: buyer}),  "the buyer has already sent an amount for claimDeposits")
    })
  })

  describe('EscrowFactory SendAmount', async () => {
    it('rejects with invalid amount', async () => {
      await expectRevert(contractSendAmount.sendAmount({from: buyer, value: "1000"}),  "Invalid amount")
    })

    it('rejects with the buyer has not deposited yet', async () => {
      await expectRevert(contractSendAmount.sendAmount({from: buyer, value: amountValue}),  "the buyer has not deposited yet")
    })

    it('rejects with the seller has not deposited yet', async () => {
      await contractSendAmount.buyerDeposit({from: buyer, value: depositValue});
      await expectRevert(contractSendAmount.sendAmount({from: buyer, value: amountValue}),  "the seller has not deposited yet")
    })

    it('succeeds', async() => {
      await contractSendAmount.sellerDeposit({from: seller, value: depositValue});
      var send_amount = await contractSendAmount.sendAmount({from: buyer, value: amountValue})
      var amount_check = await contractSendAmount.getAmountCheck(buyer)
      assert.equal(amount_check, 1, "amountCheck[buyer] is 1")
      expectEvent(send_amount, 'AmountSent', {msg: "Buyer has sent the payment amount to the escrow"});
      var balance = await contractSendAmount.getContractBalance()
      assert.equal(balance, parseInt(depositValue) + parseInt(depositValue) + parseInt(amountValue))
    })

    it('rejects with the buyer has already send the amount', async () => {
      await expectRevert(contractSendAmount.sendAmount({from: buyer, value: amountValue}),  "the buyer has already send the amount")
    })
  })

  describe('EscrowFactory PaySeller', async () => {
    it('rejects with the buyer has not deposited yet', async () => {
      await expectRevert(contractPaySeller.paySeller({from: buyer}),  "the buyer has not deposited yet")
    })

    it('rejects with the seller has not deposited yet', async () => {
      await contractPaySeller.buyerDeposit({from: buyer, value: depositValue});
      await expectRevert(contractPaySeller.paySeller({from: buyer}),  "the seller has not deposited yet")
    })

    it('rejects with the buyer has not sent the amount yet', async () => {
      await contractPaySeller.sellerDeposit({from: seller, value: depositValue});
      await expectRevert(contractPaySeller.paySeller({from: buyer}),  "the buyer has not sent the amount yet")
    })

    it('succeeds', async() => {
      await contractPaySeller.sendAmount({from: buyer, value: amountValue})
      var pay_seller = await contractPaySeller.paySeller({from: buyer})
      expectEvent(pay_seller, 'SellerPaid', {msg: "The seller has been paid and all deposits have been returned - transaction complete"});
      var balance = await contractPaySeller.getContractBalance()
      assert.equal(balance, 0)
    })
  })

  describe('EscrowFactory RefundBuyer', async () => {
    it('rejects with the buyer has not deposited yet', async () => {
      await expectRevert(contractRefundBuyer.refundBuyer({from: seller}),  "the buyer has not deposited yet")
    })

    it('rejects with the seller has not deposited yet', async () => {
      await contractRefundBuyer.buyerDeposit({from: buyer, value: depositValue});
      await expectRevert(contractRefundBuyer.refundBuyer({from: seller}),  "the seller has not deposited yet")
    })

    it('rejects with the buyer has not sent the amount yet', async () => {
      await contractRefundBuyer.sellerDeposit({from: seller, value: depositValue});
      await expectRevert(contractRefundBuyer.refundBuyer({from: seller}),  "the buyer has not sent the amount yet")
    })

    it('succeeds', async() => {
      await contractRefundBuyer.sendAmount({from: buyer, value: amountValue})
      var refund_buyer = await contractRefundBuyer.refundBuyer({from: seller})
      expectEvent(refund_buyer, 'BuyerRefunded', {msg: "The buyer has been refunded and all deposits have been returned - transaction cancelled"});
      var balance = await contractRefundBuyer.getContractBalance()
      assert.equal(balance, 0)
    })
  })
   
})