pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./EscrowFactory.sol";

contract EscrowExchange is EscrowFactory {

	event ContractCreated(address buyer, address seller, uint amount, uint deposit, uint signatureCount, string status);

	function getContractsForCurrentUser() public view returns (address[] memory, address[] memory, uint[] memory, uint[] memory, uint[] memory, string[] memory){
		EscrowContract[] memory currentUserContracts = contractsForUser[msg.sender];
		uint length = currentUserContracts.length;

		address[] memory buyers = new address[](length);
		address[] memory sellers = new address[](length);
		uint[] memory amounts = new uint[](length);
		uint[] memory deposits = new uint[](length);
		uint[] memory signatureCounts = new uint[](length);
		string[] memory statuses = new string[](length);

		for (uint i = 0; i < length; i++)
		{
			buyers[i] = (currentUserContracts[i].buyer);
			sellers[i] = (currentUserContracts[i].seller);
			amounts[i] = (currentUserContracts[i].amount);
			deposits[i] = (currentUserContracts[i].deposit);
			signatureCounts[i] = (currentUserContracts[i].signatureCount);
			statuses[i] = (checkStatus(uint(currentUserContracts[i].status)));
		}
        return (buyers, sellers, amounts, deposits, signatureCounts, statuses);
    }

    function createContract(address payable buyer, address payable seller, uint amount, uint deposit) public {
    	EscrowContract memory newContract = _createContract(buyer, seller, amount, deposit);
    	// For looping through contracts later on.
    	contractsForUser[buyer].push(newContract);
    	contractsForUser[seller].push(newContract);

    	emit ContractCreated(buyer, seller, amount, deposit, 0, "Open");
    }

    function checkStatus(uint id) public view returns (string memory){

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