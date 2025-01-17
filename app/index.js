// @flow
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { Router, hashHistory } from "react-router";
import { syncHistoryWithStore } from "react-router-redux";
import injectTapEventPlugin from "react-tap-event-plugin";
import routes from "./routes";
import configureStore from "./store/configureStore";
import { getCfg } from "./config.js";
import "./style/main.less";

var cfg = getCfg();

var grpcport = "";
var neededBlocks = 0;
var today = new Date();
var startDate = new Date();
var totalDays = 0.0;
var foundStakePoolConfig = false;
var currentStakePoolConfig = cfg.get("stakepools");
var network = cfg.get("network");
var hiddenAccounts = cfg.get("hiddenaccounts");
if (currentStakePoolConfig !== undefined) {
  for (var i = 0; i < currentStakePoolConfig.length; i++) {
    if (currentStakePoolConfig[i].ApiKey && currentStakePoolConfig[i].Network == network) {
      foundStakePoolConfig = true;
      break;
    }
  }
}
if (currentStakePoolConfig == undefined) {
  setTimeout(currentStakePoolConfig = cfg.get("stakepools"), 1000);
}
var blocksPerDay = 0;
if (network == "testnet") {
  grpcport = cfg.get("wallet_port_testnet");
  startDate = new Date("03/15/2017");
  totalDays = (today.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24;
  blocksPerDay = 720;
  neededBlocks = totalDays * blocksPerDay * (0.95);
} else {
  startDate = new Date("02/08/2016");
  totalDays = (today.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24;
  blocksPerDay = 288;
  neededBlocks = totalDays * blocksPerDay * (0.95);
  grpcport = cfg.get("wallet_port");
}


var initialState = {
  settings: {
    currentSettings: {
      currencyDisplay: cfg.get("currency_display"),
      network: cfg.get("network"),
    },
    tempSettings: {
      currencyDisplay: cfg.get("currency_display"),
      network: cfg.get("network"),
    },
    settingsChanged: false,
  },
  stakepool: {
    currentStakePoolConfig: currentStakePoolConfig,
    currentStakePoolConfigRequest: false,
    currentStakePoolConfigError: null,
    currentStakePoolConfigSuccessMessage: "",
    activeStakePoolConfig: foundStakePoolConfig,
  },
  version: {
    // RequiredVersion
    requiredVersion: "4.20.0",
    versionInvalid: false,
    versionInvalidError: null,
    // VersionService
    versionService: null,
    getVersionServiceRequestAttempt: false,
    getVersionServiceError: "",
    // Balance
    getWalletRPCVersionError: null,
    getWalletRPCVersionRequestAttempt: false,
    getWalletRPCVersionResponse: null,
  },
  grpc: {
    // WalletService
    address: cfg.get("wallet_rpc_host"),
    port: grpcport,
    walletService: null,
    network: network,
    requiredStakepoolAPIVersion: 2,
    timeSinceString: null,
    // ints for mainnet and testnet protocol hex
    // TestNet2 CurrencyNet = 0x48e7a065
    testnet: 1223139429,
    // MainNet CurrencyNet = 0xd9b400f9
    mainnet: 3652452601,

    // GetWalletService
    getWalletServiceRequestAttempt: false,
    getWalletServiceError: "",
    // Balance
    getBalanceError: null,
    getBalanceRequestAttempt: false,
    balances: Array(),
    // AccountNumber
    getAccountNumberError: null,
    getAccountNumberRequestAttempt: false,
    getAccountNumberResponse: null,
    // Network
    getNetworkError: null,
    getNetworkRequestAttempt: false,
    getNetworkResponse: null,
    // Ping
    getPingError: null,
    getPingRequestAttempt: false,
    getPingResponse: null,
    // StakeInfo
    getStakeInfoError: null,
    getStakeInfoRequestAttempt: false,
    getStakeInfoResponse: null,
    // TicketPrice
    getTicketPriceError: null,
    getTicketPriceRequestAttempt: false,
    getTicketPriceResponse: null,
    // Accounts
    hiddenAccounts: hiddenAccounts,
    getAccountsError: null,
    getAccountsRequestAttempt: false,
    getAccountsResponse: null,

    // PaginateTransactions
    paginatedTxs: Array(),
    txPerPage: 8,
    currentPage: 0,
    transactionDetails: null,

    // GetTransactionInfo
    regularTransactionsInfo: Array(),
    coinbaseTransactionsInfo: Array(),
    ticketTransactionsInfo: Array(),
    voteTransactionsInfo: Array(),
    revokeTransactionsInfo: Array(),
    getTransactionsError: null,
    getTransactionsRequestAttempt: false,
    getTransactionsResponse: null,
    unminedTransactions: null,

    // Agenda/VoteChoices
    getAgendasResponse: null,
    getVoteChoicesResponse: null,
  },
  walletLoader: {
    rpcRetryAttempts: 0,
    neededBlocks: neededBlocks,
    curBlocks: 0,
    stepIndex: 0,
    // Loader
    getLoaderRequestAttempt: false,
    loader: null,
    getLoaderError: null,
    // WalletCreate
    createWalletExisting: false,
    confirmNewSeed: false,
    walletCreateRequestAttempt: false,
    walletCreateResponse: null,
    walletCreateError: null,
    walletCreateExisting: false,
    // WalletExist
    walletExistRequestAttempt: false,
    walletExistResponse: null,
    walletExistError: null,
    // WalletOpen
    walletOpenRequestAttempt: false,
    walletOpenResponse: null,
    walletOpenError: null,
    // WalletClose
    walletCloseRequestAttempt: false,
    walletClosedResponse: null,
    walletClosedError: null,
    // StartRpc
    startRpcRequestAttempt: false,
    startRpcResponse: null,
    startRpcError: null,
    // DiscoverAddress
    discoverAddressRequestAttempt: false,
    discoverAddressResponse: null,
    discoverAddressError: null,
    // SubscribeBlockNtfns
    subscribeBlockNtfnsRequestAttempt: false,
    subscribeBlockNtfnsResponse: null,
    subscribeBlockNtfnsError: null,
    // FetchHeaders
    fetchHeadersRequestAttempt: false,
    fetchHeadersResponse: null,
    fetchHeadersError: null,
  },
  notifications: {
    synced: true,
    currentHeight: 0,
    timeBackString: "",
    blocksPerDay: blocksPerDay,
    transactionNtfnsRequestAttempt: false,
    transactionNtfnsResponse: null,

    unmined: Array(),
    newUnminedMessage: null,

    accountNtfnsRequestAttempt: false,
    accountNtfnsResponse: null,
  },
  control: {
    // NextAddress
    getNextAddressRequestAttempt: false,
    getNextAddressResponse: null,
    getNextAddressError: null,
    // RenameAccount
    renameAccountRequestAttempt: false,
    renameAccountResponse: null,
    renameAccountSuccess: null,
    renameAccountError: null,
    // Rescan
    rescanRequestAttempt: false,
    rescaneRequest: null,
    rescanResponse: null,
    rescanError: null,
    // NextAccount
    getNextAccountRequestAttempt: false,
    getNextAccountResponse: null,
    getNextAccountSuccess: null,
    getNextAccountError: null,
    // ImportPrivateKey
    importPrivateKeyRequestAttempt: false,
    importPrivateKeyResponse: null,
    importPrivateKeyError: null,
    // ImportScript
    importScriptRequestAttempt: false,
    importScriptResponse: null,
    importScriptError: null,
    importScriptSuccess: "",
    // ChangePassphrase
    changePassphraseRequestAttempt: false,
    changePassphraseResponse: null,
    changePassphraseError: null,
    changePassphraseSuccess: "",
    // ChangePassphrase
    loadActiveDataFiltersRequestAttempt: false,
    loadActiveDataFiltersResponse: null,
    loadActiveDataFiltersError: null,
    // FundTransaction
    fundTransactionRequestAttempt: false,
    fundTransactionResponse: null,
    fundTransactionError: null,
    // SignTransaction
    signTransactionRequestAttempt: false,
    signTransactionRespsonse: null,
    signTransactionError: null,
    // PublishTransaction
    publishTransactionRequestAttempt: false,
    publishTransactionResponse: null,
    publishTransactionError: null,
    // PurchaseTicket
    purchaseTicketsRequestAttempt: false,
    purchaseTicketsResponse: null,
    purchaseTicketsSuccess: "",
    purchaseTicketsError: null,
    // RevokeTickets
    revokeTicketsRequestAttempt: false,
    revokeTicketsResponse: null,
    revokeTicketsSuccess: "",
    revokeTicketsError: null,

    // TicketBuyerService
    ticketBuyerService: null,
    // TicketBuyerConfig
    balanceToMaintain: cfg.get("balancetomaintain"),
    maxFee: cfg.get("maxfee"),
    maxPriceAbsolute: cfg.get("maxpriceabsolute"),
    maxPriceRelative: cfg.get("maxpricerelative"),
    maxPerBlock: cfg.get("maxperblock"),
    getTicketBuyerConfigRequestAttempt: false,
    getTicketBuyerConfigResponse: null,
    getTicketBuyerConfigSuccess: null,
    getTicketBuyerConfigError: null,
    // StartAutoBuyer
    startAutoBuyerRequestAttempt: false,
    startAutoBuyerResponse: null,
    startAutoBuyerSuccess: null,
    startAutoBuyerError: null,
    // StopAutoBuyer
    stopAutoBuyerRequestAttempt: false,
    stopAutoBuyerResponse: null,
    stopAutoBuyerSuccess: null,
    stopAutoBuyerError: null,
    // ConstructTransaction
    constructTxRequestAttempt: false,
    constructTxResponse: null,
    constructTxError: null,
  }
};

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

const store = configureStore(initialState);
const history = syncHistoryWithStore(hashHistory, store);

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById("root")
);
