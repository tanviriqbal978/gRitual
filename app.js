const connectBtn = document.getElementById("connectBtn");
const switchBtn = document.getElementById("switchBtn");
const submitBtn = document.getElementById("submitBtn");

const walletState = document.getElementById("walletState");
const networkState = document.getElementById("networkState");
const txState = document.getElementById("txState");

const contractInput = document.getElementById("contractInput");
const messageInput = document.getElementById("messageInput");
const feed = document.getElementById("feed");

let provider;
let signer;

const FEED_KEY = "gritual_feed_v1";

function truncate(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function loadFeed() {
  const raw = localStorage.getItem(FEED_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveFeed(items) {
  localStorage.setItem(FEED_KEY, JSON.stringify(items));
}

function renderFeed() {
  const items = loadFeed();
  feed.innerHTML = "";
  if (!items.length) {
    feed.innerHTML = "<li class='small'>No check-ins yet.</li>";
    return;
  }

  items
    .slice()
    .reverse()
    .forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<div>${item.message}</div><div class='small'>${item.user} · ${new Date(item.time).toLocaleString()} · <a href='${item.txUrl}' target='_blank' rel='noreferrer'>tx</a></div>`;
      feed.appendChild(li);
    });
}

async function connectWallet() {
  if (!window.ethereum) {
    walletState.textContent = "Wallet: MetaMask (or compatible) not found.";
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  const address = await signer.getAddress();
  walletState.textContent = `Wallet: ${truncate(address)}`;

  const network = await provider.getNetwork();
  networkState.textContent = `Network chainId: ${network.chainId}`;
}

async function switchToRitual() {
  const { network } = window.GRITUAL_CONFIG;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: network.chainIdHex }],
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: network.chainIdHex,
            chainName: network.chainName,
            nativeCurrency: network.nativeCurrency,
            rpcUrls: network.rpcUrls,
            blockExplorerUrls: network.blockExplorerUrls,
          },
        ],
      });
    } else {
      throw err;
    }
  }

  networkState.textContent = `Network: ${network.chainName}`;
}

async function submitCheckIn() {
  if (!signer) {
    txState.textContent = "Connect wallet first.";
    return;
  }

  const contractAddress = contractInput.value.trim();
  const message = messageInput.value.trim();

  if (!ethers.isAddress(contractAddress)) {
    txState.textContent = "Provide a valid contract address.";
    return;
  }

  if (!message) {
    txState.textContent = "Message cannot be empty.";
    return;
  }

  const contract = new ethers.Contract(contractAddress, window.GRITUAL_CONFIG.abi, signer);

  txState.textContent = "Submitting transaction...";
  const tx = await contract.checkIn(message);
  txState.textContent = `Pending: ${tx.hash}`;

  const receipt = await tx.wait();
  const user = truncate(await signer.getAddress());
  const txUrlBase = window.GRITUAL_CONFIG.network.blockExplorerUrls[0] || "";
  const txUrl = txUrlBase ? `${txUrlBase.replace(/\/$/, "")}/tx/${receipt.hash}` : "#";

  const items = loadFeed();
  items.push({ message, user, time: Date.now(), txUrl });
  saveFeed(items);
  renderFeed();

  txState.textContent = `Success: ${receipt.hash}`;
  messageInput.value = "";
}

connectBtn.addEventListener("click", connectWallet);
switchBtn.addEventListener("click", switchToRitual);
submitBtn.addEventListener("click", () => {
  submitCheckIn().catch((err) => {
    txState.textContent = `Error: ${err?.message || err}`;
  });
});

renderFeed();
