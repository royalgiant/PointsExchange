pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./EscrowFactory.sol";

contract EscrowExchange is Escrow {
	mapping(address => EscrowContracts[]) public contractsForUser;

	function getContractsForCurrentUser(address user) public view returns (string[] memory, string[] memory){
		uint length;

		string[] memory addresses = new string[](length);
		string[] memory statuses = new string[](length);


		for (uint i = 0; i < length; i++)
		{
			addresses[i] = (contractsForUser[msg.sender][startID+i]._address);
			statuses[i] = (checkStatus(startID+i));
		}
        return (addresses, statuses);
    }

    function createContract(buyer, seller, amount, deposit) {
    	EscrowContract newContract = _createContract(buyer, seller, amount, deposit);
    	// For looping through contracts later on.
    	contractsForUser[buyer].push(newContract);
    	contractsForUser[seller].push(newContract);
    }

    function checkStatus(uint id) public view returns (string memory){

        string memory status = "";

        if (uint(contractsForUser[msg.sender][id]._status) == 0){
            status = "Open";
        } else if (uint(contractsForUser[msg.sender][id]._status) == 1){
            status = "Pending";
        } else{
            status = "Closed";
        }

        return (status);
    }
}