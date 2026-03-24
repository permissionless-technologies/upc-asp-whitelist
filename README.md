# UPC ASP Whitelist — Sepolia Deployment

Auto-whitelist ASP service for asp-whitelist.upd.io.

Watches the UPP pool on Sepolia for `Shielded` events and auto-whitelists depositors after sanctions screening. Uses Subsquid for efficient historical catch-up.

## Deploy

```bash
# Build
docker build -t upc-asp-whitelist .

# Run
docker run -d \
  -e RPC_URL=https://sepolia.infura.io/v3/<key> \
  -e OPERATOR_PRIVATE_KEY=<key> \
  -e ASP_ID=4 \
  -e PORT=3001 \
  -p 3001:3001 \
  upc-asp-whitelist
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RPC_URL` | Yes | — | RPC endpoint (used for live blocks + on-chain transactions) |
| `OPERATOR_PRIVATE_KEY` | Yes | — | Private key for the ASP operator (publishes roots) |
| `ASP_ID` | No | auto-register | Set after first run to avoid re-registration |
| `CHAIN_ID` | No | `11155111` | Target chain (Sepolia) |
| `PORT` | No | `3001` | API server port |
| `SUBSQUID_ARCHIVE` | No | Sepolia archive | Subsquid archive URL |
| `SANCTIONS_BLOCKLIST` | No | empty | Comma-separated blocked addresses |

Pool address, ASP registry address, and deploy block are hardcoded in `index.ts` from the UPP Sepolia deployment. When `@permissionless-technologies/upp-sdk` is published, these will be imported directly from the SDK.

## First Run

On first startup, the service registers itself with ASPRegistryHub and prints the ASP ID. Set `ASP_ID` in the env after first run to avoid re-registration on restart.

## Architecture

```
SubsquidEventSource (historical catch-up + live)
    │
    ▼
SanctionsGate (blocklist screening)
    │
    ▼
ASPManager (Merkle tree + root publishing)
    │
    ▼
Express API (/root, /proof/:addr, /members, /status)
```

## API

| Endpoint | Description |
|----------|-------------|
| `GET /root` | Current Merkle root |
| `GET /proof/:address` | Membership proof (404 if not whitelisted) |
| `GET /members` | All whitelisted addresses |
| `GET /status` | Sync status, member count, gate stats |

## Prerequisites

- Operator address needs Sepolia ETH (for `updateRoot` transactions)
- RPC endpoint (used only for live blocks — historical catch-up uses Subsquid archive)
