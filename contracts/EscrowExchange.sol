pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

contract EscrowExchange {
	uint public contractCount = 0;

	mapping(address => EscrowContracts[]) public contractsForUser;

	enum Status { OPEN, PENDING, CLOSED }

	struct EscrowContracts {
	    string _address;
	    Status _status;
	}

	constructor() public {
	}

	function getContractsForCurrentUser(uint startID) public view returns (string[] memory, string[] memory){
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


    function addContractAddressToRegistry (address _buyer, address _seller, string memory _contractAddress) public {
    	contractCount++;
    	EscrowContracts memory _contract = EscrowContracts(_contractAddress, Status.OPEN);
        contractsForUser[_buyer].push(_contract);
        contractsForUser[_seller].push(_contract);
    }
}