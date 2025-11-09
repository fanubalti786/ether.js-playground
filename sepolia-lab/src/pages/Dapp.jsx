import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { address, abi } from "../constant";

export default function Dapp() {
  const [account, setAccount] = useState(null);
  const [chainIdNumber, setChainIdNumber] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [contract, setContract] = useState(null);
  const [value, setValue] = useState(null);
  const [hash, setHash] = useState(null);

  // ✅ Connect Wallet
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const signer = await provider.getSigner();
        const myContract = new ethers.Contract(address, abi, signer);
        const network = await provider.getNetwork();

        setAccount(accounts[0]);
        setContract(myContract);
        setChainIdNumber(network.chainId.toString());
        setNetworkName(network.name);

        console.log("Wallet Connected:", accounts[0]);
        console.log("Network:", network.name, "ChainID:", network.chainId);
      } catch (error) {
        if (error.code === 4001) alert("Connection rejected");
        else console.error(error);
      }
    } else alert("MetaMask not detected!");
  };

  // ✅ Read function
  const readValue = async () => {
    if (!contract) return alert("Connect wallet first!");
    const num = await contract.getNumber();
    setValue(num.toString());
    console.log("Current value:", num.toString());
  };

  // ✅ Write function
  const writeValue = async () => {
    if (!contract) return alert("Connect wallet first!");
    const tx = await contract.setNumber(100);
    await tx.wait();
    console.log("Transaction confirmed ✅");
    setHash(tx.hash);
    readValue();
  };

  // ✅ Auto update when account or network changes
  useEffect(() => {
    if (window.ethereum) {
      // 🔹 Function to handle when user changes MetaMask account
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
        } else {
          // 🟩 FIX: added provider fallback for refresh
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();

          setAccount(accounts[0] || null);
          setChainIdNumber(network.chainId.toString());
          setNetworkName(network.name);
        }
      };

      // 🔹 Function to handle when user switches MetaMask network
      const handleChainChanged = async (chainId) => {
        // 🟩 FIX: added provider fallback for refresh
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();

        setNetworkName(network.name);
        setChainIdNumber(parseInt(chainId, 16));
      };

      // 🟩 FIX: Auto reconnect wallet on page refresh
      (async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);

        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const myContract = new ethers.Contract(address, abi, signer);
          const network = await provider.getNetwork();

          setContract(myContract);
          setAccount(accounts[0]);
          setChainIdNumber(network.chainId.toString());
          setNetworkName(network.name);

          console.log("🔁 Auto-reconnected to wallet:", accounts[0]);
        }
      })();

      // 🔹 Real-time event listeners
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // 🔹 Clean-up on component unmount
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []); // ✅ Runs only once when component mounts

  // 🟩 (Optional) Wrong network warning
  useEffect(() => {
    if (chainIdNumber && chainIdNumber !== "11155111") {
      console.warn("⚠️ You are not on Sepolia network");
    }
  }, [chainIdNumber]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-slate-900 via-purple-900 to-slate-800 p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 text-center text-white">
        <h2 className="text-3xl font-extrabold text-purple-300 drop-shadow mb-6">
          🦊 Blockchain Powered dApp
        </h2>

        {account ? (
          <div className="space-y-4">
            {/* ✅ Connected Wallet */}
            <p className="bg-slate-800/70 p-3 rounded-xl shadow border border-purple-400/30 text-sm break-all">
              <span className="text-purple-300 block mb-1">
                🔗 Connected Wallet:
              </span>
              {account}
            </p>

            {/* ✅ Network Info */}
            <p className="bg-slate-800/70 p-3 rounded-xl shadow border border-blue-400/30 text-sm">
              <span className="text-blue-300 block mb-1">🌐 Connected Network:</span>
              <span className="text-yellow-300 font-semibold">
                {networkName ? `${networkName} (${chainIdNumber})` : "Loading..."}
              </span>
            </p>

            {/* ✅ Last Transaction Hash */}
            {hash && (
              <p className="bg-green-900/50 p-3 rounded-xl shadow border border-green-400/30 text-sm break-all">
                <span className="text-green-300 block mb-1">✅ Last Tx Hash:</span>
                {hash}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700 hover:shadow-lg transition-all duration-300"
          >
            Connect Wallet
          </button>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={readValue}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
          >
            🔍 Read from Blockchain
          </button>
          <button
            onClick={writeValue}
            className="flex-1 py-3 bg-pink-600 text-white font-bold rounded-xl shadow-md hover:bg-pink-700 hover:shadow-lg transition-all duration-300"
          >
            ✍️ Write to Blockchain
          </button>
        </div>

        {value !== null && (
          <p className="mt-6 bg-slate-800/70 p-3 rounded-xl shadow border border-purple-400/30">
            <span className="text-purple-300 text-sm block">
              📊 Current Value in Smart Contract:
            </span>
            <span className="text-yellow-300 font-bold text-lg">{value}</span>
          </p>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-slate-900/80 p-4 rounded-xl border border-white/20 text-xs text-gray-300">
          ⚡ <span className="font-semibold text-purple-300">Note:</span>
          This dApp doesn’t use a normal database. All actions (Read / Write)
          directly interact with an Ethereum Smart Contract on-chain.
        </div>
      </div>
    </div>
  );
}
