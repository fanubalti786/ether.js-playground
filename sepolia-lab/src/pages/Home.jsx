import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function Home() {
  const [account, setAccount] = useState(null);
  const ConnectWallet = async () => {
    console.log(window);
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
          setAccount(accounts[0]);
          console.log("Wallet connected:", accounts[0]);
        } else {
          alert("No account found. Please login to MetaMask.");
        }
      } catch (error) {
        if (error.code === 4001) {
          // User ne cancel kiya
          alert("You rejected the connection request");
        } else {
          console.error("Error connecting:", error);
        }
      }
    } else {
      alert("MetaMask extension not detected! Please install MetaMask.");
    }
  };
  // useEffect(() => {
  //     ConnectWallet()
  // },[])
  return (
    <div className="flex  flex-col justify-center items-center h-screen ">
      <h1 className="text-3xl mb-2 font-bold text-blue-800">
        Wellcome in web3
      </h1>
      {account ? (
        <p>Connected: {account}</p>
      ) : (
        <button
          className="px-8 py-1.5 bg-black text-white border rounded-lg cursor-pointer 
       shadow-lg hover:scale-100 hover:bg-gray-500 hover:text-black"
          onClick={ConnectWallet}
        >
          connect Metamask
        </button>
      )}
    </div>
  );
}
