pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./EscrowFactory.sol";

contract AdminEscrowActions {
	uint public adminNeededContractCount = 0;
	mapping(address => bool) public isAdmin;
	address payable public owner;
	mapping(uint => ThirdPartyNeededContract) public adminNeededContracts;
	mapping(address => bool) public RequestedHelpContractExists;

	event ContractInterventionRequestMade(string msg);
	event AdminContractActionTaken(string msg);

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

	function contractInterventionRequest(uint index, string memory _notes, address escrow_factory_contract_address) public {
    	if (RequestedHelpContractExists[escrow_factory_contract_address] == false) {
    		adminNeededContracts[adminNeededContractCount] = ThirdPartyNeededContract(index, 0, escrow_factory_contract_address); // Needs to change to perhaps use the contract address as index...
    		adminNeededContractCount = adminNeededContractCount + 1;
    		RequestedHelpContractExists[escrow_factory_contract_address] = true;
    	}
    	EscrowFactory retrieved_contract = EscrowFactory(escrow_factory_contract_address);
    	retrieved_contract.requestAdminAction(_notes);
    	emit ContractInterventionRequestMade("Admin Intervention Requested!");
    }

    function adminContractTakeAction(uint index, uint8 action, address escrow_factory_contract_address) public isAdministrator {
    	EscrowFactory retrieved_contract = EscrowFactory(escrow_factory_contract_address);
    	adminNeededContracts[index].completed = 1;
    	retrieved_contract.adminContractTakeAction(true, action);
    	emit AdminContractActionTaken("Admin has taken an action.");
    }

    function setAdmin(bool state, address newAdmin) public isAdministrator {
    	isAdmin[newAdmin] = state;
    }

    function getAdmin(address admin) public view returns (bool) {
    	return isAdmin[admin];
    }
}