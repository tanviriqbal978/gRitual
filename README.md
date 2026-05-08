# gRitual

A gm.ink-inspired Ritual testnet dApp where users can do one on-chain **gRitual** per day.

## Features

- Wallet connect + network switch to Ritual testnet (`chainId: 1979`)
- Manual Twitter/X username input
- Auto avatar rendering from username (`unavatar.io`)
- On-chain gRitual transaction (`checkIn(string)`)
- Daily limit: 1 ritual/day per wallet (UTC, client-side)
- Live on-chain leaderboard (from `CheckedIn` events)
- Personal rank card with save-as-image support
- One-click X post intent including creator credit

## Contract and network

- Contract: `0x1df6796388607ceed59f5cbdCaDDafCaD088799b`
- RPC: `https://rpc.ritualfoundation.org`
- Explorer: `https://explorer.ritualfoundation.org`

## Run

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Notes

- Replace `assets/gritual-logo.svg` with your provided logo file if needed.
- Daily limit is enforced in browser storage; for strict anti-spam, enforce limit inside the smart contract too.
