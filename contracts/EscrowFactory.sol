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

	mapping(address => EscrowContract[]) public contractsForUser;

	//storage
	struct EscrowContract {
	    address payable buyer;
	    address payable seller;
	    uint amount;
	    uint deposit;
	    uint signatureCount;
	    Status status;
	    mapping (address => uint) signatures;
	    mapping (address => uint) depositCheck;
	    mapping (address => uint) amountCheck;
	}

	function _getContract(uint contract_id) view internal returns (EscrowContract storage) {
    	return contractsForUser[msg.sender][contract_id];
    }

    //modifiers
    //only buyer can access
    modifier isBuyer(uint contract_id) {
        require(msg.sender == _getContract(contract_id).buyer);
        _;
    }
    
    //only seller can access
    modifier isSeller(uint contract_id) {
        require(msg.sender == _getContract(contract_id).seller);
        _;
    }
    
    //only the parties involved in the transaction can access.
    modifier isPartOfContract(uint contract_id) {
        require(msg.sender == _getContract(contract_id).seller || msg.sender == _getContract(contract_id).buyer);
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

    function _createContract(address payable _buyer, address payable _seller, uint _amount, uint _deposit) pure internal returns (EscrowContract memory){
    	return EscrowContract(_buyer, _seller, (_amount.mul(1 ether)), (_deposit.mul(1 ether)), 0,Status.OPEN);
	}

	/* Deposit function for the buyer - checks that the message sender
    is the buyer, the amount being sent is equal to the deposit amount
    and restricts the buyer from depositing more than once */
    function buyerDeposit(uint contract_id) public payable isBuyer(contract_id) {
        require(msg.value == _getContract(contract_id).deposit); // Require value submitted is equal to the deposit in the _contract.
        require(_getContract(contract_id).depositCheck[msg.sender] == 0); // Require buyer has not deposited yet
        _getContract(contract_id).depositCheck[msg.sender] = 1; // Set buyer deposited to true
        emit BuyerDeposited(msg.sender, "has made the required deposit of", msg.value);
    }

    /* Deposit function for the seller - checks that the message sender
    is the seller, the amount being sent is equal to the deposit amount
    and restricts the seller from depositing more than once */
    function sellerDeposit(uint contract_id) public payable isSeller(contract_id) {
        require(msg.value == _getContract(contract_id).deposit); // Require value submitted is equal to the deposit in the _contract.
        require(_getContract(contract_id).depositCheck[msg.sender] == 0); // Require seller has not deposited yet
        _getContract(contract_id).depositCheck[msg.sender] = 1;// Set seller deposited to true
        emit SellerDeposited(msg.sender, "has made the required deposit of", msg.value);
    }

    /* Function for buyer to retrieve deposit in the scenario where only the
    buyer has interacted with the contract and the transaction is no longer
    going ahead.*/
    
    function reverseBuyerDeposit(uint contract_id) public isBuyer(contract_id) {
        require(_getContract(contract_id).depositCheck[_getContract(contract_id).buyer] == 1);
        require(_getContract(contract_id).depositCheck[_getContract(contract_id).seller] == 0);
        require(_getContract(contract_id).amountCheck[_getContract(contract_id).buyer] == 0);
        _getContract(contract_id).depositCheck[_getContract(contract_id).buyer] = 0;
        _getContract(contract_id).buyer.transfer(_getContract(contract_id).deposit);
        emit BuyerDepositReversed("the buyer has reversed their deposit");
    }

    /* Function for seller to retrieve deposit in the scenario where only the
    seller has interacted with the contract and the transaction is no longer
    going ahead.*/
    
    function reverseSellerDeposit(uint contract_id) public isSeller(contract_id) {
        require(_getContract(contract_id).depositCheck[_getContract(contract_id).seller] == 1);
        require(_getContract(contract_id).depositCheck[_getContract(contract_id).buyer] == 0);
        require(_getContract(contract_id).amountCheck[_getContract(contract_id).buyer] == 0);
        _getContract(contract_id).depositCheck[_getContract(contract_id).seller] = 0;
        _getContract(contract_id).seller.transfer(_getContract(contract_id).deposit);
        emit SellerDepositReversed("the seller has reversed their deposit");
    }

    /* Function for both parties to reverse their deposits when both the buyer
    and seller have made their deposits but no longer wish to proceed, both must
    sign off on this by calling this function*/
 
    function claimDeposits(uint contract_id) public isPartOfContract(contract_id) {
        require(_getContract(contract_id).depositCheck[_getContract(contract_id).buyer] ==1);
        require(_getContract(contract_id).depositCheck[_getContract(contract_id).seller] == 1);
        require(_getContract(contract_id).amountCheck[_getContract(contract_id).buyer] == 0);
        require(_getContract(contract_id).signatures[msg.sender] == 0);
        _getContract(contract_id).signatures[msg.sender] = 1;
        _getContract(contract_id).signatureCount ++;
        
        if (_getContract(contract_id).signatureCount == 1) {
            emit DepositPartialClaim("the deposit claim has 1 out of 2 necessary signatures");
        }
        
        if (_getContract(contract_id).signatureCount == 2) {
            _getContract(contract_id).buyer.transfer(_getContract(contract_id).deposit);
            _getContract(contract_id).seller.transfer(_getContract(contract_id).deposit);
            _getContract(contract_id).depositCheck[_getContract(contract_id).buyer] = 0;
            _getContract(contract_id).depositCheck[_getContract(contract_id).seller] = 0;
            _getContract(contract_id).signatures[_getContract(contract_id).buyer] = 0;
            _getContract(contract_id).signatures[_getContract(contract_id).seller] = 0;
            _getContract(contract_id).signatureCount = 0;
            emit DepositsClaimed("the deposits have been returned");
        }
    }

    /* Function to allow the buyer to send the amount which is to eventually
    be transferred to the seller. Checks that the buyer is sending the correct
    amount, checks that both seller and buyer have made the required deposits 
    and restricts the buyer from making multiple payments */
    
    function sendAmount(uint contract_id) public payable isBuyer(contract_id) {
        require(msg.value == _getContract(contract_id).amount); // Check to see correct amount is sent.
        require(_getContract(contract_id).depositCheck[_getContract(contract_id).buyer] == 1);
        require(_getContract(contract_id).depositCheck[_getContract(contract_id).seller] == 1);
        require(_getContract(contract_id).amountCheck[msg.sender] == 0);
        _getContract(contract_id).amountCheck[msg.sender] = 1;
        emit AmountSent("Buyer has sent the payment amount to the escrow");
    }

    /* complete transaction: transferring specified amount to the seller and 
    returning deposits to both parties */
    /* NEW FUNCTION EXTRA: This should automatically pay seller when it passes expiry time (i.e. the flight time) and then automatically return deposits. Developer fee should be collected here */
    function paySeller(uint contract_id) public isBuyer(contract_id) {
        require(_getContract(contract_id).depositCheck[_getContract(contract_id).buyer] == 1);
        require(_getContract(contract_id).depositCheck[_getContract(contract_id).seller] == 1);
        require(_getContract(contract_id).amountCheck[_getContract(contract_id).buyer] == 1);
        _getContract(contract_id).seller.transfer(_getContract(contract_id).amount);
        _getContract(contract_id).buyer.transfer(_getContract(contract_id).deposit);
        _getContract(contract_id).seller.transfer(_getContract(contract_id).deposit);
        emit SellerPaid("The seller has been paid and all deposits have been returned - transaction complete");
    }

    /*cancel transaction: refunding the specified amount to the buyer and 
    returning deposits to both parties */
    /* NEW FUNCTION EXTRA: This can only be called before the expiry time. (i.e. 1 or 2 days before flight time) and then automatically return deposits. Developer fee should be collected here */
    function refundBuyer(uint contract_id) public isSeller(contract_id) {
        require(_getContract(contract_id).depositCheck[_getContract(contract_id).buyer] == 1);
        require(_getContract(contract_id).depositCheck[_getContract(contract_id).seller] == 1);
        require(_getContract(contract_id).amountCheck[_getContract(contract_id).buyer] == 1);
        _getContract(contract_id).buyer.transfer(_getContract(contract_id).amount);
        _getContract(contract_id).seller.transfer(_getContract(contract_id).deposit);
        _getContract(contract_id).buyer.transfer(_getContract(contract_id).deposit);
        emit BuyerRefunded("The buyer has been refunded and all deposits have been returned - transaction cancelled");
    }
}