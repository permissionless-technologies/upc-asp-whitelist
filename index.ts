import {
  startASPService,
  SubsquidEventSource,
  SanctionsGate,
} from '@permissionless-technologies/upc-asp-whitelist'
import { parseAbiItem } from 'viem'

// TODO: Import from @permissionless-technologies/upp-sdk once published
// import { UNIVERSAL_PRIVATE_POOL_ABI, getDeploymentOrThrow } from '@permissionless-technologies/upp-sdk'

// Sepolia deployment addresses (from upp-sdk/src/deployments/11155111.json)
const DEPLOYMENTS: Record<number, { pool: `0x${string}`; aspRegistry: `0x${string}`; deployBlock: bigint }> = {
  11155111: {
    pool: '0x3b5ed60adbd5dd57f47ec54179e4b1c06636285b',
    aspRegistry: '0xfd11c56a23314aa88dfbcc36254f33e5e8b010df',
    deployBlock: 10547005n,
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
  }),

  gate: new SanctionsGate({ blocklist }),
})
