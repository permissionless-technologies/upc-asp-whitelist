# UPC ASP Whitelist — Sepolia Deployment

Auto-whitelist ASP service for asp-whitelist.upd.io.

Watches the UPP pool on Sepolia for shield events and auto-whitelists depositors after sanctions screening.

## Deploy

```bash
# Build
docker build -t upc-asp-whitelist .

# Run
docker run -d \
  -e RPC_URL=https://sepolia.infura.io/v3/<key> \
  -e ASP_REGISTRY_ADDRESS=0xfd11c56a23314aa88dfbcc36254f33e5e8b010df \
  -e WATCH_ADDRESS=0xb111a861cba83b16b9cab613b31b1f0ca03e1996 \
  -e WATCH_MODE=pool \
  -e OPERATOR_PRIVATE_KEY=<key> \
  -e CHAIN_ID=11155111 \
  -e DEPLOY_BLOCK=10477882 \
  -e PORT=3001 \
  -p 3001:3001 \
  upc-asp-whitelist
```

## First Run

On first startup, the service registers itself with ASPRegistryHub and prints the ASP ID. Set `ASP_ID` in the env after first run to avoid re-registration on restart.

## API

| Endpoint | Description |
|----------|-------------|
| `GET /root` | Current Merkle root |
| `GET /proof/:address` | Membership proof |
| `GET /members` | All whitelisted addresses |
| `GET /status` | Sync status |

## Prerequisites

- Operator address needs Sepolia ETH (for `updateRoot` transactions)
- RPC endpoint with sufficient quota for historical log fetching
