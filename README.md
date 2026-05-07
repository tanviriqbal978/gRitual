# gRitual

`gRitual` is a lightweight **gm.ink-inspired** dApp prototype for the **Ritual testnet**.

## What this starter includes

- Wallet connect (MetaMask-compatible)
- Ritual testnet network switch/add flow
- A “GM check-in” form (message + optional note)
- Submission to an on-chain `checkIn(string)` method (configurable contract address)
- Local check-in history persisted in browser storage

## Quick start

1. Serve the project with any static server:

   ```bash
   python3 -m http.server 4173
   ```

2. Open <http://localhost:4173>
3. Connect wallet
4. Add/switch to Ritual testnet when prompted
5. Set your deployed contract address in the UI and submit a GM

## Ritual network config

The app is preconfigured with placeholder values in `config.js`.
Update them to match the current official Ritual testnet parameters.

## Contract ABI expectation

This UI expects a contract with the function:

```solidity
function checkIn(string calldata message) external;
```

and optionally an event:

```solidity
event CheckedIn(address indexed user, string message, uint256 timestamp);
```

## Files

- `index.html` – UI markup
- `styles.css` – styling
- `app.js` – dApp logic
- `config.js` – network defaults and constants

