import { useContext } from "react";
import { DAppContext } from "../../context";
import Metamask from "../../assets/metamask.svg";
import WalletConnectImage from "../../assets/walletConnect.svg";
import "./index.css";

const ConnectWalletModal = () => {
  const { loading, connectBrowserWallet, connectToWalletConnect } =
    useContext(DAppContext);
  
  const handleWalletLogin = (e) => {
    const { proxy } = e.currentTarget.dataset;
    
    if (proxy === "walletConnect") {
      connectToWalletConnect();
      
      return;
    }
    connectBrowserWallet();
  };

  return (
    <div className="wallet--connection-modal">
      <div className="wallet--connection-modal_item_wrapper">
        <div
          onClick={handleWalletLogin}
          data-proxy="browserWallet"
          className="wallet--connection-modal_item"
        >
          <div className="wallet--connection-modal_img">
            <img src={Metamask} alt="" />
          </div>
          <h3 className="wallet--connection-modal_provider">Metamask</h3>
          <p className="wallet--connection-modal_description">
            Connect to your MetaMask Wallet
          </p>
        </div>
        <div
          data-proxy="walletConnect"
          className="wallet--connection-modal_item"
          onClick={handleWalletLogin}
        >
          <div className="wallet--connection-modal_img">
            <img src={WalletConnectImage} alt="" />
          </div>
          <h3 className="wallet--connection-modal_provider">WalletConnect</h3>
          <p className="wallet--connection-modal_description">
            Scan with WalletConnect to connect
          </p>
        </div>
        {loading && <div className="loader">Fetching...</div>}
      </div>
    </div>
  );
};

export default ConnectWalletModal;