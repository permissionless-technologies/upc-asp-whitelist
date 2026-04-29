import {
  startASPService,
  SubsquidEventSource,
  SanctionsGate,
} from '@permissionless-technologies/upc-asp-whitelist'
import { parseAbiItem } from 'viem'

// TODO: Import from @permissionless-technologies/upp-sdk once published
// import { UNIVERSAL_PRIVATE_POOL_ABI, getDeploymentOrThrow } from '@permissionless-technologies/upp-sdk'

// Sepolia deployment addresses (from upp-sdk/src/deployments/11155111.json)
// Updated 2026-04-29 for the v4 pool redeploy (ASP-gated merge + merge-transfer
// circuits; new MergeParams/MergeTransfer{2x2,4x2}Params include aspRoot/aspId).
const DEPLOYMENTS: Record<number, { pool: `0x${string}`; aspRegistry: `0x${string}`; deployBlock: bigint }> = {
  11155111: {
    pool: '0x1cB47B1D215D0C72d70ab0011711962AEa9879Ee',
    aspRegistry: '0x4935146dfB8f5dD25EC704Ed9E40F2b7FD89a6e9',
    deployBlock: 10755242n,
  },
}

const shieldedEvent = parseAbiItem(
  'event Shielded(address indexed token, address indexed depositor, bytes32 indexed commitment, uint256 leafIndex, bytes encryptedNote)'
)

const chainId = parseInt(process.env.CHAIN_ID ?? '11155111')
const deployment = DEPLOYMENTS[chainId]
if (!deployment) throw new Error(`No deployment for chain ${chainId}`)

const blocklist = (process.env.SANCTIONS_BLOCKLIST ?? '')
  .split(',')
  .map((a: string) => a.trim())
  .filter((a: string) => a.length > 0)

startASPService({
  rpcUrl: process.env.RPC_URL!,
  registryAddress: deployment.aspRegistry,
  operatorPrivateKey: process.env.OPERATOR_PRIVATE_KEY! as `0x${string}`,
  aspId: process.env.ASP_ID ? BigInt(process.env.ASP_ID) : undefined,
  port: parseInt(process.env.PORT ?? '3001'),
  chainId,

  eventSource: new SubsquidEventSource({
    archive: process.env.SUBSQUID_ARCHIVE ?? 'https://v2.archive.subsquid.io/network/ethereum-sepolia',
    rpcUrl: process.env.RPC_URL!,
    watchAddress: deployment.pool,
    event: shieldedEvent,
    addressTopicIndex: 2,
    deployBlock: deployment.deployBlock,
    finalityConfirmation: 2
  }),

  gate: new SanctionsGate({ blocklist }),
})
