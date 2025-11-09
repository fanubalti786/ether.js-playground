import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { address1 as address, abi1 as abi } from "../constant";

export default function VaultRegistryApp() {
  const [account, setAccount] = useState(null);
  const [networkName, setNetworkName] = useState("");
  const [chainIdNumber, setChainIdNumber] = useState("");
  const [contract, setContract] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [newName, setNewName] = useState("");
  const [hash, setHash] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [contractBal, setContractBal] = useState(null);

  // ✅ Connect Wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const myContract = new ethers.Contract(address, abi, signer);
        const network = await provider.getNetwork();

        setAccount(accounts[0]);
        setContract(myContract);
        setNetworkName(network.name);
        setChainIdNumber(network.chainId.toString());
      } catch (err) {
        console.error(err);
        alert("Failed to connect wallet!");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // ✅ Register User
  const register = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!name || !age) return alert("Please fill all fields!");
    const tx = await contract.register(name, parseInt(age));
    await tx.wait();
    setHash(tx.hash);
    alert("🎉 User registered successfully!");
  };

  // ✅ Update User
  const updateUser = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!newName) return alert("Enter new name!");
    const tx = await contract.updateUser(newName);
    await tx.wait();
    setHash(tx.hash);
    alert("✅ Name updated successfully!");
  };

  // ✅ Get single user (current wallet)
  const getUser = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!account) return alert("No wallet connected!");
    try {
      const user = await contract.getUser(account);
      const formatted = {
        name: user.name,
        age: Number(user.age),
        wallet: user.wallet,
        balance: Number(user.balance),
      };
      setCurrentUser(formatted);
      console.log("Current user:", formatted);
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching current user. Are you registered?");
    }
  };

  // ✅ Get contract balance
  const contractBalance = async () => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const bal = await contract.contractBalance();
      setContractBal(Number(bal));
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching contract balance.");
    }
  };

  // ✅ Get all users
  const getAllUsers = async () => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const allUsers = await contract.getAllUsers();
      const formatted = allUsers.map((u) => ({
        name: u.name,
        age: Number(u.age),
        wallet: u.wallet,
        balance: Number(u.balance),
      }));
      setUsers(formatted);
      console.log("All users:", formatted);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    }
  };

  // ✅ Auto handle account/network change + reconnect after refresh
