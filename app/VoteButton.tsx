"use client";

import { useState } from "react";
import { getSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase";

type Props = {
  contentId: string;
  initialTabCash: number;
};

export function VoteButton({ contentId, initialTabCash }: Props) {
  const [tabCash, setTabCash] = useState(initialTabCash);
  const [userVote, setUserVote] = useState(0);
  const [isPending, setIsPending] = useState(false);

  async function vote(voteType: 1 | -1) {
    setIsPending(true);
    try {
      if (!hasSupabaseBrowserConfig()) {
        applyLocalVote(voteType);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("cast_content_vote", {
        p_content_id: contentId,
        p_user_id: getAnonymousUserId(),
        p_vote_type: voteType
      });

      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      setTabCash(result.tab_cash);
      setUserVote(result.user_vote);
    } catch {
      applyLocalVote(voteType);
    } finally {
      setIsPending(false);
    }
  }

  function applyLocalVote(voteType: 1 | -1) {
    const previousVote = userVote;
    const nextVote = previousVote === voteType ? 0 : voteType;
    setUserVote(nextVote);
    setTabCash((current) => current + nextVote - previousVote);
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-white px-2 py-1 shadow-sm">
      <button
        type="button"
        aria-label="Votar positivamente"
        disabled={isPending}
        onClick={() => vote(1)}
        className={`grid h-9 w-9 place-items-center rounded-full text-lg font-black transition ${
          userVote === 1 ? "bg-coop text-white" : "hover:bg-ink/5"
        }`}
      >
        +
      </button>
      <span className="min-w-14 text-center text-sm font-bold tabular-nums">{tabCash} CoopCash</span>
      <button
        type="button"
        aria-label="Votar negativamente"
        disabled={isPending}
        onClick={() => vote(-1)}
        className={`grid h-9 w-9 place-items-center rounded-full text-lg font-black transition ${
          userVote === -1 ? "bg-signal text-white" : "hover:bg-ink/5"
        }`}
      >
        -
      </button>
    </div>
  );
}

function getAnonymousUserId() {
  const key = "newscoop.anonymousUserId";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const next = crypto.randomUUID();
  window.localStorage.setItem(key, next);
  return next;
}
