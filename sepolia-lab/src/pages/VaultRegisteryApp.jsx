import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { address1 as address, abi1 as abi } from "../constant";

export default function VaultRegistryApp() {
  const [account, setAccount] = useState(null);
  const [networkName, setNetworkName] = useState("");
  const [chainIdNumber, setChainIdNumber] = useState("");
  const [contract, setContract] = useState(null);
  const [ownerAddress, setOwnerAddress] = useState("");

  // Inputs
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [newName, setNewName] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // State
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [contractBal, setContractBal] = useState(null);

  // TX hashes
  const [registerHash, setRegisterHash] = useState("");
  const [updateHash, setUpdateHash] = useState("");
  const [depositHash, setDepositHash] = useState("");
  const [withdrawHash, setWithdrawHash] = useState("");
  const [ownerWithdrawHash, setOwnerWithdrawHash] = useState("");

  const showError = (error) => alert(error.reason || "Transaction failed!");

  // Connect Wallet
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
        const owner = await myContract.owner();
        setOwnerAddress(owner);
      } catch (err) {
        console.error(err);
        alert("Failed to connect wallet!");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Register User
  const register = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!name || !age) return alert("Please fill all fields!");
    try {
      const tx = await contract.register(name, parseInt(age));
      await tx.wait();
      setRegisterHash(tx.hash);
      setName("");
      setAge("");
    } catch (error) {
      showError(error);
    }
  };

  // Update User
  const updateUser = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!newName) return alert("Enter new name!");
    try {
      const tx = await contract.updateUser(newName);
      await tx.wait();
      setUpdateHash(tx.hash);
      setNewName("");
    } catch (error) {
      showError(error);
    }
  };

  // Deposit
  const deposit = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!depositAmount || parseFloat(depositAmount) <= 0)
      return alert("Enter valid amount!");
    try {
      const tx = await contract.deposit({ value: ethers.parseEther(depositAmount) });
      await tx.wait();
      setDepositHash(tx.hash);
      setDepositAmount("");
    } catch (error) {
      showError(error);
    }
  };

  // Withdraw
  const withdraw = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0)
      return alert("Enter valid amount!");
    try {
      const tx = await contract.withdraw(ethers.parseEther(withdrawAmount));
      await tx.wait();
      setWithdrawHash(tx.hash);
      setWithdrawAmount("");
    } catch (error) {
      showError(error);
    }
  };

  // Withdraw all (Owner)
  const withdrawAllToOwner = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (account.toLowerCase() !== ownerAddress.toLowerCase())
      return alert("Only owner can use this!");
    try {
      const tx = await contract.withdrawAllToOwner();
      await tx.wait();
      setOwnerWithdrawHash(tx.hash);
    } catch (error) {
      showError(error);
    }
  };

  // Get User Info
  const getUser = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!account) return alert("No wallet connected!");
    try {
      const user = await contract.getUser(account);
      setCurrentUser({
        name: user.name,
        age: Number(user.age),
        wallet: user.wallet,
        balance: Number(user.balance),
      });
    } catch (error) {
      showError(error);
    }
  };

  // Get All Users
  const getAllUsers = async () => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const allUsers = await contract.getAllUsers();
      const formatted = allUsers.map(u => ({
        name: u.name,
        age: Number(u.age),
        wallet: u.wallet,
        balance: Number(u.balance),
      }));
      setUsers(formatted);
    } catch (error) {
      showError(error);
    }
  };

  // Contract Balance
  const contractBalance = async () => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const bal = await contract.contractBalance();
      setContractBal(Number(bal));
    } catch (error) {
      showError(error);
    }
  };

  // Auto handle accounts/network
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const acc = accounts[0];
          setAccount(acc);
          const network = await provider.getNetwork();
          setNetworkName(network.name);
          setChainIdNumber(Number(network.chainId));
          const signer = await provider.getSigner();
          const myContract = new ethers.Contract(address, abi, signer);
          setContract(myContract);
          const owner = await myContract.owner();
          setOwnerAddress(owner);
        }

        const handleAccountsChanged = async (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const signer = await provider.getSigner();
            const myContract = new ethers.Contract(address, abi, signer);
            setContract(myContract);
          } else {
            setAccount(null);
            setContract(null);
          }
        };

        const handleChainChanged = async (chainId) => {
          const network = await provider.getNetwork();
          setNetworkName(network.name);
          setChainIdNumber(parseInt(chainId, 16));
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);
        return () => {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        };
      }
    };
    init();
  }, []);

  // TX Box component
  const TxBox = ({ label, hash, color }) =>
    hash && (
      <div className={`p-2 mt-2 text-xs rounded border ${color} break-all`}>
        <span className="font-semibold">{label}</span>
        <a
          href={`https://sepolia.etherscan.io/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-400 hover:underline break-all"
        >
          {hash}
        </a>
      </div>
    );

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 p-4">
      <div className="w-full max-w-7xl h-full grid grid-cols-3 gap-4 text-white">
        {/* Left Column */}
        <div className="col-span-1 flex flex-col justify-start gap-4">
          {/* Wallet Info */}
          {!account ? (
            <button
              onClick={connectWallet}
              className="py-3 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Connect Wallet
            </button>
          ) : (
            <>
              <div className="p-3 bg-gray-800 rounded shadow">
                <p className="font-semibold text-indigo-400">Wallet:</p>
                <p className="break-all">{account}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded shadow">
                <p className="font-semibold text-indigo-400">Network:</p>
                {networkName} ({chainIdNumber})
              </div>
              {account.toLowerCase() === ownerAddress.toLowerCase() && (
                <div className="p-3 bg-gray-800 rounded shadow">
                  <button
                    onClick={withdrawAllToOwner}
                    className="w-full py-2 bg-red-600 rounded hover:bg-red-700 font-semibold"
                  >
                    💰 Withdraw All to Owner
                  </button>
                  <TxBox label="Owner Withdraw Tx:" hash={ownerWithdrawHash} color="border-red-400"/>
                </div>
              )}
            </>
          )}
        </div>

        {/* Middle Column */}
        <div className="col-span-1 flex flex-col justify-start gap-4">
          {/* Register */}
          <div className="p-3 bg-gray-800 rounded shadow">
            <h2 className="font-semibold text-yellow-400 mb-2">Register User</h2>
            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-1 rounded text-black mb-1"/>
            <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} className="w-full p-1 rounded text-black mb-2"/>
            <button onClick={register} className="w-full py-1 bg-green-600 rounded hover:bg-green-700 font-semibold">🧍 Register</button>
            <TxBox label="Register Tx:" hash={registerHash} color="border-green-400"/>
          </div>

          {/* Update */}
          <div className="p-3 bg-gray-800 rounded shadow">
            <h2 className="font-semibold text-pink-400 mb-2">Update Name</h2>
            <input type="text" placeholder="New Name" value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-1 rounded text-black mb-2"/>
            <button onClick={updateUser} className="w-full py-1 bg-pink-600 rounded hover:bg-pink-700 font-semibold">✏️ Update</button>
            <TxBox label="Update Tx:" hash={updateHash} color="border-pink-400"/>
          </div>

          {/* Deposit */}
          <div className="p-3 bg-gray-800 rounded shadow">
            <h2 className="font-semibold text-purple-400 mb-2">Deposit ETH</h2>
            <input type="number" placeholder="ETH Amount" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full p-1 rounded text-black mb-2"/>
            <button onClick={deposit} className="w-full py-1 bg-purple-600 rounded hover:bg-purple-700 font-semibold">💸 Deposit</button>
            <TxBox label="Deposit Tx:" hash={depositHash} color="border-purple-400"/>
          </div>

          {/* Withdraw */}
          <div className="p-3 bg-gray-800 rounded shadow">
            <h2 className="font-semibold text-red-400 mb-2">Withdraw ETH</h2>
            <input type="number" placeholder="ETH Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full p-1 rounded text-black mb-2"/>
            <button onClick={withdraw} className="w-full py-1 bg-red-600 rounded hover:bg-red-700 font-semibold">💸 Withdraw</button>
            <TxBox label="Withdraw Tx:" hash={withdrawHash} color="border-red-400"/>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 flex flex-col justify-start gap-4">
          {/* User Info */}
          <div className="p-3 bg-gray-800 rounded shadow">
            <h2 className="font-semibold text-orange-400 mb-2">My Info</h2>
            <button onClick={getUser} className="w-full py-1 bg-orange-600 rounded hover:bg-orange-700 font-semibold mb-2">👤 Load Info</button>
            {currentUser && (
              <div className="text-sm">
                <p><b>Name:</b> {currentUser.name}</p>
                <p><b>Age:</b> {currentUser.age}</p>
                <p><b>Wallet:</b> {currentUser.wallet}</p>
                <p><b>Balance:</b> {currentUser.balance}</p>
              </div>
            )}
          </div>

          {/* All Users */}
          <div className="p-3 bg-gray-800 rounded shadow">
            <h2 className="font-semibold text-cyan-400 mb-2">All Users</h2>
            <button onClick={getAllUsers} className="w-full py-1 bg-cyan-600 rounded hover:bg-cyan-700 font-semibold mb-2">📜 Load Users</button>
            {users.length > 0 && (
              <div className="text-sm max-h-32 overflow-hidden">
                {users.map((u, idx) => (
                  <p key={idx}><b>{u.name}</b> | {u.age} | {u.wallet} | {u.balance}</p>
                ))}
              </div>
            )}
          </div>

          {/* Contract Balance */}
          <div className="p-3 bg-gray-800 rounded shadow">
            <h2 className="font-semibold text-lime-400 mb-2">Contract Balance</h2>
            <button onClick={contractBalance} className="w-full py-1 bg-lime-600 rounded hover:bg-lime-700 font-semibold mb-2">💰 Load Balance</button>
            {contractBal !== null && <p>{contractBal}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
