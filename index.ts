import {
  startASPService,
  SubsquidEventSource,
  SanctionsGate,
} from '@permissionless-technologies/upc-asp-whitelist'
import { parseAbiItem } from 'viem'

// TODO: Import from @permissionless-technologies/upp-sdk once published
// import { UNIVERSAL_PRIVATE_POOL_ABI, getDeploymentOrThrow } from '@permissionless-technologies/upp-sdk'

// Sepolia deployment addresses (from upp-sdk/src/deployments/11155111.json)
// Updated 2026-05-18 for the V4 (8-ary STARK) rollout — pool proxy
// `0xCDA1…1740` (stable across the V4-aware impl upgrade at block
// 10846101) and the fresh ASPRegistryHub `0xB7112902…` initialized as
// part of the same redeploy. The old addresses (pool 0x1cB47B1D…,
// aspRegistry 0x4935146d…) belonged to a pre-V4 deployment and no
// longer receive shields or accept root updates from this service.
const DEPLOYMENTS: Record<number, { pool: `0x${string}`; aspRegistry: `0x${string}`; deployBlock: bigint }> = {
  11155111: {
    pool: '0xCDA138FFd4789670e0034aE30946b8873bb51740',
    aspRegistry: '0xB71129021E6f1C45D206aa15233d9B1DcEfdeb97',
    deployBlock: 10846101n,
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
