import { readContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { AbiCoder, type BigNumberish } from "ethers";
import { concat, encodeAbiParameters, keccak256, type Address, type Hash } from "viem";

import { useSentryLogger } from "@/composables/useSentryLogger";
import { wagmiConfig } from "@/data/wagmi";

import type { DepositFeeValues } from "@/composables/battlechain/deposit/useFee";

const L2_NATIVE_TOKEN_VAULT_ADDRESS = "0x0000000000000000000000000000000000010004" as Address;

const BRIDGEHUB_ABI = [
  { type: "function", name: "sharedBridge", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  {
    type: "function",
    name: "requestL2TransactionTwoBridges",
    inputs: [
      {
        name: "_request",
        type: "tuple",
        components: [
          { name: "chainId", type: "uint256" },
          { name: "mintValue", type: "uint256" },
          { name: "l2Value", type: "uint256" },
          { name: "l2GasLimit", type: "uint256" },
          { name: "l2GasPerPubdataByteLimit", type: "uint256" },
          { name: "refundRecipient", type: "address" },
          { name: "secondBridgeAddress", type: "address" },
          { name: "secondBridgeValue", type: "uint256" },
          { name: "secondBridgeCalldata", type: "bytes" },
        ],
      },
    ],
    outputs: [{ type: "bytes32" }],
    stateMutability: "payable",
  },
] as const;

const L1_ASSET_ROUTER_ABI = [
  { type: "function", name: "nativeTokenVault", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
] as const;

const L1_NTV_ABI = [
  {
    type: "function",
    name: "assetId",
    inputs: [{ name: "tokenAddress", type: "address" }],
    outputs: [{ name: "assetId", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ensureTokenIsRegistered",
    inputs: [{ name: "_nativeToken", type: "address" }],
    outputs: [{ name: "tokenAssetId", type: "bytes32" }],
    stateMutability: "nonpayable",
  },
] as const;

const ZERO_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

export async function ensureTokenRegistered(tokenAddress: Address, bridgehubAddress: Address) {
  const assetRouter = await readContract(wagmiConfig, {
    address: bridgehubAddress,
    abi: BRIDGEHUB_ABI,
    functionName: "sharedBridge",
  });
  const ntv = await readContract(wagmiConfig, {
    address: assetRouter as Address,
    abi: L1_ASSET_ROUTER_ABI,
    functionName: "nativeTokenVault",
  });
  const currentAssetId = await readContract(wagmiConfig, {
    address: ntv as Address,
    abi: L1_NTV_ABI,
    functionName: "assetId",
    args: [tokenAddress],
  });
  if (currentAssetId === ZERO_BYTES32) {
    const hash = await writeContract(wagmiConfig, {
      address: ntv as Address,
      abi: L1_NTV_ABI,
      functionName: "ensureTokenIsRegistered",
      args: [tokenAddress],
    });
    await waitForTransactionReceipt(wagmiConfig, { hash });
  }
}

function buildV1SecondBridgeCalldata(
  l1ChainId: bigint,
  tokenAddress: Address,
  amount: bigint,
  receiver: Address
): `0x${string}` {
  const coder = AbiCoder.defaultAbiCoder();
  const assetId = keccak256(
    encodeAbiParameters(
      [{ type: "uint256" }, { type: "address" }, { type: "address" }],
      [l1ChainId, L2_NATIVE_TOKEN_VAULT_ADDRESS, tokenAddress]
    )
  );
  const transferData = coder.encode(["uint256", "address", "address"], [amount, receiver, tokenAddress]);
  const inner = coder.encode(["bytes32", "bytes"], [assetId, transferData]);
  return concat(["0x01", inner as `0x${string}`]);
}

export default () => {
  const status = ref<"not-started" | "processing" | "waiting-for-signature" | "done">("not-started");
  const error = ref<Error | undefined>();
  const ethTransactionHash = ref<Hash | undefined>();
  const bcWalletStore = useBattleChainWalletStore();
  const providerStore = useBattleChainProviderStore();
  const { bcNetwork } = storeToRefs(providerStore);
  const { captureException } = useSentryLogger();

  const { validateAddress } = useScreening();

  const commitTransaction = async (
    transaction: {
      to: Address;
      tokenAddress: Address;
      amount: BigNumberish;
    },
    fee: DepositFeeValues
  ): Promise<{ hash: Hash } | undefined> => {
    try {
      error.value = undefined;

      status.value = "processing";
      await bcWalletStore.walletAddressValidate();
      await validateAddress(transaction.to);

      status.value = "waiting-for-signature";

      const provider = await providerStore.requestProvider();
      const bridgehubAddress = (await provider.getBridgehubContractAddress()) as Address;
      const assetRouter = (await readContract(wagmiConfig, {
        address: bridgehubAddress,
        abi: BRIDGEHUB_ABI,
        functionName: "sharedBridge",
      })) as Address;

      const l2ChainId = BigInt((await provider.getNetwork()).chainId);
      const amount = BigInt(transaction.amount.toString());
      const receiver = transaction.to;

      const l1ChainId = BigInt(bcNetwork.value.l1Network?.id ?? 0);
      if (!l1ChainId) throw new Error("L1 network is not available");

      const secondBridgeCalldata = buildV1SecondBridgeCalldata(l1ChainId, transaction.tokenAddress, amount, receiver);

      const baseCost = fee.baseCost ?? 0n;
      const priorityFee = fee.maxPriorityFeePerGas ?? 0n;
      const mintValue = baseCost + priorityFee;
      if (!mintValue) throw new Error("Fee estimation returned zero — cannot submit deposit");

      const hash = await writeContract(wagmiConfig, {
        address: bridgehubAddress,
        abi: BRIDGEHUB_ABI,
        functionName: "requestL2TransactionTwoBridges",
        args: [
          {
            chainId: l2ChainId,
            mintValue,
            l2Value: 0n,
            l2GasLimit: fee.l2GasLimit ?? 2500000n,
            l2GasPerPubdataByteLimit: fee.gasPerPubdata,
            refundRecipient: receiver,
            secondBridgeAddress: assetRouter,
            secondBridgeValue: 0n,
            secondBridgeCalldata,
          },
        ],
        value: mintValue,
      });

      ethTransactionHash.value = hash;
      status.value = "done";
      return { hash };
    } catch (err) {
      error.value = formatError(err as Error);
      status.value = "not-started";
      captureException({
        error: err as Error,
        parentFunctionName: "commitTransaction",
        parentFunctionParams: [transaction, fee],
        filePath: "composables/battlechain/deposit/useTransaction.ts",
      });
    }
  };

  return {
    status,
    error,
    ethTransactionHash,
    commitTransaction,
  };
};
