
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

Source Units Analyzed: **`23`**<br>
Source Units in Scope: **`23`** (**100%**)

| Type | File   | Logic Contracts | Interfaces | Lines | nLines | nSLOC | Comment Lines | Complex. Score | Capabilities |
|========|=================|============|=======|=======|===============|==============|  
| 📝 | contracts\Exchange.sol | 1 | **** | 660 | 570 | 358 | 119 | 339 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝 | contracts\TokenFetcher.sol | 1 | **** | 125 | 111 | 65 | 32 | 46 | **** |
| 📝🔍 | contracts\adapters\BalancerAdapter.sol | 1 | 3 | 202 | 153 | 126 | 5 | 125 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\Curve3CrvSwapAdapter.sol | 1 | 1 | 80 | 55 | 38 | 8 | 52 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\Curve3CryptoAdapter.sol | 1 | 1 | 88 | 55 | 38 | 6 | 54 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveCrvAdapter.sol | 1 | 1 | 78 | 45 | 32 | 5 | 40 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveCvxAdapter.sol | 1 | 1 | 78 | 45 | 32 | 5 | 40 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveCvxEthAdapter.sol | 1 | 1 | 81 | 49 | 37 | 8 | 46 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveEURAdapter.sol | 1 | 2 | 104 | 53 | 36 | 10 | 56 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveEURSUSDAdapter.sol | 1 | 1 | 65 | 33 | 23 | 5 | 36 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveEURtAdapter.sol | 1 | 1 | 88 | 56 | 38 | 15 | 50 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveFraxAdapter.sol | 1 | 2 | 128 | 84 | 61 | 12 | 73 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveFraxDolaAdapter.sol | 1 | 1 | 75 | 48 | 36 | 9 | 42 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveFraxUsdcAdapter.sol | 1 | 1 | 81 | 49 | 37 | 8 | 46 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveStEthAdapter.sol | 1 | 1 | 89 | 57 | 45 | 8 | 58 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveUstAdapter.sol | 1 | 2 | 128 | 84 | 61 | 12 | 71 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\CurveYCrvAdapter.sol | 1 | 1 | 82 | 49 | 37 | 5 | 40 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\PolygonCurve3Adapter.sol | 1 | 1 | 84 | 50 | 36 | 10 | 51 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | contracts\adapters\SushiswapAdapter.sol | 1 | 2 | 201 | 65 | 55 | 6 | 120 | **<abbr title='Payable Functions'>💰</abbr><abbr title='Initiates ETH Value Transfer'>📤</abbr>** |
| 📝🔍 | contracts\adapters\UniswapV3Adapter.sol | 1 | 1 | 68 | 50 | 38 | 5 | 34 | **<abbr title='Payable Functions'>💰</abbr>** |
| 🔍 | contracts\interfaces\IExchange.sol | **** | 1 | 23 | 12 | 9 | 5 | 8 | **<abbr title='Payable Functions'>💰</abbr>** |
| 🔍 | contracts\interfaces\IExchangeAdapter.sol | **** | 1 | 26 | 6 | 3 | 4 | 16 | **<abbr title='Payable Functions'>💰</abbr>** |
| 🔍 | contracts\interfaces\IWrappedEther.sol | **** | 1 | 30 | 5 | 3 | 1 | 26 | **<abbr title='Payable Functions'>💰</abbr>** |
| 📝🔍 | **Totals** | **20** | **27** | **2664**  | **1784** | **1244** | **303** | **1469** | **<abbr title='Payable Functions'>💰</abbr><abbr title='Initiates ETH Value Transfer'>📤</abbr>** |

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

- **Comment-to-Source Ratio:** On average there are`6.64` code lines per comment (lower=better).
- **ToDo's:** `0` 

#### <span id=t-components>Components</span>

| 📝Contracts   | 📚Libraries | 🔍Interfaces | 🎨Abstract |
|=============|===========|============|============|
| 20 | 0  | 27  | 0 |

#### <span id=t-exposed-functions>Exposed Functions</span>

This section lists functions that are explicitly declared public or payable. Please note that getter methods for public stateVars are not included.  

| 🌐Public   | 💰Payable |
|============|===========|
| 195 | 69  | 

