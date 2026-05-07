window.GRITUAL_CONFIG = {
  network: {
    chainIdHex: "0x13E31", // placeholder
    chainName: "Ritual Testnet",
    nativeCurrency: {
      name: "Ritual",
      symbol: "RIT",
      decimals: 18,
    },
    rpcUrls: ["https://testnet.ritual.network"], // placeholder
    blockExplorerUrls: ["https://explorer.testnet.ritual.network"], // placeholder
  },
  abi: [
    "function checkIn(string message) external",
    "event CheckedIn(address indexed user, string message, uint256 timestamp)",
  ],
};
