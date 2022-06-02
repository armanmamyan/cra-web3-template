import React, { createContext, useState, useEffect } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import abi from "../output/abi.json";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";

const CONTRACT_ADDRESS = "0x0A69cEeB9aBCC8d0905Dd0458153a5d2262A8cD6";
const CORRECT_NET_ID = 1;

export const DAppContext = createContext(null);

export const DAppProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [contractDetails, setContractDetails] = useState(null);

  const connectToContract = async (provider, signer, userAddress) => {
    try {
      const instance = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
      const contractWithSigner = instance.connect(signer);
      let details = {};

      const {
        isActive,
        mintPrice,
        MAX_SUPPLY,
        tokensMinted = () => {},
      } = contractWithSigner;

      const isPublicSaleActive = await isActive();
      const totalSupplyNFT = await MAX_SUPPLY();
      const publicETHPrice = ethers.utils.formatEther(`${await mintPrice()}`);

      const alreadyMinted = await tokensMinted();

      details = {
        ...details,
        price: publicETHPrice,
        isPublicSaleActive,
        totalSupplyNFT,
        alreadyMinted,
        methods: contractWithSigner,
      };

      setContractDetails(details);
    } catch (error) {
      console.log(error, "Error");
    }
  };

  const connectToWalletConnect = async () => {
    setLoading(true);
    try {
      // 1. Create walletConnector
      const provider = new WalletConnectProvider({
        rpc: {
          1: "https://mainnet.infura.io/v3/506d7529be80444fb659aa0826bce6d6",
          4: "https://rinkeby.infura.io/v3/506d7529be80444fb659aa0826bce6d6",
        },
        qrcode: true,
      });

      await provider.enable();
      const web3Provider = new ethers.providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();
      const accounts = await signer.getAddress();
      const { chainId } = await web3Provider.getNetwork();

      setUserData({
        account: accounts[0],
        chainId,
      });

      setLoading(false);
      connectToContract(web3Provider, signer, accounts);
      provider.on("accountsChanged", (accounts) => {
        setUserData({
          ...userData,
          account: accounts[0],
        });
      });

      // Subscribe to chainId change
      provider.on("chainChanged", (chainId) => {
        setUserData({
          ...userData,
          chainId,
        });
      });

      // Subscribe to session disconnection
      provider.on("disconnect", (code, reason) => {
        console.log(code, reason);
      });
      return true;
    } catch (error) {
      setLoading(false);
      console.log(error);
      return false;
    }
  };

  const connectBrowserWallet = async () => {
    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const signer = web3Provider.getSigner();
      const accounts = await signer.getAddress();
      const { chainId } = await web3Provider.getNetwork();

      if (parseInt(chainId) !== CORRECT_NET_ID)
        return alert("Please change to MainNet");

      setUserData({
        account: accounts,
        chainId: Number(chainId),
      });
      await connectToContract(web3Provider, signer, accounts);
      return true;
    } catch (error) {
      console.log(error, "Error");
      return false;
    }
  };

  const mint = async (count = 1) => {
    try {
      const account = userData.account;
      if (!contractDetails) return toast.error(`No instance`);
      if (!account)
        return toast.error(`No account selected. Try reauthenticating`);
      if (!count) return toast.error(`No token count provided.`);

      const { isActive, freeMint, mintPrice } = contractDetails;
      const isPublicSaleActive = await isActive();
      const price = await mintPrice();
      let presaleCount = count;

      const cost = window.BigInt(`${count * price}`);

      const options = { value: cost };

      if (!isPublicSaleActive) return toast.error(`Sales has not start yet`);

      return await freeMint(presaleCount, options);
    } catch (error) {
      alert(error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  const resetTransactionHash = () => {
    setTransactionHash("");
  };


  return (
    <DAppContext.Provider
      value={{
        connectBrowserWallet,
        connectToWalletConnect,
        mint,
        loading,
        transactionHash,
        resetTransactionHash,
        contractDetails,
        userData,
      }}
    >
      {children}
    </DAppContext.Provider>
  );
};
