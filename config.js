window.GRITUAL_CONFIG = {
  network: {
    chainId: 1979,
    chainIdHex: "0x7BB",
    chainName: "Ritual Testnet",
    nativeCurrency: {
      name: "RITUAL",
      symbol: "RITUAL",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.ritualfoundation.org"],
    blockExplorerUrls: ["https://explorer.ritualfoundation.org"],
  },
  contractAddress: "0x1df6796388607ceed59f5cbdCaDDafCaD088799b",
  abi: [
    "function checkIn(string message) external",
    "event CheckedIn(address indexed user, string message, uint256 timestamp)",
  ],
  creatorX: "tanviriqbal0",
};
