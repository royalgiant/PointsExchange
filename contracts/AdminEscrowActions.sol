pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./EscrowFactory.sol";

contract AdminEscrowActions {
	uint adminNeededContractCount = 0;
	mapping(address => bool) public isAdmin;
	address payable public owner;
	mapping(uint => ThirdPartyNeededContract) public adminNeededContracts;

	modifier isAdministrator() {
        require(msg.sender == owner || isAdmin[msg.sender] == true, "administrator only");
        _;
    }

	struct ThirdPartyNeededContract {
		uint contractIndexOnEscrowExchange;
		uint8 completed;
		address contractAddress;
	}

	constructor() public {
		owner = msg.sender;
	}

	function contractInterventionRequest(uint index, string memory _notes, address escrow_factory_address) public {
    	adminNeededContracts[adminNeededContractCount] = ThirdPartyNeededContract(index, 0, escrow_factory_address);
    	adminNeededContractCount = adminNeededContractCount + 1;
    	EscrowFactory retrieved_contract = EscrowFactory(escrow_factory_address);
    	retrieved_contract.requestAdminAction(_notes);
    }

    function adminContractTakeAction(uint index, uint8 action, address escrow_factory_address) public isAdministrator {
    	EscrowFactory retrieved_contract = EscrowFactory(escrow_factory_address);
    	retrieved_contract.adminContractTakeAction(true, action);
    }

    function setAdmin(bool state, address newAdmin) public isAdministrator {
    	isAdmin[newAdmin] = state;
    }

    function getAdmin(address admin) public view returns (bool) {
    	return isAdmin[admin];
    }
}