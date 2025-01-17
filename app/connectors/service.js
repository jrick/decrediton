import { connect } from "react-redux";
import { selectorMap } from "../fp";
import { walletService, isMainNet, isTestNet } from "../selectors";

const mapStateToProps = selectorMap({
  walletService,
  isMainNet,
  isTestNet
});

export default connect(mapStateToProps);
