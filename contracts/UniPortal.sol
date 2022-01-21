// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract UniPortal {
    uint256 totalUnis;
    uint256 private seed;

    event NewUni(address indexed from, uint256 timestamp, string message);

    struct Uni {
        address sender;
        string message;
        uint256 timestamp;
    }

    Uni[] unis;

    mapping(address => uint256) public lastUniSent;

    constructor() payable {
        console.log(
            "Suuuup, I am a contract and I am dumb as f, but I like receiving unis"
        );
        seed = (block.timestamp + block.difficulty) % 100;
    }

    function sendUni(string memory _message) public {
        require(
            lastUniSent[msg.sender] + 5 minutes < block.timestamp,
            "Wait 5m to send another uni"
        );

        lastUniSent[msg.sender] = block.timestamp;
        totalUnis += 1;
        console.log("%s has sent a uni!", msg.sender, _message);

        unis.push(Uni(msg.sender, _message, block.timestamp));

        seed = (block.difficulty + block.timestamp + seed) % 100;

        console.log("Random # generated: %d", seed);

        if (seed <= 50) {
            console.log("%s won!", msg.sender);
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        emit NewUni(msg.sender, block.timestamp, _message);
    }

    function getTotalUnis() public view returns (uint256) {
        console.log("We have received a total of %d unis!", totalUnis);
        return totalUnis;
    }

    function getAllUnis() public view returns (Uni[] memory) {
        return unis;
    }
}
