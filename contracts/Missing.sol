

// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract MissingPerson {
    struct Person {
        string name;
        uint age;
        uint height;
        string description;
        string division;
        uint relativeContactNumber;
    }

    mapping (uint => Person) public missingPersons;
    uint public personCount;

    function addMissingPerson(string memory name, uint age, uint height, string memory description, string memory division, uint relativeContactNumber) public {
        personCount++;
        missingPersons[personCount] = Person(name, age, height, description, division, relativeContactNumber);
    }
    
    constructor() {
        addMissingPerson("Zayed Humayun",23,170, "Blue shirt","Dhaka","01758205769")
        addMissingPerson("Shabab Kabab",23,170, "Red shirt","Dhaka","01758205760")
    }
   
}

