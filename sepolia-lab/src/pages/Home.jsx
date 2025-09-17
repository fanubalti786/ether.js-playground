import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { address, abi } from "../constant";

// Static Providers for testing networks
const mainnetProvider = new ethers.JsonRpcProvider(
  "https://mainnet.infura.io/v3/cd17e0070c3c46f6976d83a912222862"
);
const sepoliaProvider = new ethers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/cd17e0070c3c46f6976d83a912222862"
);

// Test providers (just checking block numbers)
async function testProviders() {
  const mainnetBlock = await mainnetProvider.getBlockNumber();
  console.log("Mainnet block:", mainnetBlock);

  const sepoliaBlock = await sepoliaProvider.getBlockNumber();
  console.log("Sepolia block:", sepoliaBlock);
}

export default function Home() {
  const [account, setAccount] = useState(null);
  const [chainIdNumber, setChainIdNumber] = useState("");

  const connectWallet = async () => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        // Step 1: Create provider
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Step 2: Request accounts
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length === 0) {
          alert("No account found. Please login to MetaMask.");
          return;
        }

        setAccount(accounts[0]);

        // Step 3: Get chainId
        const chainIdHex = await window.ethereum.request({
          method: "eth_chainId",
        });
        const chainId = parseInt(chainIdHex, 16);
        setChainIdNumber(chainId);

        // Step 4: Get signer & contract instance
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(address, abi, signer);

        console.log("Wallet connected:", accounts[0]);
        console.log("Connected to chainId:", chainId);
        console.log("Contract initialized:", contract);
      } catch (error) {
        if (error.code === 4001) {
          alert("You rejected the connection request");
        } else {
          console.error("Error connecting:", error);
        }
      }
    } else {
      alert("MetaMask extension not detected! Please install MetaMask.");
    }
  };

  useEffect(() => {
    testProviders();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-3xl mb-2 font-bold text-blue-800">
        Welcome to Web3
      </h1>

      {account ? (
        <div className="text-center">
          <p>Connected: {account}</p>
          <p>Connected to chainId: {chainIdNumber}</p>
        </div>
      ) : (
        <button
          className="px-8 py-1.5 bg-black text-white border rounded-lg cursor-pointer 
          shadow-lg hover:scale-100 hover:bg-gray-500 hover:text-black"
          onClick={connectWallet}
        >
          Connect MetaMask
        </button>
      )}
    </div>
  );
}
