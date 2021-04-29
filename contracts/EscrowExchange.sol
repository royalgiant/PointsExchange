pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./EscrowFactory.sol";

contract EscrowExchange is EscrowFactory {
	uint public contractCount = 0;
	mapping(address => uint[]) public addressToIndex;
	mapping(uint => EscrowFactory) public contractIndexesForUsers;

	// TOFIX
	event ContractCreated(address buyer, address seller, uint amount, uint deposit, uint signatureCount, uint depositCount, uint amountCount, string status, string notes, bool depositMade);

	// TOFIX
	function getContractForCurrentUser(uint index) public view returns (address, address, uint, uint, uint, uint, uint, string memory, string memory, uint){
		EscrowContract storage retrieved_contract = contractsForUser[msg.sender][index];

        return (retrieved_contract.buyer, 
        	retrieved_contract.seller, 
        	retrieved_contract.amount, 
        	retrieved_contract.deposit, 
        	retrieved_contract.signatureCount,
        	retrieved_contract.depositCount,
        	retrieved_contract.amountCount,
        	checkStatus(uint(retrieved_contract.status)), 
        	retrieved_contract.notes,
        	retrieved_contract.depositCheck[msg.sender]
        );
    }

    function getContractCountForCurrentUser() external view returns (uint) {
	    return addressToIndex[msg.sender].length;
	 }

    function createContract(address payable buyer, address payable seller, uint amount, uint deposit, string memory notes) public {

    	newContract = new EscrowFactory(buyer, seller, amount, deposit, notes);
    	// For looping through contracts later on.
    	contractIndexesForUsers[contractCount] = newContract;
    	addressToIndex[buyer].push(contractCount);
    	addressToIndex[seller].push(contractCount);
    	contractCount = contractCount.add(1);

    	emit ContractCreated(buyer, seller, amount, deposit, 0, 0, 0, "Open", notes, false);
    }


    // TOFIX
    function checkStatus(uint id) private view returns (string memory){

        string memory status = "";

        if (uint(contractsForUser[msg.sender][id].status) == 0){
            status = "Open";
        } else if (uint(contractsForUser[msg.sender][id].status) == 1){
            status = "Pending";
        } else{
            status = "Closed";
        }

        return (status);
    }
}