| External   | Internal | Private | Pure | View |
|============|==========|=========|======|======|
| 177 | 87  | 4 | 23 | 24 |

#### <span id=t-statevariables>StateVariables</span>

| Total      | 🌐Public  |
|============|===========|
| 32  | 31 |

#### <span id=t-capabilities>Capabilities</span>

| Solidity Versions observed | 🧪 Experimental Features | 💰 Can Receive Funds | 🖥 Uses Assembly | 💣 Has Destroyable Contracts | 
|============|===========|===========|===========|
| `^0.8.11`<br/>`0.8.11`<br/>`^0.8.9`<br/>`^0.8.4` |  | `yes` | **** | **** | 

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
| @openzeppelin/contracts/interfaces/IERC20.sol | 14 |
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
| contracts\Exchange.sol | 53c6fb4ea51725b969f3b416789cac95c1c89784 |
| contracts\TokenFetcher.sol | f848b40b284ba41a90766a2d6da07dbc0d2348df |
| contracts\adapters\BalancerAdapter.sol | d9f07b50cc62771c566b399dc04077dfd0224090 |
| contracts\adapters\Curve3CrvSwapAdapter.sol | 7b12eddab2d88667a10f0aaf12650b9456831334 |
| contracts\adapters\Curve3CryptoAdapter.sol | 7f8de7ede7750bb0508880ef7310150bfbf38e1b |
| contracts\adapters\CurveCrvAdapter.sol | 63a2e0d72b061862bb3cc19425b70f9c55f0edf7 |
| contracts\adapters\CurveCvxAdapter.sol | 31dd00f00e0ff3b066123f4b847c176a03241159 |
| contracts\adapters\CurveCvxEthAdapter.sol | 5e046ba13ff3e6c2df3075a37bed5481a2701351 |
| contracts\adapters\CurveEURAdapter.sol | a121cb7516c5f29820cf0e5670623617bad01dc5 |
| contracts\adapters\CurveEURSUSDAdapter.sol | af41b4fd0935038646cfc96c405333bbd197532b |
| contracts\adapters\CurveEURtAdapter.sol | c18d3b4baace005eda007829ab46a6ce43dff640 |
| contracts\adapters\CurveFraxAdapter.sol | 4e9fd579f1f45e0ea82b4c97a19e72bac4386297 |
| contracts\adapters\CurveFraxDolaAdapter.sol | d5f340d77d1ca671d3556833e7693f80a425decd |
| contracts\adapters\CurveFraxUsdcAdapter.sol | 4fffac5afc6a4e4dd24de1db94d2031bdbe22135 |
| contracts\adapters\CurveStEthAdapter.sol | 1dcaab45b83a54f8c9f398eeb76fd46268a2028d |
| contracts\adapters\CurveUstAdapter.sol | 07b28338899d29086fe470f9e1fb0443d40d3b3f |
| contracts\adapters\CurveYCrvAdapter.sol | 119f3983ca3ad6347dec879455d80532860537d4 |
| contracts\adapters\PolygonCurve3Adapter.sol | 23d48b78b90b079d4df799be55575a1bcd256fb7 |
| contracts\adapters\SushiswapAdapter.sol | da847f96c54825a8b51316466174113496d23003 |
| contracts\adapters\UniswapV3Adapter.sol | a3ba5cb341fa9c59bd6a4604ca9a5de781d542ba |
| contracts\interfaces\IExchange.sol | 47abb358bbb471748c5ec4362718868e8b25caae |
| contracts\interfaces\IExchangeAdapter.sol | bb9780af8cded4971f44feea2f9bbb6c5daea654 |
| contracts\interfaces\IWrappedEther.sol | 6ae7b4bf98e5a2d004f1ccd39060faf3457d8f29 |


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
| **ICurveFraxDola** | Interface |  |||
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **CurveFraxDolaAdapter** | Implementation | IExchangeAdapter |||
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
| **ICurveCrv** | Interface |  |||
| └ | exchange | External ❗️ | 🛑  |NO❗️ |
| └ | add_liquidity | External ❗️ | 🛑  |NO❗️ |
| └ | remove_liquidity_one_coin | External ❗️ | 🛑  |NO❗️ |
||||||
| **CurveYCrvAdapter** | Implementation | IExchangeAdapter |||
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

