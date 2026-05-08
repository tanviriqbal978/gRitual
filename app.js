const connectBtn = document.getElementById("connectBtn");
const switchBtn = document.getElementById("switchBtn");
const refreshBtn = document.getElementById("refreshBtn");
const submitBtn = document.getElementById("submitBtn");
const saveTwitterBtn = document.getElementById("saveTwitterBtn");
const saveCardBtn = document.getElementById("saveCardBtn");
const tweetCardBtn = document.getElementById("tweetCardBtn");

const walletState = document.getElementById("walletState");
const networkState = document.getElementById("networkState");
const txState = document.getElementById("txState");
const twitterInput = document.getElementById("twitterInput");
const profileBox = document.getElementById("profileBox");
const leaderboardEl = document.getElementById("leaderboard");
const rankCard = document.getElementById("rankCard");

const STORAGE = "gritual_profile_v2";
const LAST_RITUAL_KEY = "gritual_last_ritual_utc";

let provider;
let signer;
let address;
let stats = [];

const short = (a) => `${a.slice(0, 6)}...${a.slice(-4)}`;
const todayUTC = () => new Date().toISOString().slice(0, 10);

function getProfile() {
  const raw = localStorage.getItem(STORAGE);
  return raw ? JSON.parse(raw) : { username: "" };
}

function saveProfile(profile) {
  localStorage.setItem(STORAGE, JSON.stringify(profile));
}

function getAvatar(username) {
  return username ? `https://unavatar.io/x/${username}` : "https://unavatar.io/twitter";
}

function renderProfile() {
  const profile = getProfile();
  twitterInput.value = profile.username || "";
  if (!profile.username) {
    profileBox.innerHTML = "<p class='small'>Save your Twitter username to continue.</p>";
    return;
  }
  profileBox.innerHTML = `<img src='${getAvatar(profile.username)}' alt='avatar'/><div><strong>@${profile.username}</strong><p class='small'>Manual profile mode</p></div>`;
}

async function connectWallet() {
  if (!window.ethereum) return (walletState.textContent = "Wallet not found.");
  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  address = await signer.getAddress();
  walletState.textContent = `Wallet: ${short(address)}`;
  const n = await provider.getNetwork();
  networkState.textContent = `Network chainId: ${n.chainId}`;
  renderRankCard();
}

async function switchToRitual() {
  const { network } = window.GRITUAL_CONFIG;
  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: network.chainIdHex }] });
  } catch (e) {
    if (e.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{ chainId: network.chainIdHex, chainName: network.chainName, nativeCurrency: network.nativeCurrency, rpcUrls: network.rpcUrls, blockExplorerUrls: network.blockExplorerUrls }],
      });
    } else throw e;
  }
  networkState.textContent = `Network: ${network.chainName}`;
}

async function fetchLeaderboard() {
  const rpc = new ethers.JsonRpcProvider(window.GRITUAL_CONFIG.network.rpcUrls[0]);
  const contract = new ethers.Contract(window.GRITUAL_CONFIG.contractAddress, window.GRITUAL_CONFIG.abi, rpc);
  const ev = await contract.queryFilter(contract.filters.CheckedIn(), 0, "latest");
  const map = new Map();
  for (const e of ev) {
    const user = e.args.user.toLowerCase();
    map.set(user, (map.get(user) || 0) + 1);
  }
  stats = [...map.entries()].map(([user, count]) => ({ user, count })).sort((a, b) => b.count - a.count);
  leaderboardEl.innerHTML = "";
  if (!stats.length) leaderboardEl.innerHTML = "<li class='small'>No gRitual yet.</li>";
  stats.forEach((s, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>#${i + 1} ${short(s.user)}</span><strong>${s.count}</strong>`;
    leaderboardEl.appendChild(li);
  });
  renderRankCard();
}

function renderRankCard() {
  const profile = getProfile();
  const user = (address || "").toLowerCase();
  const idx = stats.findIndex((s) => s.user === user);
  const rank = idx >= 0 ? idx + 1 : "-";
  const count = idx >= 0 ? stats[idx].count : 0;
  rankCard.innerHTML = `
    <div class='rank-head'>
      <img src='${getAvatar(profile.username)}' alt='avatar'/>
      <div><h3>${profile.username ? `@${profile.username}` : "No username"}</h3><p>${address ? short(address) : "Connect wallet"}</p></div>
    </div>
    <div class='rank-grid'>
      <div><span>gRituals</span><strong>${count}</strong></div>
      <div><span>Rank</span><strong>${rank}</strong></div>
    </div>
    <div class='badge'>Ritual Testnet · ID Verified</div>
    <p class='small'>Built by @tanviriqbal0</p>
  `;
}

function canDoToday() {
  const last = localStorage.getItem(`${LAST_RITUAL_KEY}:${(address || "").toLowerCase()}`);
  return last !== todayUTC();
}

async function doRitual() {
  if (!signer || !address) return (txState.textContent = "Connect wallet first.");
  const profile = getProfile();
  if (!profile.username) return (txState.textContent = "Save Twitter username first.");
  if (!canDoToday()) return (txState.textContent = "Daily limit reached. Come back tomorrow (UTC).");

  const c = new ethers.Contract(window.GRITUAL_CONFIG.contractAddress, window.GRITUAL_CONFIG.abi, signer);
  txState.textContent = "Sending tx...";
  const tx = await c.checkIn(`gRitual by @${profile.username}`);
  txState.textContent = `Pending: ${tx.hash}`;
  await tx.wait();
  localStorage.setItem(`${LAST_RITUAL_KEY}:${address.toLowerCase()}`, todayUTC());
  txState.innerHTML = `Success: <a target='_blank' rel='noreferrer' href='${window.GRITUAL_CONFIG.network.blockExplorerUrls[0]}/tx/${tx.hash}'>${tx.hash}</a>`;
  await fetchLeaderboard();
}

async function saveCard() {
  const canvas = await html2canvas(rankCard, { backgroundColor: null, scale: 2 });
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "gritual-rank-card.png";
  a.click();
}

function tweetCard() {
  const profile = getProfile();
  const text = encodeURIComponent(`I just did my daily gRitual on Ritual testnet ☕\n@${profile.username || "unknown"}\nBuilt by @tanviriqbal0`);
  window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
}

saveTwitterBtn.addEventListener("click", () => {
  const username = twitterInput.value.trim().replace(/^@/, "");
  saveProfile({ username });
  renderProfile();
  renderRankCard();
});
connectBtn.addEventListener("click", () => connectWallet().catch((e) => (txState.textContent = e.message)));
switchBtn.addEventListener("click", () => switchToRitual().catch((e) => (txState.textContent = e.message)));
refreshBtn.addEventListener("click", () => fetchLeaderboard().catch((e) => (txState.textContent = e.message)));
submitBtn.addEventListener("click", () => doRitual().catch((e) => (txState.textContent = e.message)));
saveCardBtn.addEventListener("click", () => saveCard().catch((e) => (txState.textContent = e.message)));
tweetCardBtn.addEventListener("click", tweetCard);

renderProfile();
fetchLeaderboard().catch(() => {
  leaderboardEl.innerHTML = "<li class='small'>Could not load on-chain leaderboard right now.</li>";
});
