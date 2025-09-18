import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { address, abi } from "../constant";

// ✅ Static Providers for testing networks
const mainnetProvider = new ethers.JsonRpcProvider(
  "https://mainnet.infura.io/v3/cd17e0070c3c46f6976d83a912222862"
);
const sepoliaProvider = new ethers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/cd17e0070c3c46f6976d83a912222862"
);

// ✅ Test providers (just checking block numbers)
async function testProviders() {
  try {
    const mainnetBlock = await mainnetProvider.getBlockNumber();
    console.log("Mainnet block:", mainnetBlock);

    const sepoliaBlock = await sepoliaProvider.getBlockNumber();
    console.log("Sepolia block:", sepoliaBlock);
  } catch (err) {
    console.error("Provider error:", err);
  }
}

export default function Home() {
  const [account, setAccount] = useState(null);
  const [chainIdNumber, setChainIdNumber] = useState("");

  // Connect Wallet
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length === 0) return alert("No account found.");

        setAccount(accounts[0]);
        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
        setChainIdNumber(parseInt(chainIdHex, 16));
        console.log("Wallet connected:", accounts[0]);
      } catch (error) {
        if (error.code === 4001) alert("Connection rejected");
        else console.error(error);
      }
    } else alert("MetaMask not detected!");
  };

  // Disconnect Wallet (UI only)
  const disconnectWallet = () => {
    setAccount(null);
    setChainIdNumber("");
  };

  useEffect(() => {
    testProviders();

    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) setAccount(null);
        else {
          setAccount(accounts[0]);
          const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
          setChainIdNumber(parseInt(chainIdHex, 16));
        }
      };

      const handleChainChanged = (chainId) => setChainIdNumber(parseInt(chainId, 16));

      (async () => {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) handleAccountsChanged(accounts);
      })();

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  // const practiceContract = async () => {
  //   const provider = new ethers.BrowserProvider(window.ethereum)
  //   const signer = await provider.getSigner()
  //   const contract = new ethers.Contract(address,abi,signer)
  //   console.log("Contract initialized:", contract)
  //   // const tx = await contract.setNumber(4)
  //   // await tx.wait();
  //   const number = await contract.getNumber()
  //   console.log("Number from contract:", number.toString());
  // }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-pink-50 via-purple-50 to-pink-100 p-6">
  <div className="relative w-full max-w-md bg-white/60 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl p-8 text-center overflow-hidden">
    
    {/* Gradient top glow */}
    <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-gradient-to-tr from-purple-400 via-pink-400 to-pink-200 rounded-full opacity-40 blur-3xl pointer-events-none"></div>

    <h1 className="relative text-4xl font-extrabold text-purple-700 mb-6 tracking-tight drop-shadow-md">
      🚀 Welcome to Web3
    </h1>

    {/* <button onClick={practiceContract}
    // disabled={!account} 
    className="border px-8 py-1.5 rounded-lg cursor-pointer ">contract</button> */}

    {account ? (
      <div className="relative space-y-5">
        <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/40 overflow-x-auto transition-transform transform hover:-translate-y-1 hover:scale-105">
          <p className="text-gray-800 font-semibold">
            <span className="text-sm text-gray-500">Connected Account:</span> <br />
            <span className="text-purple-600 break-all">{account}</span>
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/40 transition-transform transform hover:-translate-y-1 hover:scale-105">
          <p className="text-gray-800 font-semibold">
            <span className="text-sm text-gray-500">Chain ID:</span> <br />
            <span className="text-purple-600">{chainIdNumber}</span>
          </p>
        </div>

        <button
          className="px-6 py-3 mt-4 bg-pink-500/90 text-white font-bold rounded-2xl shadow-lg hover:bg-pink-600/90 hover:shadow-xl transition-all duration-300 w-full"
          onClick={disconnectWallet}
        >
          Disconnect
        </button>
      </div>
    ) : (
      <button
        className="px-6 py-3 mt-6 bg-purple-600/90 text-white font-bold rounded-2xl shadow-lg hover:bg-purple-700/90 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-full"
        onClick={connectWallet}
      >
        Connect MetaMask
      </button>
    )}
  </div>
</div>


  );
}