useEffect(() => {
  const initConnection = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);

      // 🆕 1️⃣ Check if wallet was already connected (refresh case)
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        const acc = accounts[0];
        setAccount(acc);

        // 🆕 2️⃣ Fetch current network info
        const network = await provider.getNetwork();
        setNetworkName(network.name);
        setChainIdNumber(Number(network.chainId));

        // 🆕 3️⃣ Auto-create contract instance again after refresh
        const signer = await provider.getSigner();
        const myContract = new ethers.Contract(address, abi, signer);
        setContract(myContract);
      }

      const handleAccountsChanged = async (accounts) => {
  if (accounts.length > 0) {
    setAccount(accounts[0]);
    const signer = await provider.getSigner();
    const myContract = new ethers.Contract(address, abi, signer);
    setContract(myContract);

    // 🧹 Clear form fields on wallet change
    setName("");
    setAge("");
    setUsers("");
    setContractBal(null);
    setCurrentUser(null)
    setHash(null);
  } else {
    setAccount(null);
    setContract(null);
  }
};

      // ✅ Handle chain/network changes dynamically
      const handleChainChanged = async (chainId) => {
        const network = await provider.getNetwork();
        setNetworkName(network.name);
        setChainIdNumber(parseInt(chainId, 16));

        // 🆕 Recreate contract after chain change
        const signer = await provider.getSigner();
        const myContract = new ethers.Contract(address, abi, signer);
        setContract(myContract);
      };

      // ✅ Register event listeners
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // ✅ Cleanup on component unmount
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  };

  initConnection(); // 🆕 Run once on load (auto reconnect + contract restore)
}, []);



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 text-white text-center">
        <h1 className="text-3xl font-extrabold text-purple-300 mb-8">
          🧾 Vault Registry dApp
        </h1>

        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full py-3 bg-purple-600 rounded-xl font-bold hover:bg-purple-700 transition"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            {/* Wallet & Network */}
            <div className="bg-slate-800/70 p-3 rounded-xl mb-4 text-sm">
              <span className="text-purple-300 block mb-1">Wallet:</span>
              <span className="break-all">{account}</span>
            </div>
            <div className="bg-slate-800/70 p-3 rounded-xl mb-4 text-sm">
              <span className="text-blue-300 block mb-1">Network:</span>
              {networkName} ({chainIdNumber})
            </div>

            {/* Register */}
            <div className="mt-6 text-left">
              <h2 className="text-xl font-bold text-yellow-300 mb-3">Register User</h2>
              <input
                type="text"
                placeholder="Enter name"
                className="w-full mb-3 p-2 rounded-lg text-black"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Enter age"
                className="w-full mb-4 p-2 rounded-lg text-black"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <button
                onClick={register}
                className="w-full py-2 bg-green-600 rounded-xl font-bold hover:bg-green-700 transition"
              >
                🧍 Register
              </button>
            </div>

            {/* Update */}
            <div className="mt-8 text-left">
              <h2 className="text-xl font-bold text-pink-300 mb-3">Update User Name</h2>
              <input
                type="text"
                placeholder="Enter new name"
                className="w-full mb-4 p-2 rounded-lg text-black"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button
                onClick={updateUser}
                className="w-full py-2 bg-pink-600 rounded-xl font-bold hover:bg-pink-700 transition"
              >
                ✏️ Update Name
              </button>
            </div>

            {/* Single User Info */}
            <div className="mt-8 text-left">
              <h2 className="text-xl font-bold text-orange-300 mb-3">My User Info</h2>
              <button
                onClick={getUser}
                className="w-full py-2 bg-orange-600 rounded-xl font-bold hover:bg-orange-700 transition mb-2"
              >
                👤 Load My Info
              </button>
              {currentUser && (
                <div className="bg-slate-800/60 p-3 rounded-xl text-sm border border-white/10 mb-4">
                  <p><b>Name:</b> {currentUser.name}</p>
                  <p><b>Age:</b> {currentUser.age}</p>
                  <p><b>Wallet:</b> {currentUser.wallet}</p>
                  <p><b>Balance:</b> {currentUser.balance}</p>
                </div>
              )}
            </div>

            {/* All Users */}
            <div className="mt-8 text-left">
              <h2 className="text-xl font-bold text-cyan-300 mb-3">All Registered Users</h2>
              <button
                onClick={getAllUsers}
                className="w-full py-2 bg-cyan-600 rounded-xl font-bold hover:bg-cyan-700 transition mb-4"
              >
                📜 Load All Users
              </button>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {users.length > 0 ? (
                  users.map((u, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/60 p-3 rounded-xl text-sm border border-white/10"
                    >
                      <p><b>Name:</b> {u.name}</p>
                      <p><b>Age:</b> {u.age}</p>
                      <p><b>Wallet:</b> {u.wallet}</p>
                      <p><b>Balance:</b> {u.balance}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No users found.</p>
                )}
              </div>
            </div>

            {/* Contract Balance */}
            <div className="mt-8 text-left">
              <h2 className="text-xl font-bold text-lime-300 mb-3">Contract Balance</h2>
              <button
                onClick={contractBalance}
                className="w-full py-2 bg-lime-600 rounded-xl font-bold hover:bg-lime-700 transition mb-2"
              >
                💰 Load Contract Balance
              </button>
              {contractBal !== null && (
                <div className="bg-slate-800/60 p-3 rounded-xl text-sm border border-white/10">
                  <p><b>Balance:</b> {contractBal}</p>
                </div>
              )}
            </div>

            {/* Last Tx */}
            {hash && (
              <div className="mt-8 bg-slate-800/70 p-3 rounded-xl border border-green-400/30 text-xs break-all">
                <span className="text-green-300 block mb-1">Last Tx Hash:</span>
                {hash}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
