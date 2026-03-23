import { startASPService } from '@permissionless-technologies/upc-asp-whitelist'

startASPService({
  rpcUrl: process.env.RPC_URL!,
  registryAddress: process.env.ASP_REGISTRY_ADDRESS! as `0x${string}`,
  watchAddress: process.env.WATCH_ADDRESS! as `0x${string}`,
  watchMode: (process.env.WATCH_MODE ?? 'pool') as 'pool' | 'mint',
  operatorPrivateKey: process.env.OPERATOR_PRIVATE_KEY! as `0x${string}`,
  aspId: process.env.ASP_ID ? BigInt(process.env.ASP_ID) : undefined,
  port: parseInt(process.env.PORT ?? '3001'),
  chainId: parseInt(process.env.CHAIN_ID ?? '11155111'),
  deployBlock: process.env.DEPLOY_BLOCK ? BigInt(process.env.DEPLOY_BLOCK) : undefined,
})
