import { useStorage } from "@vueuse/core";

// Bump this whenever the Terms of Service or Privacy Policy change materially.
// Bumping it re-prompts the first-visit notice for everyone and re-gates every
// wallet at bridge time, satisfying the re-acceptance requirement in the ToS.
export const TERMS_VERSION = "v0.1";

// Canonical hosted document URLs. Update if the published paths differ.
export const TERMS_URL = "https://battlechain.com/terms";
export const PRIVACY_URL = "https://battlechain.com/privacy";

type AcceptanceRecord = { version: string; acceptedAt: string };

/**
 * Single source of truth for Terms of Service acceptance.
 *
 * Two layers:
 * - `noticeAccepted` / `acceptNotice`: a browser-level, versioned first-visit
 *   notice (no wallet required).
 * - `walletAccepted` / `recordWalletAcceptance`: a per-wallet consent record
 *   ({ version, acceptedAt }) used to gate the bridge action.
 */
export const useTermsAcceptance = () => {
  const { account } = storeToRefs(useOnboardStore());

  const acceptedNoticeVersion = useStorage("battlechain-bridge-notice-version", "");
  const noticeAccepted = computed(() => acceptedNoticeVersion.value === TERMS_VERSION);
  const acceptNotice = () => {
    acceptedNoticeVersion.value = TERMS_VERSION;
  };

  const acceptances = useStorage<Record<string, AcceptanceRecord>>("battlechain-bridge-tos-acceptances", {});
  const walletAddress = computed(() => account.value.address?.toLowerCase() ?? null);
  const walletAccepted = computed(
    () => !!walletAddress.value && acceptances.value[walletAddress.value]?.version === TERMS_VERSION
  );
  const recordWalletAcceptance = () => {
    const address = walletAddress.value;
    if (!address) {
      return;
    }
    acceptances.value = {
      ...acceptances.value,
      [address]: { version: TERMS_VERSION, acceptedAt: new Date().toISOString() },
    };
  };

  return {
    termsVersion: TERMS_VERSION,
    termsUrl: TERMS_URL,
    privacyUrl: PRIVACY_URL,
    noticeAccepted,
    acceptNotice,
    walletAccepted,
    recordWalletAcceptance,
  };
};
