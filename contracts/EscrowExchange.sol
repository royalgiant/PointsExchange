pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./EscrowFactory.sol";

contract EscrowExchange {
	uint public contractCount = 0;
	address payable public owner;
	mapping(address => bool) public isAdmin;
	mapping(address => uint[]) public addressToIndex; // i.e. [0, 4, 5, 6, 8, 10] contract indices
	mapping(address => mapping(uint => bool)) public addressContractIndexExists; // Booleans to check whether an contract index (i.e. contract id) exists for this user.
	mapping(uint => EscrowFactory) public contractIndexesForUsers; // Map of id to the contract. Used to retrieve the contract

	modifier isAdministrator() {
        require(msg.sender == owner || isAdmin[msg.sender] == true, "only an administrator is allowed to run this function");
        _;
    }

	event ContractCreated(address buyer, address seller, uint amount, uint deposit, uint signatureCount, string status, string notes, bool depositMade);

	constructor() public {
		owner = msg.sender;
	}

	function getContractForCurrentUser(uint index) public view returns (address, address, uint, uint, uint, string memory, string memory, uint, uint, uint, address){
		if (addressContractIndexExists[msg.sender][index]) {
	 		EscrowFactory retrieved_contract = contractIndexesForUsers[index];
		
	 		address seller = retrieved_contract.getSeller();
	 		address buyer = retrieved_contract.getBuyer();

	        return (buyer, 
	        	seller, 
	        	retrieved_contract.getAmount(), 
	        	retrieved_contract.getDeposit(), 
	        	retrieved_contract.getSignatureCount(),
	        	retrieved_contract.getContractStatus(), 
	        	retrieved_contract.getNotes(),
	        	retrieved_contract.getIfAddressDeposited(msg.sender),
	        	retrieved_contract.getAmountCheck(buyer),
	        	retrieved_contract.getSignature(msg.sender),
	        	address(retrieved_contract)
	        );
		}
    }

    /* PURPOSE: Return the index of the last contract for the user, so we know how many to iterate up to.
		If statement - the sender has no contracts, return 0, so we don't iterate.
		Else if statement - the sender has 1 contract, get the contract id, and iterate up to that id to get the contract details
		Else statement - sender has multiple contracts, get the contract id of the last contract in the array, we will iterate up to that contract id to get all their contracts.
    */
    function getContractCountForCurrentUser() external view returns (uint) {
    	if (addressToIndex[msg.sender].length == 0) {
    		return 0;
    	} else if (addressToIndex[msg.sender].length == 1) {
    		return addressToIndex[msg.sender][0] + 1;
    	} else {
	    	uint lastContractId = addressToIndex[msg.sender].length; // Get the length of the user's uint addressToIndex (array of contracts)
		    return addressToIndex[msg.sender][lastContractId - 1] + 1; // To access the last contract id user made, so we don't have to iterate entire contract array. We do +1 to take into account the user's last contract.
    	}
	 }

    function createContract(address payable buyer, address payable seller, uint amount, uint deposit, string memory notes) public {
    	require(buyer != address(0), "Invalid buyer address");
    	require(seller != address(0), "Invalid seller address");
    	require(amount > 0);
    	require(deposit > 0);
    	EscrowFactory newContract = new EscrowFactory(buyer, seller, amount, deposit, notes, owner);
    	contractIndexesForUsers[contractCount] = newContract;
    	addressToIndex[buyer].push(contractCount);
    	addressToIndex[seller].push(contractCount);
    	addressContractIndexExists[buyer][contractCount] = true;
    	addressContractIndexExists[seller][contractCount] = true;
    	contractCount = contractCount + 1;

    	emit ContractCreated(buyer, seller, amount, deposit, 0, "Open", notes, false);
    }

    function adminReverseContract(uint index) public isAdministrator{
    	EscrowFactory retrieved_contract = contractIndexesForUsers[index];
    	retrieved_contract.adminReverseContract(true);
    }

    function setAdmin(bool state, address newAdmin) public isAdministrator {
    	isAdmin[newAdmin] = state;
    }

    function getAdmin(address admin) public view returns (bool) {
    	return isAdmin[admin];
    }
}