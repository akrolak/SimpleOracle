pragma solidity ^0.4.8;

// Simple example of using oracle

contract SimpleOracle {

	uint random;
	uint timestamp;

	event Query();
	event Response(uint _random, uint _oracleTime);

	function queryOracle() {	
		Query();
	}

	function registerResponse(uint rand, uint time) external {
		random = rand;
		timestamp = time;
		Response(rand, time);
	}

	function getResults() constant returns(uint rand, uint oracleTime) {
		rand = random;
		oracleTime = timestamp;
	}
}
