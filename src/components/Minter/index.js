import { useState, useContext, useEffect } from "react";
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

const Minter = () => {
  const { userData, mint } = useContext(DAppContext);
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    if(userData?.account) {
      setShowModal(false);
    }
  }, [userData?.account]);

  return (
    <div className="connect-btn-container">
      <h1>Account: {userData?.account}</h1>
      {!userData ? (
        <button type="button" onClick={toggleModal} className="connect-wallet">
          Connect Wallet
        </button>
      ) : (
        <button type="button" onClick={() => mint(2)} className="connect-wallet">
          Mint 1
        </button>
      )}
      {showModal && (
        <>
          <ConnectWalletModal setShowModal={setShowModal} />
          <div className="wallet--connection-modal_overlay" />
        </>
      )}
    </div>
  );
};

export default Minter;
