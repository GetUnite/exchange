// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract TokenFetcher is AccessControl {
    using Address for address;

    // Listed Tokens
    MajorRoute[] majorCoins;
    MinorRoute[] minorCoins;

    struct MajorRoute {
        string fromSymbol;
        address fromToken;
        address[] toTokens;
        string[] toSymbols;
        string[] routesName;
        uint128[] routesId;
    }

    struct MinorRoute {
        string fromSymbol;
        address fromToken;
        address[] toTokens;
        string[] toSymbols;
        string[] routesName;
        uint128[] routesId;
    }

    constructor(address gnosis, bool isTesting) {
        require(gnosis.isContract(), "Exchange: not contract");
        _grantRole(DEFAULT_ADMIN_ROLE, gnosis);
        if (isTesting) _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Retrieve all major listed tokens with associated routes.
    /// @return Array of Major tokens
    function getAllMajorCoins() external view returns (MajorRoute[] memory) {
        return majorCoins;
    }

    /// @notice Retrieve all minor listed tokens with associated routes.
    /// @return Array of Minor tokens
    function getAllMinorCoins() external view returns (MinorRoute[] memory) {
        return minorCoins;
    }

    /// @notice Bulk Add Listed Major Coins
    /// @dev New Token pushed at last index
    /// @param _newTokenToPush Tuple of matching struct
    /// @return Array of new listed major tokens
    function addMajorCoins(MajorRoute[] memory _newTokenToPush)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (MajorRoute[] memory)
    {
        for (uint i = 0; i < _newTokenToPush.length; i++) {
            majorCoins.push(_newTokenToPush[i]);
        }
        return majorCoins;
    }

    /// @notice Bulk Add Listed Minor Coins
    /// @dev New Token pushed at last index
    /// @param _newTokenToPush Tuple of matching struct
    /// @return Array of new listed minor tokens
    function addMinorCoins(MinorRoute[] memory _newTokenToPush)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (MinorRoute[] memory)
    {
        for (uint i = 0; i < _newTokenToPush.length; i++) {
            minorCoins.push(_newTokenToPush[i]);
        }
        return minorCoins;
    }

    /// @notice Replace Listed Major Tokens Datas
    /// @dev All information must be rewritten  
    /// @param _indexOfToken Index of Token To Replace
    /// @param _newData New Struct
    /// @return Array of modified major tokens
    function changeMajorCoinData(
        uint256 _indexOfToken,
        MajorRoute memory _newData
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (MajorRoute[] memory) {
        majorCoins[_indexOfToken] = _newData;
        return majorCoins;
    }

    /// @notice Replace Listed Minor Tokens Datas
    /// @dev All information must be rewritten  
    /// @param _indexOfToken Index of Token To Replace
    /// @param _newData New Struct
    /// @return Array of modified major tokens
    function changeMinorCoinData(
        uint256 _indexOfToken,
        MinorRoute memory _newData
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (MinorRoute[] memory) {
        minorCoins[_indexOfToken] = _newData;
        return minorCoins;
    }

    /// @notice Delete Listed Major Token by Index.
    /// @dev Switch actual token's index to last one and delete it
    /// @param _tokenIndex Index of token to delete.
    /// @return Array of latest listed major tokens
    function deleteMajorCoin(uint256 _tokenIndex)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (MajorRoute[] memory)
    {
        majorCoins[_tokenIndex] = majorCoins[majorCoins.length - 1];
        majorCoins.pop();
        return majorCoins;
    }

    /// @notice Delete Listed Minor Token by Index.
    /// @dev Switch actual token's index to last one and delete it
    /// @param _tokenIndex Index of token to delete.
    /// @return Array of latest listed minor tokens
    function deleteMinorCoin(uint256 _tokenIndex)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (MinorRoute[] memory)
    {
        minorCoins[_tokenIndex] = minorCoins[minorCoins.length - 1];
        minorCoins.pop();
        return minorCoins;
    }
}
