// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Registered {
    address payable public owner;
    
    constructor() {
        owner = payable(msg.sender);
    }
    
    modifier isOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    mapping(address => string) public register; 
    mapping(string => bool) private nameExists;
    address[] public registeredUsers;  

    function setName(string memory name) public {
        require(bytes(register[msg.sender]).length == 0, "Address already registered");
        require(!nameExists[name], "Name already taken");
        
        register[msg.sender] = name;
        nameExists[name] = true; 
        registeredUsers.push(msg.sender);  
    }

    function getName(address user) public view returns (string memory) {
        return register[user];
    }

    function getAllRegisteredUsers() public view isOwner returns (address[] memory, string[] memory) {
        uint256 length = registeredUsers.length;
        string[] memory names = new string[](length);
        
        for (uint i = 0; i < length; i++) {
            names[i] = register[registeredUsers[i]];
        }
        
        return (registeredUsers, names);
    }
}
