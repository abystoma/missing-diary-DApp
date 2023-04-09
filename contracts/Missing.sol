// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Missing {
    struct missing_person {
        string name;
        uint256 age;
        uint256 height;
        string description;
        string division;
        string contact;
    }
    event votedEvent(uint256 indexed missing_persons_count);
    mapping(uint => missing_person) public missing_persons;
    uint256 public missing_persons_count = 0;
    


    //Constructor
    constructor() {
        addMissingPerson("Zayed Humayun",23,170, "Blue shirt","Dhaka","01758205769");
        addMissingPerson("Shabab Kabab",23,170, "Red shirt","Chattogram","01758205760");
        addMissingPerson("user",23,170, "Black shirt","Dhaka","4214214");
        addMissingPerson("Anonymous",23,170, "Black shirt","Sylhet","01758205761");

    }
    function addMissingPerson(string memory name, uint256 age, uint  height, string memory description, string memory division, string memory contact) public {
        missing_persons_count++;
        missing_persons[missing_persons_count] = missing_person(name, age, height, description, division, contact);
    }
    function update(string memory name, uint256 age, uint  height, string memory description, string memory division, string memory contact) public {
        addMissingPerson(name, age, height, description, division, contact);
        emit votedEvent(missing_persons_count);
    }

}
