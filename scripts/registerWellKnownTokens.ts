/**
 * One-time script to pre-register well-known tokens in the L1 NativeTokenVault.
 *
 * This ensures the first user bridging a token doesn't need to sign an extra
 * registration transaction. Run once after deploying the bridge, and again
 * whenever the well-known tokens list is updated.
 *
 * Usage:
 *   npx ts-node scripts/registerWellKnownTokens.ts
 *
 * Environment variables:
 *   RPC_URL          - L1 RPC endpoint (default: Sepolia public RPC)
 *   PRIVATE_KEY      - Private key of the account paying for registration gas
 *   BRIDGEHUB        - Bridgehub contract address
 *   L1_CHAIN_ID      - L1 chain ID (default: 11155111 for Sepolia)
 */

import { ethers } from "ethers";

const BRIDGEHUB_ABI = ["function sharedBridge() view returns (address)"];
const ASSET_ROUTER_ABI = ["function nativeTokenVault() view returns (address)"];
const NTV_ABI = [
  "function assetId(address tokenAddress) view returns (bytes32)",
  "function ensureTokenIsRegistered(address _nativeToken) returns (bytes32)",
];

const ZERO_BYTES32 = "0x" + "0".repeat(64);

async function main() {
  const rpcUrl = process.env.RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
  const privateKey = process.env.PRIVATE_KEY;
  const bridgehubAddress = process.env.BRIDGEHUB;
  const l1ChainId = Number(process.env.L1_CHAIN_ID || "11155111");

  if (!privateKey) throw new Error("PRIVATE_KEY environment variable is required");
  if (!bridgehubAddress) throw new Error("BRIDGEHUB environment variable is required");

  // Dynamic import to avoid TS issues with path aliases
  const { wellKnownTokens } = await import("../data/wellKnownTokens");

  const tokens = wellKnownTokens[l1ChainId];
  if (!tokens || tokens.length === 0) {
    console.log(`No well-known tokens configured for chain ID ${l1ChainId}`);
    return;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Resolve NTV address
  const bridgehub = new ethers.Contract(bridgehubAddress, BRIDGEHUB_ABI, provider);
  const assetRouterAddress = await bridgehub.sharedBridge();
  const assetRouter = new ethers.Contract(assetRouterAddress, ASSET_ROUTER_ABI, provider);
  const ntvAddress = await assetRouter.nativeTokenVault();
  const ntv = new ethers.Contract(ntvAddress, NTV_ABI, wallet);

  console.log(`Bridgehub: ${bridgehubAddress}`);
  console.log(`L1AssetRouter: ${assetRouterAddress}`);
  console.log(`L1NativeTokenVault: ${ntvAddress}`);
  console.log(`Registering ${tokens.length} tokens...\n`);

  for (const token of tokens) {
    const currentAssetId = await ntv.assetId(token.address);

    if (currentAssetId !== ZERO_BYTES32) {
      console.log(`✓ ${token.symbol} (${token.address}) — already registered`);
      continue;
    }

    console.log(`  Registering ${token.symbol} (${token.address})...`);
    try {
      const tx = await ntv.ensureTokenIsRegistered(token.address);
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        console.log(`✓ ${token.symbol} registered — tx: ${tx.hash}`);
      } else {
        console.log(`✗ ${token.symbol} registration FAILED — tx: ${tx.hash}`);
      }
    } catch (e: any) {
      console.log(`✗ ${token.symbol} registration ERROR — ${e.message?.slice(0, 150)}`);
    }
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
