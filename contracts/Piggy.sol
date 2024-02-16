// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./IERC20.sol";

error ZERO_ACCOUNT();
error ZERO_VALUE();
error EXCEED_LIMIT();
error N0T_ENOUGH_BALANCE();
error FAILED_TRANSACTION();

contract Piggy {
    mapping(address => uint256) savings;

    address ercToken;
    address owner;

    // event SavingSuccessful(address sender, uint256 amount);
    event SavingSuccessful(address indexed user, uint256 indexed amount);
    event WithdrawSuccessful(address receiver, uint256 amount);

    constructor(address _ERCToken) {
        ercToken = _ERCToken;
        owner = msg.sender;
    }

    // enum TokenType {Native, ERC20}
    enum TokenType {
        Ether,
        ERC20
    }

    //DEPOSIT TOKEN
    function depositToken(uint256 _amount) external {
        if (msg.sender == address(0)) {
            revert ZERO_ACCOUNT();
        }
        if (_amount <= 0) {
            revert ZERO_VALUE();
        }
        if (IERC20(ercToken).balanceOf(msg.sender) < _amount) {
            revert N0T_ENOUGH_BALANCE();
        }

        if (
            !IERC20(ercToken).transferFrom(msg.sender, address(this), _amount)
        ) {
            revert FAILED_TRANSACTION();
        }

        savings[msg.sender] = savings[msg.sender] + _amount;

        emit SavingSuccessful(msg.sender, _amount);
    }

    //WITHDRAW TOKEN
    function withdrawToken(uint256 _amount) external {
        if (msg.sender == address(0)) {
            revert ZERO_ACCOUNT();
        }
        if (_amount <= 0) {
            revert ZERO_VALUE();
        }

        uint256 _userSaving = savings[msg.sender];

        if (_userSaving < _amount) {
            revert EXCEED_LIMIT();
        }

        savings[msg.sender] = savings[msg.sender] - _amount;

        if (!IERC20(ercToken).transfer(msg.sender, _amount)) {
            revert FAILED_TRANSACTION();
        }

        emit WithdrawSuccessful(msg.sender, _amount);
    }

    // Deposit ETHERS
    function depositEthers() external payable {
        if (msg.sender == address(0)) {
            revert ZERO_ACCOUNT();
        }

        if (msg.value <= 0) {
            revert ZERO_VALUE();
        }
        savings[msg.sender] = savings[msg.sender] + msg.value;

        emit SavingSuccessful(msg.sender, msg.value);
    }

    //This function withdraws all ETHER savings
    function withdrawEthers() external {
        if (msg.sender == address(0)) {
            revert ZERO_ACCOUNT();
        }

        uint256 _userSavings = savings[msg.sender];

        if (_userSavings <= 0) {
            revert ZERO_VALUE();
        }

        savings[msg.sender] = savings[msg.sender] - _userSavings;

        payable(msg.sender).transfer(_userSavings);
    }

    // function checkSavings(address _user) external view returns (uint256) {
    //     return savings[_user];
    // }

    // function balanceOfToken(address _account) external view returns (uint256){
    //     return IERC20(ercToken).balanceOf(_account);
    // }

    function checkSavings(
        address _account,
        TokenType _tokenType
    ) external view returns (uint256) {
        if (_tokenType == TokenType.Ether) {
            return savings[_account];
        } else if (_tokenType == TokenType.ERC20) {
            return IERC20(ercToken).balanceOf(_account);
        } else {
            revert FAILED_TRANSACTION();
        }
    }

    function checkContractBal() external view returns (uint256) {
        return address(this).balance;
    }
}
