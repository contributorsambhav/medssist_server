// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Request {
    uint256 public requestCount = 0;
    uint256 public activeRequestCount = 0;

    struct requestData {
        uint8 bloodGroup;
        uint256 id;
        address requester;
        uint256 units;
    }

    struct reserveData {
        uint8 bloodGroup;
        uint256 id;
        address requester;
        uint256 units;
        address reserver;
    }
    
    reserveData[] private reserved;
    requestData[] private requests;
    requestData[] private activeRequests;
    
    function createRequest(uint8 bloodGroup, uint256 units) public {
        requestData memory r1 = requestData(bloodGroup, requestCount,msg.sender,units);

        requests.push(r1);  
        activeRequests.push(r1);
        activeRequestCount = activeRequests.length;
        requestCount = requests.length;
    }

    function fulfilRequest(uint256 id) public {
        for (uint i = 0; i < activeRequests.length; i++) {
            if (activeRequests[i].id == id) {
                activeRequests[i] = activeRequests[activeRequests.length - 1];
                activeRequests.pop();
                
                activeRequestCount = activeRequests.length;
                break;
            }
        }
    }

    function reserveRequest(uint256 id ) public {
        for (uint i=0; i<activeRequests.length ;i++){
            if (activeRequests[i].id == id){
                reserveData memory r1 = reserveData(
                    activeRequests[i].bloodGroup,activeRequests[i].id,activeRequests[i].requester,activeRequests[i].units,msg.sender);
            reserved.push(r1);
            }
            

        }
    }

    function showActiveRequests() public view returns(requestData[] memory) {
        return activeRequests;
    }

    function showAllRequests() public view returns(requestData[] memory) {
        return requests;
    }

    function showCurrentReservations() public view returns(reserveData[] memory) {
        return reserved;
    }
     
     
}