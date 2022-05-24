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
    // address[] toTokens;
    string[] toSymbols;
    // string[] routesName;
    // uint128[] routesId;
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
    // require(gnosis.isContract(), "Exchange: not contract");
    _grantRole(DEFAULT_ADMIN_ROLE, gnosis);
    if (isTesting) _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  /// @notice  Retrieve all listed tokens with associated routes.  
  /// @dev First Function : Major Tokens
  ///      Second Function : Minor Tokens.
  /// @param /

  function getAllMajorCoins() external view returns(MajorRoute[] memory) {
    return majorCoins;
  }

  function getAllMinorCoins() external view returns(MinorRoute[] memory) {
    return minorCoins;
  }

  /// @notice  Bulk Add Listed Major Coins  
  /// @dev First Function : Major Tokens
  ///      Second Function : Minor Tokens.
  /// @param _newTokenToPush : tuple of matching struct

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

  /// @notice  Delete Listed Coins by Index.  
  /// @dev First Function : Major Tokens
  ///      Second Function : Minor Tokens.
  /// @param _tokenIndex : Index of token to delete.

  function deleteMajorCoin(uint256 _tokenIndex) 
  external 
  onlyRole(DEFAULT_ADMIN_ROLE)
  returns(MajorRoute[] memory) 
  {
    majorCoins[_tokenIndex] = majorCoins[majorCoins.length - 1];
    majorCoins.pop();
    return majorCoins;
  }

  function deleteMinorCoin(uint256 _tokenIndex) 
  external 
  onlyRole(DEFAULT_ADMIN_ROLE)
  returns(MinorRoute[] memory) 
  {
    minorCoins[_tokenIndex] = minorCoins[minorCoins.length - 1];
    minorCoins.pop();
    return minorCoins;
  }
}