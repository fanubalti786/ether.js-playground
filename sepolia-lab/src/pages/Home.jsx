// ✅ Importing React tools and ethers.js library
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { address, abi } from "../constant"; // 📦 Your deployed smart contract constants (imported)

// ----------------------------------------------------------------------
// ✅ STEP 1: Create static JSON-RPC providers for public networks (Mainnet + Sepolia)
// ----------------------------------------------------------------------
// These are read-only providers — good for testing, fetching data, or displaying public info
const mainnetProvider = new ethers.JsonRpcProvider(
  "https://mainnet.infura.io/v3/cd17e0070c3c46f6976d83a912222862"
);

const sepoliaProvider = new ethers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/cd17e0070c3c46f6976d83a912222862"
);

// ----------------------------------------------------------------------
// ✅ STEP 2: Test provider connectivity (Optional)
// ----------------------------------------------------------------------
async function testProviders() {
  try {
    // 🔹 Fetch latest block numbers from both networks (just to confirm connection)
    const mainnetBlock = await mainnetProvider.getBlockNumber();
    console.log("Mainnet block:", mainnetBlock);

    const sepoliaBlock = await sepoliaProvider.getBlockNumber();
    console.log("Sepolia block:", sepoliaBlock);
  } catch (err) {
    console.error("Provider error:", err);
  }
}

// ----------------------------------------------------------------------
// ✅ STEP 3: Main React Component
// ----------------------------------------------------------------------
export default function Home() {
  // 🔹 React states to store current wallet info
  const [account, setAccount] = useState(null);      // Connected wallet address
  const [chainIdNumber, setChainIdNumber] = useState(""); // Current network ID (chainId)

  // ------------------------------------------------------------------
  // 🧩 FUNCTION: Connect Wallet (triggered when user clicks "Connect")
  // ------------------------------------------------------------------
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) { // ✅ Check if MetaMask is installed
      try {
        // 🔹 Request MetaMask to connect accounts (will open popup)
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length === 0) return alert("No account found.");

        // ✅ Save connected account to state
        setAccount(accounts[0]);

        // 🔹 Fetch current network's chainId (in hex)
        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
        // 🔹 Convert from hex → decimal
        setChainIdNumber(parseInt(chainIdHex, 16));

        console.log("Wallet connected:", accounts[0]);
      } catch (error) {
        // ⚠️ Handle user rejection or connection errors
        if (error.code === 4001) alert("Connection rejected");
        else console.error(error);
      }
    } else alert("MetaMask not detected!");
  };

  // ------------------------------------------------------------------
  // 🧩 FUNCTION: Disconnect Wallet (UI only)
  // ------------------------------------------------------------------
  // ❗ Note: MetaMask connection cannot be forcefully disconnected by code.
  // This only clears state from UI side.
  const disconnectWallet = () => {
    setAccount(null);
    setChainIdNumber("");
  };

  // ------------------------------------------------------------------
  // 🧩 useEffect: Automatically run when page loads
  // ------------------------------------------------------------------
  useEffect(() => {
    testProviders(); // ✅ Optional — just testing RPCs on load

    if (window.ethereum) {
      // 🔹 Function to handle when user changes their MetaMask account
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // User disconnected or removed permission
          setAccount(null);
        } else {
          // Set new account and update network ID
          setAccount(accounts[0]);
          const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
          setChainIdNumber(parseInt(chainIdHex, 16));
        }
      };

      // 🔹 Function to handle when user switches MetaMask network
      const handleChainChanged = (chainId) => {
        // Convert hex → decimal & update UI
        setChainIdNumber(parseInt(chainId, 16));
      };

      // 🔹 Auto check: Is wallet already connected from previous session?
      (async () => {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) handleAccountsChanged(accounts); // Auto reconnect
      })();

      // 🔹 Real-time event listeners
      window.ethereum.on("accountsChanged", handleAccountsChanged); // Detect account change
      window.ethereum.on("chainChanged", handleChainChanged);       // Detect network change

      // 🔹 Clean-up on component unmount (prevent duplicate listeners)
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []); // ✅ Run only once when component mounts

  // ------------------------------------------------------------------
  // 🧩 (Optional) Example Contract Interaction (commented)
  // ------------------------------------------------------------------
  // const practiceContract = async () => {
  //   const provider = new ethers.BrowserProvider(window.ethereum);
  //   const signer = await provider.getSigner();
  //   const contract = new ethers.Contract(address, abi, signer);
  //   console.log("Contract initialized:", contract);
  //
  //   // Example read/write:
  //   // const tx = await contract.setNumber(4);
  //   // await tx.wait();
  //   // const number = await contract.getNumber();
  //   // console.log("Number from contract:", number.toString());
  // };

  // ------------------------------------------------------------------
  // ✅ RETURN: UI Section
  // ------------------------------------------------------------------
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-pink-50 via-purple-50 to-pink-100 p-6">
      <div className="relative w-full max-w-md bg-white/60 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl p-8 text-center overflow-hidden">

        {/* 💫 Decorative gradient glow at top */}
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-gradient-to-tr from-purple-400 via-pink-400 to-pink-200 rounded-full opacity-40 blur-3xl pointer-events-none"></div>

        <h1 className="relative text-4xl font-extrabold text-purple-700 mb-6 tracking-tight drop-shadow-md">
          🚀 Welcome to Web3
        </h1>

        {/* <button onClick={practiceContract} className="border px-8 py-1.5 rounded-lg cursor-pointer ">
          contract
        </button> */}

        {/* 🧩 Conditional Rendering: show wallet info or connect button */}
        {account ? (
          // ✅ Connected State
          <div className="relative space-y-5">
            {/* 🪪 Account Info Box */}
            <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/40 overflow-x-auto transition-transform transform hover:-translate-y-1 hover:scale-105">
              <p className="text-gray-800 font-semibold">
                <span className="text-sm text-gray-500">Connected Account:</span> <br />
                <span className="text-purple-600 break-all">{account}</span>
              </p>
            </div>

            {/* 🌐 Network Info Box */}
            <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/40 transition-transform transform hover:-translate-y-1 hover:scale-105">
              <p className="text-gray-800 font-semibold">
                <span className="text-sm text-gray-500">Chain ID:</span> <br />
                <span className="text-purple-600">{chainIdNumber}</span>
              </p>
            </div>

            {/* 🔴 Disconnect button */}
            <button
              className="px-6 py-3 mt-4 bg-pink-500/90 text-white font-bold rounded-2xl shadow-lg hover:bg-pink-600/90 hover:shadow-xl transition-all duration-300 w-full"
              onClick={disconnectWallet}
            >
              Disconnect
            </button>
          </div>
        ) : (
          // ❌ Not Connected State
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
