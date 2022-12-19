
[<img width="200" alt="get in touch with Consensys Diligence" src="https://user-images.githubusercontent.com/2865694/56826101-91dcf380-685b-11e9-937c-af49c2510aa0.png">](https://diligence.consensys.net)<br/>
<sup>
[[  🌐  ](https://diligence.consensys.net)  [  📩  ](mailto:diligence@consensys.net)  [  🔥  ](https://consensys.github.io/diligence/)]
</sup><br/><br/>



# Solidity Metrics for GetAlluo/exchange

## Table of contents

- [Scope](#t-scope)
    - [Source Units in Scope](#t-source-Units-in-Scope)
    - [Out of Scope](#t-out-of-scope)
        - [Excluded Source Units](#t-out-of-scope-excluded-source-units)
        - [Duplicate Source Units](#t-out-of-scope-duplicate-source-units)
        - [Doppelganger Contracts](#t-out-of-scope-doppelganger-contracts)
- [Report Overview](#t-report)
    - [Risk Summary](#t-risk)
    - [Source Lines](#t-source-lines)
    - [Inline Documentation](#t-inline-documentation)
    - [Components](#t-components)
    - [Exposed Functions](#t-exposed-functions)
    - [StateVariables](#t-statevariables)
    - [Capabilities](#t-capabilities)
    - [Dependencies](#t-package-imports)
    - [Totals](#t-totals)

## <span id=t-scope>Scope</span>

This section lists files that are in scope for the metrics report. 

- **Project:** `GetAlluo/exchange`
- **Included Files:** 
    - ``
- **Excluded Paths:** 
    - ``
- **File Limit:** `undefined`
    - **Exclude File list Limit:** `undefined`

- **Workspace Repository:** `unknown` (`undefined`@`undefined`)

### <span id=t-source-Units-in-Scope>Source Units in Scope</span>

Source Units Analyzed: **`22`**<br>
Source Units in Scope: **`22`** (**100%**)

| Type | File   | Logic Contracts | Interfaces | Lines | nLines | nSLOC | Comment Lines | Complex. Score | Capabilities |
|========|=================|============|=======|=======|===============|==============|  
| 📝 | contracts\Exchange.sol | 1 | **** | 665 | 570 | 358 | 119 | 339 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝 | contracts\ForceSender.sol | 1 | **** | 12 | 12 | 9 | 1 | 7 | **<abbr title='Payable Functions'>💰</abbr><abbr title='Destroyable Contract'>💣</abbr>** |
| 📝 | contracts\TokenFetcher.sol | 1 | **** | 133 | 111 | 65 | 32 | 46 | **** |
| 📝🔍 | contracts\adapters\BalancerAdapter.sol | 1 | 3 | 200 | 153 | 126 | 5 | 125 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\Curve3CrvSwapAdapter.sol | 1 | 1 | 78 | 55 | 38 | 8 | 52 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\Curve3CryptoAdapter.sol | 1 | 1 | 86 | 55 | 38 | 6 | 54 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveCrvAdapter.sol | 1 | 1 | 77 | 45 | 32 | 5 | 40 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveCvxAdapter.sol | 1 | 1 | 77 | 45 | 32 | 5 | 40 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveCvxEthAdapter.sol | 1 | 1 | 80 | 49 | 36 | 8 | 46 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveEURAdapter.sol | 1 | 2 | 102 | 53 | 36 | 10 | 56 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveEURSUSDAdapter.sol | 1 | 1 | 64 | 33 | 23 | 5 | 36 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveEURtAdapter.sol | 1 | 1 | 90 | 56 | 38 | 15 | 50 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveFraxAdapter.sol | 1 | 2 | 124 | 83 | 60 | 12 | 73 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveFraxUsdcAdapter.sol | 1 | 1 | 83 | 52 | 36 | 8 | 46 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveStEthAdapter.sol | 1 | 1 | 87 | 56 | 44 | 8 | 58 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveUstAdapter.sol | 1 | 2 | 124 | 83 | 60 | 12 | 71 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\PolygonCurve3Adapter.sol | 1 | 1 | 84 | 50 | 36 | 10 | 51 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\SushiswapAdapter.sol | 1 | 2 | 207 | 67 | 54 | 6 | 120 | **<abbr title='Payable Functions'>💰</abbr><abbr title='Initiates ETH Value Transfer'>📤</abbr>** |
| 📝🔍 | contracts\adapters\UniswapV3Adapter.sol | 1 | 1 | 65 | 49 | 37 | 5 | 34 | **<abbr title='Payable Functions'>💰</abbr>** |
| 🔍 | contracts\interfaces\IExchange.sol | **** | 1 | 23 | 12 | 9 | 5 | 8 | **<abbr title='Payable Functions'>💰</abbr>** |
| 🔍 | contracts\interfaces\IExchangeAdapter.sol | **** | 1 | 26 | 6 | 3 | 4 | 16 | **<abbr title='Payable Functions'>💰</abbr>** |
| 🔍 | contracts\interfaces\IWrappedEther.sol | **** | 1 | 30 | 5 | 3 | 1 | 26 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | **Totals** | **19** | **25** | **2517**  | **1700** | **1173** | **290** | **1394** | **<abbr title='Payable Functions'>💰</abbr><abbr title='Destroyable Contract'>💣</abbr><abbr title='Initiates ETH Value Transfer'>📤</abbr>** |

<sub>
Legend: <a onclick="toggleVisibility('table-legend', this)">[➕]</a>
<div id="table-legend" style="display:none">

<ul>
<li> <b>Lines</b>: total lines of the source unit </li>
<li> <b>nLines</b>: normalized lines of the source unit (e.g. normalizes functions spanning multiple lines) </li>
<li> <b>nSLOC</b>: normalized source lines of code (only source-code lines; no comments, no blank lines) </li>
<li> <b>Comment Lines</b>: lines containing single or block comments </li>
<li> <b>Complexity Score</b>: a custom complexity score derived from code statements that are known to introduce code complexity (branches, loops, calls, external interfaces, ...) </li>
</ul>

</div>
</sub>


#### <span id=t-out-of-scope>Out of Scope</span>

##### <span id=t-out-of-scope-excluded-source-units>Excluded Source Units</span>

Source Units Excluded: **`0`**

<a onclick="toggleVisibility('excluded-files', this)">[➕]</a>
<div id="excluded-files" style="display:none">
| File   |
|========|
| None |

</div>


##### <span id=t-out-of-scope-duplicate-source-units>Duplicate Source Units</span>

Duplicate Source Units Excluded: **`0`** 

<a onclick="toggleVisibility('duplicate-files', this)">[➕]</a>
<div id="duplicate-files" style="display:none">
| File   |
|========|
| None |

</div>

##### <span id=t-out-of-scope-doppelganger-contracts>Doppelganger Contracts</span>

Doppelganger Contracts: **`0`** 

<a onclick="toggleVisibility('doppelganger-contracts', this)">[➕]</a>
<div id="doppelganger-contracts" style="display:none">
| File   | Contract | Doppelganger | 
|========|==========|==============|


</div>


## <span id=t-report>Report</span>

### Overview

The analysis finished with **`0`** errors and **`0`** duplicate files.





#### <span id=t-risk>Risk</span>

<div class="wrapper" style="max-width: 512px; margin: auto">
			<canvas id="chart-risk-summary"></canvas>
</div>

#### <span id=t-source-lines>Source Lines (sloc vs. nsloc)</span>

<div class="wrapper" style="max-width: 512px; margin: auto">
    <canvas id="chart-nsloc-total"></canvas>
</div>

#### <span id=t-inline-documentation>Inline Documentation</span>

- **Comment-to-Source Ratio:** On average there are`6.5` code lines per comment (lower=better).
- **ToDo's:** `0` 

#### <span id=t-components>Components</span>

| 📝Contracts   | 📚Libraries | 🔍Interfaces | 🎨Abstract |
|=============|===========|============|============|
| 19 | 0  | 25  | 0 |

#### <span id=t-exposed-functions>Exposed Functions</span>

This section lists functions that are explicitly declared public or payable. Please note that getter methods for public stateVars are not included.  

| 🌐Public   | 💰Payable |
|============|===========|
| 184 | 64  | 

| External   | Internal | Private | Pure | View |
|============|==========|=========|======|======|
| 167 | 83  | 4 | 22 | 24 |

#### <span id=t-statevariables>StateVariables</span>

| Total      | 🌐Public  |
|============|===========|
| 29  | 25 |

#### <span id=t-capabilities>Capabilities</span>

| Solidity Versions observed | 🧪 Experimental Features | 💰 Can Receive Funds | 🖥 Uses Assembly | 💣 Has Destroyable Contracts | 
|============|===========|===========|===========|
| `0.8.11`<br/>`^0.8.11`<br/>`^0.8.9`<br/>`^0.8.4` |  | `yes` | **** | `yes` | 

| 📤 Transfers ETH | ⚡ Low-Level Calls | 👥 DelegateCall | 🧮 Uses Hash Functions | 🔖 ECRecover | 🌀 New/Create/Create2 |
|============|===========|===========|===========|===========|
| `yes` | **** | **** | **** | **** | **** | 

| ♻️ TryCatch | Σ Unchecked |
|============|===========|
| **** | **** |

#### <span id=t-package-imports>Dependencies / External Imports</span>

| Dependency / Import Path | Count  | 
|==========================|========|
| @openzeppelin/contracts/access/AccessControl.sol | 2 |
| @openzeppelin/contracts/interfaces/IERC20.sol | 12 |
| @openzeppelin/contracts/interfaces/IERC20Metadata.sol | 2 |
| @openzeppelin/contracts/security/ReentrancyGuard.sol | 1 |
| @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol | 2 |
| @openzeppelin/contracts/utils/Address.sol | 2 |
| @openzeppelin/contracts/utils/math/SafeCast.sol | 1 |
| hardhat/console.sol | 1 |

#### <span id=t-totals>Totals</span>

##### Summary

<div class="wrapper" style="max-width: 90%; margin: auto">
    <canvas id="chart-num-bar"></canvas>
</div>

##### AST Node Statistics

###### Function Calls

<div class="wrapper" style="max-width: 90%; margin: auto">
    <canvas id="chart-num-bar-ast-funccalls"></canvas>
</div>

###### Assembly Calls

<div class="wrapper" style="max-width: 90%; margin: auto">
    <canvas id="chart-num-bar-ast-asmcalls"></canvas>
</div>

###### AST Total

<div class="wrapper" style="max-width: 90%; margin: auto">
    <canvas id="chart-num-bar-ast"></canvas>
</div>

##### Inheritance Graph

<a onclick="toggleVisibility('surya-inherit', this)">[➕]</a>
<div id="surya-inherit" style="display:none">
<div class="wrapper" style="max-width: 512px; margin: auto">
    <div id="surya-inheritance" style="text-align: center;"></div> 
</div>
</div>

##### CallGraph

<a onclick="toggleVisibility('surya-call', this)">[➕]</a>
<div id="surya-call" style="display:none">
<div class="wrapper" style="max-width: 512px; margin: auto">
    <div id="surya-callgraph" style="text-align: center;"></div>
</div>
</div>

###### Contract Summary

<a onclick="toggleVisibility('surya-mdreport', this)">[➕]</a>
<div id="surya-mdreport" style="display:none">
 Sūrya's Description Report

 Files Description Table


|  File Name  |  SHA-1 Hash  |
|-------------|--------------|
| contracts\Exchange.sol | 142cc4f1fecc9f7d2d434ced37f01401a3f8138c |
| contracts\ForceSender.sol | 67de184efedd5d77ec03390acb4a0a60b6072e2e |
| contracts\TokenFetcher.sol | 48c8540186e8b7c6f334da05833c6e30d96041dd |
| contracts\adapters\BalancerAdapter.sol | e1659a380fbf30024adcde4922c4825e6b2ae950 |
| contracts\adapters\Curve3CrvSwapAdapter.sol | f4aad906689cb17737d4cf559803692155f44f93 |
| contracts\adapters\Curve3CryptoAdapter.sol | 6ba3f9aa038df760d0e15e6233e365501c0e2c65 |
| contracts\adapters\CurveCrvAdapter.sol | 91c2b850f94c0c514a0f1522f3d0b86d749da87b |
| contracts\adapters\CurveCvxAdapter.sol | cd95c9fc1c4c2edacb40d4b32863aebf680b766a |
| contracts\adapters\CurveCvxEthAdapter.sol | 6a7d2eec5facc5df9e38370b6178d9206c647202 |
| contracts\adapters\CurveEURAdapter.sol | 2d2899f03d5895559db1251151e4b8c98609dc2e |
| contracts\adapters\CurveEURSUSDAdapter.sol | 884f6376cd1e61c40de200fb2372a6e60f8e0ae0 |
| contracts\adapters\CurveEURtAdapter.sol | d135f042aebdcf0b78bb6b5a5acb3b147f13a3df |
| contracts\adapters\CurveFraxAdapter.sol | 5895e6828000f7c9a2cc556e3aa00fb94e450dba |
| contracts\adapters\CurveFraxUsdcAdapter.sol | fd07d96accc0406b61833f024979df80b9d858df |
| contracts\adapters\CurveStEthAdapter.sol | 3af86200ad5552e2ae0177ef8c30159fccebf7a6 |
| contracts\adapters\CurveUstAdapter.sol | b173ef2801097f32b924990ecc4b1e1f111b24b9 |
| contracts\adapters\PolygonCurve3Adapter.sol | c7318dc3dd5ffc13ddcca4f4e0c1ef016b87f057 |
| contracts\adapters\SushiswapAdapter.sol | 11eb6942a44ecea61723a06f5da53ab16d4c8d50 |
| contracts\adapters\UniswapV3Adapter.sol | 7eb221fb628afbc5a34cdd4c5ce0920123ae68fe |
| contracts\interfaces\IExchange.sol | dd2b86706ddb250d77d7368225dafdc550d38da4 |
| contracts\interfaces\IExchangeAdapter.sol | 68bfda5477542a1c99984c765e2cddfce58d6c2f |
| contracts\interfaces\IWrappedEther.sol | fe611529a13c2f2e65f42e3c404f36ded73e6bb8 |


 Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **Exchange** | Implementation | ReentrancyGuard, AccessControl |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | exchange | External ❗️ |  💵 | nonReentrant |
| └ | registerAdapters | External ❗️ | 🛑  | onlyRole |
| └ | unregisterAdapters | External ❗️ | 🛑  | onlyRole |
| └ | createMinorCoinEdge | External ❗️ | 🛑  | onlyRole |
| └ | deleteMinorCoinEdge | External ❗️ | 🛑  | onlyRole |
| └ | createInternalMajorRoutes | External ❗️ | 🛑  | onlyRole |
| └ | deleteInternalMajorRoutes | External ❗️ | 🛑  | onlyRole |
| └ | removeApproval | External ❗️ | 🛑  | onlyRole |
| └ | createApproval | External ❗️ | 🛑  | onlyRole |
| └ | createLpToken | External ❗️ | 🛑  | onlyRole |
| └ | deleteLpToken | External ❗️ | 🛑  | onlyRole |
| └ | grantRole | Public ❗️ | 🛑  | onlyRole |
| └ | buildRoute | Public ❗️ |   |NO❗️ |
| └ | getMajorRoute | External ❗️ |   |NO❗️ |
| └ | _exchange | Private 🔐 | 🛑  | |
| └ | _enterLiquidityPool | Private 🔐 | 🛑  | |
| └ | _exitLiquidityPool | Private 🔐 | 🛑  | |
| └ | reverseRouteEdge | Private 🔐 |   | |
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
||||||
| **ForceSender** | Implementation |  |||
| └ | <Constructor> | Public ❗️ |  💵 |NO❗️ |
| └ | forceSend | External ❗️ | 🛑  |NO❗️ |
||||||
| **TokenFetcher** | Implementation | AccessControl |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | getAllMajorCoins | External ❗️ |   |NO❗️ |
| └ | getAllMinorCoins | External ❗️ |   |NO❗️ |
| └ | addMajorCoins | External ❗️ | 🛑  | onlyRole |
| └ | addMinorCoins | External ❗️ | 🛑  | onlyRole |
| └ | changeMajorCoinData | External ❗️ | 🛑  | onlyRole |
| └ | changeMinorCoinData | External ❗️ | 🛑  | onlyRole |
| └ | deleteMajorCoin | External ❗️ | 🛑  | onlyRole |
| └ | deleteMinorCoin | External ❗️ | 🛑  | onlyRole |
||||||
| **IBalancerStructs** | Interface |  |||
||||||
| **IBalancer** | Interface | IBalancerStructs |||
| └ | swap | External ❗️ |  💵 |NO❗️ |
| └ | joinPool | External ❗️ |  💵 |NO❗️ |
| └ | getPoolTokens | External ❗️ |   |NO❗️ |
| └ | exitPool | External ❗️ | 🛑  |NO❗️ |
||||||
| **IBalancerPool** | Interface |  |||
| └ | getPoolId | External ❗️ | 🛑  |NO❗️ |
||||||
| **BalancerAdapter** | Implementation | IExchangeAdapter, IBalancerStructs |||
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **ICurve3Crv** | Interface |  |||
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **Curve3CrvSwapAdapter** | Implementation | IExchangeAdapter |||
| └ | indexByCoin | Public ❗️ |   |NO❗️ |
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **ICurve3Crypto** | Interface |  |||
| └ | exchange | External ❗️ | 🛑  |NO❗️ |
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **Curve3CryptoAdapter** | Implementation | IExchangeAdapter |||
| └ | indexByCoin | Public ❗️ |   |NO❗️ |
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **ICurveCrv** | Interface |  |||
| └ | exchange | External ❗️ | 🛑  |NO❗️ |
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **CurveCrvAdapter** | Implementation |  |||
| └ | indexByCoin | Public ❗️ |   |NO❗️ |
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **ICurveCvx** | Interface |  |||
| └ | exchange | External ❗️ | 🛑  |NO❗️ |
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **CurveCvxAdapter** | Implementation |  |||
| └ | indexByCoin | Public ❗️ |   |NO❗️ |
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **ICurveCvxEth** | Interface |  |||
| └ | exchange | External ❗️ | 🛑  |NO❗️ |
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **CurveCvxEthAdapter** | Implementation | IExchangeAdapter |||
| └ | indexByCoin | Public ❗️ |   |NO❗️ |
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **ICurveEURSUSD** | Interface |  |||
| └ | exchange | External ❗️ | 🛑  |NO❗️ |
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **ICurveEUR** | Interface |  |||
| └ | exchange | External ❗️ | 🛑  |NO❗️ |
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **CurveEURAdapter** | Implementation | IExchangeAdapter |||
| └ | indexByCoin | Public ❗️ |   |NO❗️ |
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **ICurveEURSUSD** | Interface |  |||
| └ | exchange | External ❗️ | 🛑  |NO❗️ |
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **CurveEURSUSDAdapter** | Implementation | IExchangeAdapter |||
| └ | indexByCoin | Public ❗️ |   |NO❗️ |
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **ICurveEURt** | Interface |  |||
| └ | exchange_underlying | External ❗️ | 🛑  |NO❗️ |
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **CurveEURtAdapter** | Implementation |  |||
| └ | indexByCoin | Public ❗️ |   |NO❗️ |
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **ICurveFrax** | Interface |  |||
| └ | exchange_underlying | External ❗️ | 🛑  |NO❗️ |
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **ICurve3Crv** | Interface |  |||
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **CurveFraxAdapter** | Implementation | IExchangeAdapter |||
| └ | indexByUnderlyingCoin | Public ❗️ |   |NO❗️ |
| └ | indexByCoin | Public ❗️ |   |NO❗️ |
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **ICurveFrax** | Interface |  |||
| └ | exchange | External ❗️ | 🛑  |NO❗️ |
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **CurveFraxUsdcAdapter** | Implementation | IExchangeAdapter |||
| └ | indexByCoin | Public ❗️ |   |NO❗️ |
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **ICurveStEth** | Interface |  |||
| └ | exchange | External ❗️ |  💵 |NO❗️ |
| └ | add_liquidity | External ❗️ |  💵 |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **CurveStEthAdapter** | Implementation | IExchangeAdapter |||
| └ | indexByCoin | Public ❗️ |   |NO❗️ |
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **ICurveUst** | Interface |  |||
| └ | exchange_underlying | External ❗️ | 🛑  |NO❗️ |
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **ICurve3Crv** | Interface |  |||
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **CurveUstAdapter** | Implementation |  |||
| └ | indexByUnderlyingCoin | Public ❗️ |   |NO❗️ |
| └ | indexByCoin | Public ❗️ |   |NO❗️ |
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **ICurve3Crv** | Interface |  |||
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
| └ | exchange_underlying | External ❗️ | 🛑  |NO❗️ |
||||||
| **PolygonCurve3Adapter** | Implementation | IExchangeAdapter |||
| └ | indexByCoin | Public ❗️ |   |NO❗️ |
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **IUniswapV2Pair** | Interface |  |||
| └ | name | External ❗️ |   |NO❗️ |
| └ | symbol | External ❗️ |   |NO❗️ |
| └ | decimals | External ❗️ |   |NO❗️ |
| └ | totalSupply | External ❗️ |   |NO❗️ |
| └ | balanceOf | External ❗️ |   |NO❗️ |
| └ | allowance | External ❗️ |   |NO❗️ |
| └ | approve | External ❗️ | 🛑  |NO❗️ |
| └ | transfer | External ❗️ | 🛑  |NO❗️ |
| └ | transferFrom | External ❗️ | 🛑  |NO❗️ |
| └ | DOMAIN_SEPARATOR | External ❗️ |   |NO❗️ |
| └ | PERMIT_TYPEHASH | External ❗️ |   |NO❗️ |
| └ | nonces | External ❗️ |   |NO❗️ |
| └ | permit | External ❗️ | 🛑  |NO❗️ |
| └ | MINIMUM_LIQUIDITY | External ❗️ |   |NO❗️ |
| └ | factory | External ❗️ |   |NO❗️ |
| └ | token0 | External ❗️ |   |NO❗️ |
| └ | token1 | External ❗️ |   |NO❗️ |
| └ | getReserves | External ❗️ |   |NO❗️ |
| └ | price0CumulativeLast | External ❗️ |   |NO❗️ |
| └ | price1CumulativeLast | External ❗️ |   |NO❗️ |
| └ | kLast | External ❗️ |   |NO❗️ |
| └ | mint | External ❗️ | 🛑  |NO❗️ |
| └ | burn | External ❗️ | 🛑  |NO❗️ |
| └ | swap | External ❗️ | 🛑  |NO❗️ |
| └ | skim | External ❗️ | 🛑  |NO❗️ |
| └ | sync | External ❗️ | 🛑  |NO❗️ |
| └ | initialize | External ❗️ | 🛑  |NO❗️ |
||||||
| **IExchangeAdapter** | Interface |  |||
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **SushiswapAdapter** | Implementation | IExchangeAdapter |||
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
| └ | getAmountOut | Internal 🔒 |   | |
||||||
| **ISwapRouter** | Interface |  |||
| └ | exactInputSingle | External ❗️ |  💵 |NO❗️ |
||||||
| **UniswapV3Adapter** | Implementation | IExchangeAdapter |||
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **IExchange** | Interface |  |||
| └ | exchange | External ❗️ |  💵 |NO❗️ |
| └ | buildRoute | External ❗️ |   |NO❗️ |
||||||
| **IExchangeAdapter** | Interface |  |||
| └ | executeSwap | External ❗️ |  💵 |NO❗️ |
| └ | enterPool | External ❗️ |  💵 |NO❗️ |
| └ | exitPool | External ❗️ |  💵 |NO❗️ |
||||||
| **IWrappedEther** | Interface |  |||
| └ | name | External ❗️ |   |NO❗️ |
| └ | approve | External ❗️ | 🛑  |NO❗️ |
| └ | totalSupply | External ❗️ |   |NO❗️ |
| └ | transferFrom | External ❗️ | 🛑  |NO❗️ |
| └ | withdraw | External ❗️ | 🛑  |NO❗️ |
| └ | decimals | External ❗️ |   |NO❗️ |
| └ | balanceOf | External ❗️ |   |NO❗️ |
| └ | symbol | External ❗️ |   |NO❗️ |
| └ | transfer | External ❗️ | 🛑  |NO❗️ |
| └ | deposit | External ❗️ |  💵 |NO❗️ |
| └ | allowance | External ❗️ |   |NO❗️ |


 Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |
 

</div>
____
<sub>
Thinking about smart contract security? We can provide training, ongoing advice, and smart contract auditing. [Contact us](https://diligence.consensys.net/contact/).
</sub>

