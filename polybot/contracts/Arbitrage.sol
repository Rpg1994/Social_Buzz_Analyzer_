// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBalancer {
    function flashLoan(address recipient, uint256 amount, bytes calldata params) external;
}

interface IExchange {
    function swap(address from, address to, uint256 amount) external returns (uint256);
}

contract Arbitrage {
    address owner;
    IBalancer public balancer;
    IExchange public exchange;

    constructor(address _balancer, address _exchange) {
        owner = msg.sender;
        balancer = IBalancer(_balancer);
        exchange = IExchange(_exchange);
    }

    function executeTrade(address _from, address _to, uint256 _amount, uint256 _minProfit) external {
        require(msg.sender == owner, "Only owner can execute trades");
        bytes memory data = abi.encode(_from, _to, _amount, _minProfit);
        try balancer.flashLoan(address(this), _amount, data) {
            emit TradeExecuted(_from, _to, _amount, _minProfit);
        } catch (bytes memory _err) {
            emit TradeExecutionFailed(_from, _to, _amount, _minProfit, _err);
        }
    }

    function onFlashLoan(address _from, address _to, uint256 _amount, uint256 _minProfit) external {
        uint256 initialBalance = address(this).balance;
        uint256 returnedAmount;
        try exchange.swap(_from, _to, _amount) returns (uint256 _returnedAmount) {
            returnedAmount = _returnedAmount;
        } catch (bytes memory _err) {
            revert("Swap failed");
        }
        require(returnedAmount - _amount >= _minProfit, "Profit threshold not met");
        uint256 finalBalance = address(this).balance;
        require(finalBalance - initialBalance >= _minProfit, "Profit threshold not met after trade");
        // Repay the flash loan here, including any additional fees required
    }

    // Fallback function to receive ETH when the swap is successful
    receive() external payable {}

    event TradeExecuted(address indexed from, address indexed to, uint256 amount, uint256 minProfit);
    event TradeExecutionFailed(address indexed from, address indexed to, uint256 amount, uint256 minProfit, bytes error);
}