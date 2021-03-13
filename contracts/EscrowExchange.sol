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

	function getContractsForCurrentUser() public view returns (EscrowContracts[] memory){
        return contractsForUser[msg.sender];
    }

    function addContractAddressToRegistry (address _buyer, address _seller, string memory _contractAddress) public {
    	contractCount++;
    	EscrowContracts memory _contract = EscrowContracts(_contractAddress, Status.OPEN);
        contractsForUser[_buyer].push(_contract);
        contractsForUser[_seller].push(_contract);
    }
}