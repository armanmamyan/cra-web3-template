import { useState, useContext, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { DAppContext } from "../../context";
import ConnectWalletModal from "../ConnectWallet";
import "./index.css";

const Minter = () => {
  const { userData, mint, contractDetails, loading, transactionHash } =
    useContext(DAppContext);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [balancer, setBalancer] = useState(0);
  const [isProcessingVerification, setIsProcessingVerification] =
    useState(false);
  const [showMessage, setShowMessage] = useState({
    show: false,
    isVerified: false,
  });

  const handleVerification = useCallback(async () => {
    try {
      setIsProcessingVerification(true);
      const response = await fetch(
        `/api/get-address-verification?address=${userData.account}`
      );
      const { isVerified, message } = await response.json();
      setShowMessage({
        show: true,
        isVerified,
        message,
      });
    } catch (e) {
      setIsProcessingVerification(false);
    }
  }, [userData]);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleMinter = useCallback(async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(
        `/api/get-address-proof?address=${userData.account}`
      );
      const { proof, message, verifiedAddress } = await response.json();

      if (!verifiedAddress) return toast.error(message);

      mint(1, proof);
      setIsProcessing(false);
    } catch (e) {
      console.log(e);
      setIsProcessing(false);
    }
  }, [userData?.account, mint]);

  useEffect(() => {
    if (userData?.account) {
      setShowModal(false);
    }
  }, [userData?.account]);

  useEffect(() => {
    if (!!contractDetails) {
      const getUserBalance = async () => {
        const balance = await contractDetails.methods.balanceOf(
          userData?.account
        );
        setBalancer(Number(balance));
      };

      getUserBalance();
    }
  }, [contractDetails, userData?.account]);

  return (
    <div className="connect-btn-container">
      {!!userData && !!contractDetails && (
        <div className="details">
          <h1>Account: {userData.account}</h1>
          <h2>Account Balance: {userData.accountBalance.toFixed(3)} Eth</h2>
          <h2>Collection Name: {contractDetails.collectionName}</h2>
          <h2>Account already minted: {balancer}</h2>
          <h2>Colection Price: {contractDetails.price} Ether</h2>
          <h2>Already Minted: {contractDetails.alreadyMinted || 0}</h2>
          {transactionHash && (
            <a href={`https://rinkeby.etherscan.io/tx/${transactionHash}`}>
              <h2>Transaction Hash</h2>
            </a>
          )}
        </div>
      )}
      {!userData ? (
        <button
          type="button"
          onClick={toggleModal}
          className="btn-primary btn-minter"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="merkle-container">
          <div className="merkle-verify">
            <h4>Check if your account is authorized</h4>
            <button
              id="verify"
              type="button"
              className="btn-primary"
              onClick={handleVerification}
            >
              {isProcessingVerification ? "loading" : "Verify"}
            </button>

            {showMessage.show && (
              <span
                className={`merkle-verified verify--${
                  showMessage.isVerified ? "success" : "error"
                }`}
              >
                {showMessage.message}
              </span>
            )}
            <button
              type="button"
              onClick={handleMinter}
              className="btn-primary btn-minter"
              disabled={loading}
            >
              {isProcessing ? "loading" : "Mint"}
            </button>
          </div>
        </div>
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
