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

export interface ResolveInviteBackgroundOptions {
  allowGeneration?: boolean;
  forcePool?: boolean;
  openaiApiKey?: string;
}

export async function resolveInviteBackground(
  invite: GuestInvite,
  optionsOrOpenaiApiKey: ResolveInviteBackgroundOptions | string,
): Promise<ResolveInviteBackgroundResult> {
  const options =
    typeof optionsOrOpenaiApiKey === "string"
      ? {
          allowGeneration: true,
          openaiApiKey: optionsOrOpenaiApiKey,
        }
      : optionsOrOpenaiApiKey;
  const customPrompt = invite.prompt?.trim();
  const allowGeneration = options.allowGeneration ?? true;
  const shouldTryPool = options.forcePool || !customPrompt;

  if (shouldTryPool) {
    const pooled = await claimReusableBackgroundFromPool();
    if (pooled) {
      return {
        bgUrl: pooled.bgUrl,
        reusedFromPool: true,
        poolBgId: pooled.bgId,
      };
    }
  }

  if (!allowGeneration) {
    throw new Error(
      "Background generation is disabled and no reusable background is available in BackgroundPool.",
    );
  }

  const openaiApiKey = options.openaiApiKey?.trim();
  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
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
