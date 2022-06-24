import { useState, useContext, useEffect } from "react";
import { DAppContext } from "../../context";
import ConnectWalletModal from '../ConnectWallet';
import "./index.css";

const Minter = () => {
  const { userData, mint, contractDetails, loading} = useContext(DAppContext);
  const [showModal, setShowModal] = useState(false);
  const [balancer, setBalancer] = useState(0);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    if(userData?.account) {
      setShowModal(false);
    }
  }, [userData?.account]);

  useEffect(() => {
    if(!!contractDetails) {
      const getUserBalance = async () => {
        const balance = await contractDetails.methods.balanceOf(userData?.account);
        setBalancer(Number(balance))
      }
     
      getUserBalance();
    }
  }, [contractDetails, userData?.account])
  
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
        </div>
      )}
      {!userData ? (
        <button type="button" onClick={toggleModal} className="btn-primary">
          Connect Wallet
        </button>
      ) : (
        <button type="button" onClick={() => mint(1)} className="btn-primary" disabled={loading}>
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
