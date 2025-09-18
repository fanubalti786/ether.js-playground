import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { address, abi } from "../constant";

export default function Dapp() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [value, setValue] = useState(null);
  const [hash, setHash] = useState(null);

  // ✅ Connect Wallet
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
         const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const myContract = new ethers.Contract(address, abi, signer);

      setAccount(accounts[0]);
      setContract(myContract);

      console.log("Wallet Connected:", accounts[0]);
        
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
    const tx = await contract.setNumber(10);
    await tx.wait();
    console.log("Transaction confirmed ✅");
    setHash(tx.hash);
    readValue();
  };

  // ✅ Events
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
        setContract(null);
        setValue(null);
      });

      window.ethereum.on("chainChanged", async () => {
        console.log("Chain changed, contract reinitialized ✅");
      });
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-slate-900 via-purple-900 to-slate-800 p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 text-center text-white">
        <h2 className="text-3xl font-extrabold text-purple-300 drop-shadow mb-6">
          🦊 Blockchain Powered dApp
        </h2>

        {account ? (
          <div className="space-y-4">
            <p className="bg-slate-800/70 p-3 rounded-xl shadow border border-purple-400/30 text-sm break-all">
              <span className="text-purple-300 block mb-1">🔗 Connected Wallet:</span>
              {account}
            </p>

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
            <span className="text-purple-300 text-sm block">📊 Current Value in Smart Contract:</span>
            <span className="text-yellow-300 font-bold text-lg">{value}</span>
          </p>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-slate-900/80 p-4 rounded-xl border border-white/20 text-xs text-gray-300">
          ⚡ <span className="font-semibold text-purple-300">Note:</span>  
          This dApp doesn’t use a normal database. All actions (Read / Write) directly interact with an Ethereum Smart Contract on-chain.  
        </div>
      </div>
    </div>
  );
}
