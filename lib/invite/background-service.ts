import "server-only";

import type { GuestInvite } from "@/types/guest";
import {
  addBackgroundToPool,
  claimReusableBackgroundFromPool,
} from "@/lib/google/background-pool";
import { generateAndUploadInviteBackground } from "@/lib/invite/generate-background";

export interface ResolveInviteBackgroundResult {
  bgUrl: string;
  reusedFromPool: boolean;
  poolBgId?: string;
}

export async function resolveInviteBackground(
  invite: GuestInvite,
  openaiApiKey: string,
): Promise<ResolveInviteBackgroundResult> {
  const customPrompt = invite.prompt?.trim();

  if (!customPrompt) {
    const pooled = await claimReusableBackgroundFromPool();
    if (pooled) {
      return {
        bgUrl: pooled.bgUrl,
        reusedFromPool: true,
        poolBgId: pooled.bgId,
      };
    }
  }

  const bgUrl = await generateAndUploadInviteBackground(
    invite.id,
    invite.inviteName,
    openaiApiKey,
    customPrompt || undefined,
  );

  if (!customPrompt) {
    await addBackgroundToPool({
      bgUrl,
      sourceInviteId: invite.id,
    });
  }

  return {
    bgUrl,
    reusedFromPool: false,
  };
}
