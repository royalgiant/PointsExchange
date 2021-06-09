pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./EscrowFactory.sol";

contract EscrowExchange {
	uint public contractCount = 0;
	mapping(address => uint[]) public addressToIndex;
	mapping(address => mapping(uint => bool)) public addressContractIndexExists;
	mapping(uint => EscrowFactory) public contractIndexesForUsers;

	// TOFIX
	event ContractCreated(address buyer, address seller, uint amount, uint deposit, uint signatureCount, string status, string notes, bool depositMade);

	function getContractForCurrentUser(uint index) public view returns (address, address, uint, uint, uint, string memory, string memory, uint, uint, uint, address){
		if (addressContractIndexExists[msg.sender][index]) {
	 		EscrowFactory retrieved_contract = contractIndexesForUsers[index];
		
	        return (retrieved_contract.getBuyer(), 
	        	retrieved_contract.getSeller(), 
	        	retrieved_contract.getAmount(), 
	        	retrieved_contract.getDeposit(), 
	        	retrieved_contract.getSignatureCount(),
	        	retrieved_contract.getContractStatus(), 
	        	retrieved_contract.getNotes(),
	        	retrieved_contract.getIfAddressDeposited(msg.sender),
	        	retrieved_contract.getAmountCheck(msg.sender),
	        	retrieved_contract.getSignature(msg.sender),
	        	address(retrieved_contract)
	        );
		}
    }

    function getContractCountForCurrentUser() external view returns (uint) {
    	if (addressToIndex[msg.sender].length == 0) {
    		return 0;
    	} else if (addressToIndex[msg.sender].length == 1) {
    		return addressToIndex[msg.sender].length;
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
    	EscrowFactory newContract = new EscrowFactory(buyer, seller, amount, deposit, notes);
    	contractIndexesForUsers[contractCount] = newContract;
    	addressToIndex[buyer].push(contractCount);
    	addressToIndex[seller].push(contractCount);
    	addressContractIndexExists[buyer][contractCount] = true;
    	addressContractIndexExists[seller][contractCount] = true;
    	contractCount = contractCount + 1;

    	emit ContractCreated(buyer, seller, amount, deposit, 0, "Open", notes, false);
    }
}