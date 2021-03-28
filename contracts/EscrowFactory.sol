pragma solidity 0.5.16;

library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns(uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns(uint256) {
        assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns(uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns(uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

contract EscrowFactory {
	using SafeMath for uint256;

	enum Status { OPEN, PENDING, CLOSED }

	//storage
	struct EscrowContract {
	    address payable buyer;
	    address payable seller;
	    uint amount;
	    uint deposit;
	    uint signatureCount;
	    mapping (address => uint) signatures;
	    mapping (address => uint) depositCheck;
	    mapping (address => uint) amountCheck;
	    Status _status;
	}

    //modifiers
    //only buyer can access
    modifier isBuyer(EscrowContract memory _contract) {
        require(msg.sender == _contract.buyer);
        _;
    }
    
    //only seller can access
    modifier isSeller(EscrowContract memory _contract) {
        require(msg.sender == _contract.seller);
        _;
    }
    
    //only the parties involved in the transaction can access.
    modifier isPartOfContract(EscrowContract memory _contract) {
        require(msg.sender == _contract.seller || msg.sender == _contract.buyer);
        _;
    }

     //events
    event BuyerDeposited(address from, string msg, uint amount);
    event SellerDeposited(address from, string msg, uint amount);
    event BuyerDepositReversed(string msg);
    event SellerDepositReversed(string msg);
    event DepositPartialClaim(string msg);
    event DepositsClaimed(string msg);
    event AmountSent(string msg);
    event SellerPaid(string msg);
    event BuyerRefunded(string msg);

    function _createContract(address payable _buyer, address payable _seller, uint _amount, uint _deposit) internal returns (EscrowContract memory){
    	return EscrowContract(_buyer, _seller, (_amount.mul(1 ether)), (_deposit.mul(1 ether)), 0,address[],address[],address[],Status.OPEN);
	}

	/* Deposit function for the buyer - checks that the message sender
    is the buyer, the amount being sent is equal to the deposit amount
    and restricts the buyer from depositing more than once */
    function buyerDeposit(EscrowContract memory _contract) public payable isBuyer(_contract) {
        require(msg.value == _contract.deposit); // Require value submitted is equal to the deposit in the _contract.
        require(_contract.depositCheck[msg.sender] == 0); // Require buyer has not deposited yet
        _contract.depositCheck[msg.sender] = 1; // Set buyer deposited to true
        emit BuyerDeposited(msg.sender, "has made the required deposit of", msg.value);
    }

    /* Deposit function for the seller - checks that the message sender
    is the seller, the amount being sent is equal to the deposit amount
    and restricts the seller from depositing more than once */
    function sellerDeposit(EscrowContract memory _contract) public payable isSeller(_contract) {
        require(msg.value == _contract.deposit); // Require value submitted is equal to the deposit in the _contract.
        require(_contract.depositCheck[msg.sender] == 0); // Require seller has not deposited yet
        _contract.depositCheck[msg.sender] = 1;// Set seller deposited to true
        emit SellerDeposited(msg.sender, "has made the required deposit of", msg.value);
    }

    /* Function for buyer to retrieve deposit in the scenario where only the
    buyer has interacted with the contract and the transaction is no longer
    going ahead.*/
    
    function reverseBuyerDeposit(EscrowContract memory _contract) public isBuyer(_contract) {
        require(_contract.depositCheck[_contract.buyer] == 1);
        require(_contract.depositCheck[_contract.seller] == 0);
        require(_contract.amountCheck[_contract.buyer] == 0);
        _contract.depositCheck[_contract.buyer] = 0;
        _contract.buyer.transfer(_contract.deposit);
        emit BuyerDepositReversed("the buyer has reversed their deposit");
    }

    /* Function for seller to retrieve deposit in the scenario where only the
    seller has interacted with the contract and the transaction is no longer
    going ahead.*/
    
    function reverseSellerDeposit(EscrowContract memory _contract) public isSeller(_contract) {
        require(_contract.depositCheck[_contract.seller] == 1);
        require(_contract.depositCheck[_contract.buyer] == 0);
        require(_contract.amountCheck[_contract.buyer] == 0);
        _contract.depositCheck[_contract.seller] = 0;
        _contract.seller.transfer(_contract.deposit);
        emit SellerDepositReversed("the seller has reversed their deposit");
    }

    /* Function for both parties to reverse their deposits when both the buyer
    and seller have made their deposits but no longer wish to proceed, both must
    sign off on this by calling this function*/
 
    function claimDeposits(EscrowContract memory _contract) public isPartOfContract(_contract) {
        require(_contract.depositCheck[_contract.buyer] ==1);
        require(_contract.depositCheck[_contract.seller] == 1);
        require(_contract.amountCheck[_contract.buyer] == 0);
        require(_contract.signatures[msg.sender] == 0);
        _contract.signatures[msg.sender] = 1;
        _contract.signatureCount ++;
        
        if (_contract.signatureCount == 1) {
            emit DepositPartialClaim("the deposit claim has 1 out of 2 necessary signatures");
        }
        
        if (_contract.signatureCount == 2) {
            _contract.buyer.transfer(_contract.deposit);
            _contract.seller.transfer(_contract.deposit);
            _contract.depositCheck[_contract.buyer] = 0;
            _contract.depositCheck[_contract.seller] = 0;
            _contract.signatures[_contract.buyer] = 0;
            _contract.signatures[_contract.seller] = 0;
            _contract.signatureCount = 0;
            emit DepositsClaimed("the deposits have been returned");
        }
    }

    /* Function to allow the buyer to send the amount which is to eventually
    be transferred to the seller. Checks that the buyer is sending the correct
    amount, checks that both seller and buyer have made the required deposits 
    and restricts the buyer from making multiple payments */
    
    function sendAmount(EscrowContract memory _contract) public payable isBuyer(_contract) {
        require(msg.value == _contract.amount); // Check to see correct amount is sent.
        require(_contract.depositCheck[_contract.buyer] == 1);
        require(_contract.depositCheck[_contract.seller] == 1);
        require(_contract.amountCheck[msg.sender] == 0);
        _contract.amountCheck[msg.sender] = 1;
        emit AmountSent("Buyer has sent the payment amount to the escrow");
    }

    /* complete transaction: transferring specified amount to the seller and 
    returning deposits to both parties */
    /* NEW FUNCTION EXTRA: This should automatically pay seller when it passes expiry time (i.e. the flight time) and then automatically return deposits. Developer fee should be collected here */
    function paySeller(EscrowContract memory _contract) public isBuyer(_contract) {
        require(_contract.depositCheck[_contract.buyer] == 1);
        require(_contract.depositCheck[_contract.seller] == 1);
        require(_contract.amountCheck[_contract.buyer] == 1);
        _contract.seller.transfer(_contract.amount);
        _contract.buyer.transfer(_contract.deposit);
        _contract.seller.transfer(_contract.deposit);
        emit SellerPaid("The seller has been paid and all deposits have been returned - transaction complete");
    }

    /*cancel transaction: refunding the specified amount to the buyer and 
    returning deposits to both parties */
    /* NEW FUNCTION EXTRA: This can only be called before the expiry time. (i.e. 1 or 2 days before flight time) and then automatically return deposits. Developer fee should be collected here */
    function refundBuyer(EscrowContract memory _contract) public isSeller(_contract) {
        require(_contract.depositCheck[_contract.buyer] == 1);
        require(_contract.depositCheck[_contract.seller] == 1);
        require(_contract.amountCheck[_contract.buyer] == 1);
        _contract.buyer.transfer(_contract.amount);
        _contract.seller.transfer(_contract.deposit);
        _contract.buyer.transfer(_contract.deposit);
        emit BuyerRefunded("The buyer has been refunded and all deposits have been returned - transaction cancelled");
    }
}