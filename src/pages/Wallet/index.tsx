import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getWalletBalance, getWalletTransactions, requestWithdrawal, saveWallet } from "@/lib/api";
import type { WalletBalance, WalletTransaction } from "@/lib/types";

// Design tokens taken from the real Figma node (nAllTZdIEQt2sfhrTgtcAQ,
// 456:1379 desktop / 456:1250 + 456:1202 mobile) — DM Sans throughout, same
// system as the Creator Profile page (src/pages/Creator/index.tsx).
const F = '"DM Sans", ui-sans-serif, system-ui, sans-serif';
const C = {
  text: "#f5f7fc",
  muted: "#a6b5cb",
  accent: "#79b8ff",
  success: "#10b981",
  successBg: "#102e29",
  warning: "#f5c66c",
  warningBg: "#30291c",
  danger: "#f87171",
  dangerBg: "#301414",
  canvas: "#06080e",
  elevated: "#161c2a",
  cardBorder: "rgba(184,199,229,0.32)",
  divider: "#1f2430",
};
const GRAD = {
  balanceCard: "linear-gradient(147deg, rgba(99,134,208,0.6) 10.714%, rgba(32,59,112,0.8) 40.714%, rgb(8,12,22) 82.143%)",
  glassPanel: "linear-gradient(135deg, rgba(68,72,81,0.7) 10.714%, rgba(17,21,29,0.6) 46.429%, rgb(7,10,16) 82.143%)",
  button: "linear-gradient(169deg, rgb(50,104,220) 10.714%, rgb(36,76,187) 82.143%)",
};
const ICON = {
  eye: "/wallet/eye.svg",
  clock: "/wallet/clock.svg",
  arrow: "/wallet/arrow.svg",
  wallet: "/wallet/wallet-icon.svg",
} as const;

function fmtUsdc(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function truncateAddress(addr: string) {
  return addr.length < 12 ? addr : `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
function fmtTxDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Panel({
  children, gradient, style, className,
}: { children: React.ReactNode; gradient?: string; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: gradient ?? "transparent",
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 24,
        fontFamily: F,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: WalletTransaction["status"] }) {
  const map = {
    completed: { bg: C.successBg, fg: C.success, label: "Completed" },
    pending: { bg: C.warningBg, fg: C.warning, label: "Pending" },
    failed: { bg: C.dangerBg, fg: C.danger, label: "Failed" },
  }[status];
  return (
    <span style={{
      display: "inline-flex", padding: "4px 8px", borderRadius: 999,
      background: map.bg, color: map.fg, fontSize: 10, fontWeight: 500, lineHeight: "14px",
    }}>
      {map.label}
    </span>
  );
}

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const isPositive = tx.amount_usdc >= 0;
  return (
    <div className="flex items-center gap-3" style={{ height: 68, padding: "8px 12px", borderRadius: 16 }}>
      <span className="shrink-0 grid place-items-center rounded-full" style={{ width: 36, height: 36, background: C.elevated }}>
        <img src={ICON.arrow} alt="" style={{ width: 18, height: 18, transform: isPositive ? undefined : "rotate(180deg)" }} />
      </span>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 14, fontWeight: 500, color: C.text, margin: 0 }} className="truncate">{tx.label}</p>
        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
          {fmtTxDate(tx.date)} · {tx.type === "reward" ? "Reward" : "Transfer"}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span style={{ fontSize: 12, color: isPositive ? C.success : C.text, whiteSpace: "nowrap" }}>
          {isPositive ? "+" : "−"}{fmtUsdc(Math.abs(tx.amount_usdc))} USDC
        </span>
        <StatusPill status={tx.status} />
        {tx.status === "failed" && tx.error && (
          <span style={{ fontSize: 10, color: C.danger, maxWidth: 140, textAlign: "right" }}>{tx.error}</span>
        )}
      </div>
    </div>
  );
}

// ── Connect / change wallet ─────────────────────────────────────────────────
function ChangeWalletModal({
  currentAddress, onClose, onSaved,
}: { currentAddress: string | null; onClose: () => void; onSaved: (address: string) => void }) {
  const [address, setAddress] = useState(currentAddress ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("Enter a valid Base address — starts with 0x, 42 characters.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveWallet({ wallet_address: address, wallet_chain: "base" });
      onSaved(address);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#0a0d16", border: `1px solid ${C.cardBorder}`, borderRadius: 24, padding: 24, width: 400, maxWidth: "100%", fontFamily: F }}
      >
        <p style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: 0 }}>Withdrawal wallet</p>
        <p style={{ fontSize: 13, color: C.muted, margin: "6px 0 20px" }}>
          Withdrawals only support a Base address right now.
        </p>
        {error && (
          <div style={{ background: C.dangerBg, color: C.danger, fontSize: 13, padding: "10px 12px", borderRadius: 12, marginBottom: 14 }}>
            {error}
          </div>
        )}
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value.trim())}
          placeholder="0x..."
          style={{ width: "100%", padding: "12px 16px", borderRadius: 16, border: `1px solid ${C.divider}`, background: C.canvas, color: C.text, fontSize: 13.5, fontFamily: "monospace" }}
        />
        <div className="flex gap-3" style={{ marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px 0", borderRadius: 16, border: `1px solid ${C.divider}`, background: "transparent", color: C.muted, fontSize: 13.5, fontWeight: 500 }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !address}
            style={{ flex: 1, padding: "12px 0", borderRadius: 16, border: "none", backgroundImage: GRAD.button, color: "#fff", fontSize: 13.5, fontWeight: 500, opacity: saving || !address ? 0.6 : 1 }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm withdrawal ───────────────────────────────────────────────────────
function ConfirmWithdrawModal({
  amount, fee, destination, onClose, onConfirmed,
}: { amount: number; fee: number; destination: string; onClose: () => void; onConfirmed: () => void }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const net = Math.max(0, amount - fee);

  const handleConfirm = async () => {
    setState("sending");
    setError(null);
    try {
      const result = await requestWithdrawal(amount);
      setTxHash(result.tx_hash);
      setState("done");
    } catch (err: any) {
      setError(err.message ?? "Withdrawal failed.");
      setState("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={state === "sending" ? undefined : onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#0a0d16", border: `1px solid ${C.cardBorder}`, borderRadius: 24, padding: 24, width: 400, maxWidth: "100%", fontFamily: F }}
      >
        {state === "done" ? (
          <>
            <p style={{ fontSize: 18, fontWeight: 600, color: C.success, margin: 0 }}>Withdrawal sent</p>
            <p style={{ fontSize: 13, color: C.muted, margin: "8px 0 4px" }}>{fmtUsdc(net)} USDC is on its way to your wallet.</p>
            {txHash && (
              <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.accent }}>
                View on Basescan →
              </a>
            )}
            <button
              onClick={onConfirmed}
              style={{ width: "100%", marginTop: 20, padding: "12px 0", borderRadius: 16, border: "none", backgroundImage: GRAD.button, color: "#fff", fontSize: 13.5, fontWeight: 500 }}
            >
              Done
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: 0 }}>Confirm withdrawal</p>
            <p style={{ fontSize: 13, color: C.muted, margin: "6px 0 20px" }}>Funds are sent immediately once confirmed — this can't be undone.</p>

            <div className="flex flex-col gap-3" style={{ fontSize: 13 }}>
              {[
                ["Amount", `${fmtUsdc(amount)} USDC`],
                ["To", truncateAddress(destination)],
                ["Network", "Base"],
                ["Network fee", `${fmtUsdc(fee)} USDC`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span style={{ color: C.muted }}>{label}</span>
                  <span style={{ color: C.text, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: C.divider, margin: "4px 0" }} />
              <div className="flex items-center justify-between">
                <span style={{ color: C.text, fontWeight: 500 }}>You receive</span>
                <span style={{ color: C.text, fontWeight: 600, fontSize: 16 }}>{fmtUsdc(net)} USDC</span>
              </div>
            </div>

            {error && (
              <div style={{ background: C.dangerBg, color: C.danger, fontSize: 13, padding: "10px 12px", borderRadius: 12, marginTop: 16 }}>
                {error}
              </div>
            )}

            <div className="flex gap-3" style={{ marginTop: 20 }}>
              <button onClick={onClose} disabled={state === "sending"} style={{ flex: 1, padding: "12px 0", borderRadius: 16, border: `1px solid ${C.divider}`, background: "transparent", color: C.muted, fontSize: 13.5, fontWeight: 500, opacity: state === "sending" ? 0.5 : 1 }}>
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={state === "sending"}
                style={{ flex: 1, padding: "12px 0", borderRadius: 16, border: "none", backgroundImage: GRAD.button, color: "#fff", fontSize: 13.5, fontWeight: 500, opacity: state === "sending" ? 0.7 : 1 }}
              >
                {state === "sending" ? "Sending..." : "Confirm & send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Balance hero card ────────────────────────────────────────────────────────
function BalanceCard({ balance }: { balance: WalletBalance }) {
  const [revealed, setRevealed] = useState(true);
  const mask = (s: string) => (revealed ? s : "••••••");

  return (
    <Panel gradient={GRAD.balanceCard} style={{ padding: 32 }}>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 14, fontWeight: 500, color: C.muted }}>Available to withdraw</span>
        <button onClick={() => setRevealed((r) => !r)} aria-label={revealed ? "Hide balance" : "Show balance"}>
          <img src={ICON.eye} alt="" style={{ width: 20, height: 20, opacity: revealed ? 1 : 0.5 }} />
        </button>
      </div>

      <div className="flex items-baseline gap-3" style={{ marginTop: 8 }}>
        <span style={{ fontSize: "clamp(36px, 9vw, 72px)", fontWeight: 500, lineHeight: 1.1, color: C.text }}>{mask(fmtUsdc(balance.available_to_withdraw))}</span>
        <span style={{ fontSize: 18, fontWeight: 600, color: C.accent }}>USDC</span>
      </div>

      <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
        <span style={{ fontSize: 14, color: C.success }}>
          {balance.this_month_usdc > 0 ? `↗ +${fmtUsdc(balance.this_month_usdc)} USDC this month` : "No change this month"}
        </span>
        <span style={{ fontSize: 12, color: C.muted }}>Updated just now</span>
      </div>

      <div style={{ height: 1, background: C.divider, opacity: 0.6, margin: "24px 0" }} />

      <div className="flex gap-8">
        <div className="flex-1">
          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Pending rewards</p>
          <p style={{ margin: "8px 0 0" }}>
            <span style={{ fontSize: 28, fontWeight: 600, color: C.text }}>{mask(fmtUsdc(balance.pending_rewards))}</span>{" "}
            <span style={{ fontSize: 12, color: C.muted }}>USDC</span>
          </p>
        </div>
        <div className="flex-1">
          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Lifetime earned</p>
          <p style={{ margin: "8px 0 0" }}>
            <span style={{ fontSize: 28, fontWeight: 600, color: C.text }}>{mask(fmtUsdc(balance.lifetime_earned))}</span>{" "}
            <span style={{ fontSize: 12, color: C.muted }}>USDC</span>
          </p>
        </div>
      </div>
    </Panel>
  );
}

// ── Withdraw panel ───────────────────────────────────────────────────────────
function WithdrawPanel({
  balance, feeUsdc, treasuryConfigured, walletAddress, onWalletChanged, onWithdrawn,
}: {
  balance: WalletBalance; feeUsdc: number; treasuryConfigured: boolean;
  walletAddress: string | null; onWalletChanged: (a: string) => void; onWithdrawn: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [changingWallet, setChangingWallet] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const numeric = Number(amount);
  const isValidAmount = amount !== "" && Number.isFinite(numeric) && numeric > feeUsdc && numeric <= balance.available_to_withdraw;
  const canWithdraw = isValidAmount && !!walletAddress && treasuryConfigured;
  const net = isValidAmount ? Math.max(0, numeric - feeUsdc) : null;

  const handleAmountChange = (raw: string) => {
    if (raw === "" || /^\d*\.?\d{0,2}$/.test(raw)) setAmount(raw);
  };

  return (
    <>
      <Panel gradient={GRAD.glassPanel} style={{ padding: 24, width: "100%" }} className="flex flex-col gap-6">
        <div>
          <p style={{ fontSize: 28, fontWeight: 600, color: C.text, margin: 0 }}>Withdraw USDC</p>
          <p style={{ fontSize: 14, color: C.muted, margin: "4px 0 0" }}>Send earnings to your wallet.</p>
        </div>

        {!treasuryConfigured && (
          <div style={{ background: C.warningBg, color: C.warning, fontSize: 12.5, padding: "10px 14px", borderRadius: 14, lineHeight: 1.5 }}>
            Withdrawals aren't turned on yet — check back soon.
          </div>
        )}

        <div style={{ background: C.canvas, border: `1px solid ${C.divider}`, borderRadius: 24, padding: 20 }}>
          <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
            <span style={{ color: C.muted }}>Amount</span>
            <button
              onClick={() => setAmount(String(balance.available_to_withdraw))}
              style={{ color: C.accent, fontWeight: 500 }}
            >
              Max
            </button>
          </div>
          <div className="flex items-baseline gap-3" style={{ marginTop: 8 }}>
            <input
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              style={{ background: "transparent", border: "none", outline: "none", color: C.text, fontSize: "clamp(28px, 7vw, 48px)", fontWeight: 500, width: "100%", minWidth: 0, fontFamily: F }}
            />
            <span style={{ fontSize: 14, color: C.accent, fontWeight: 600, whiteSpace: "nowrap" }}>USDC</span>
          </div>
          <p style={{ fontSize: 12, color: C.muted, margin: "8px 0 0" }}>Available: {fmtUsdc(balance.available_to_withdraw)} USDC</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>Send to</span>
            <button onClick={() => setChangingWallet(true)} style={{ fontSize: 12, color: C.accent }}>Change</button>
          </div>
          <div className="flex items-center gap-3" style={{ background: C.canvas, borderRadius: 16, padding: 16 }}>
            <img src={ICON.wallet} alt="" style={{ width: 20, height: 20 }} />
            {walletAddress ? (
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: C.text, margin: 0 }}>My creator wallet</p>
                <p style={{ fontSize: 12, color: C.muted, margin: 0, fontFamily: "monospace" }}>{truncateAddress(walletAddress)}</p>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>No wallet connected — add one to withdraw.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between" style={{ fontSize: 14 }}>
          <span style={{ color: C.muted }}>Network</span>
          <span style={{ color: C.text, fontWeight: 500 }}>Base</span>
        </div>

        <div style={{ height: 1, background: C.divider }} />

        <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
          <span style={{ color: C.muted }}>Network fee</span>
          <span style={{ color: C.text }}>{fmtUsdc(feeUsdc)} USDC</span>
        </div>

        <div className="flex items-center justify-between">
          <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>You receive</span>
          <span style={{ fontSize: 18, fontWeight: 600, color: C.text }}>{net != null ? `${fmtUsdc(net)} USDC` : "—"}</span>
        </div>

        <button
          onClick={() => setConfirming(true)}
          disabled={!canWithdraw}
          style={{
            height: 52, borderRadius: 16, border: "none", color: "#fff", fontSize: 14, fontWeight: 500,
            backgroundImage: canWithdraw ? GRAD.button : undefined,
            background: canWithdraw ? undefined : C.elevated,
            cursor: canWithdraw ? "pointer" : "not-allowed",
            opacity: canWithdraw ? 1 : 0.6,
          }}
        >
          Review withdrawal
        </button>
        <p style={{ fontSize: 12, color: C.muted, margin: 0, textAlign: "center" }}>You'll confirm before funds are sent.</p>
      </Panel>

      {changingWallet && (
        <ChangeWalletModal
          currentAddress={walletAddress}
          onClose={() => setChangingWallet(false)}
          onSaved={(a) => { onWalletChanged(a); setChangingWallet(false); }}
        />
      )}
      {confirming && walletAddress && isValidAmount && (
        <ConfirmWithdrawModal
          amount={numeric}
          fee={feeUsdc}
          destination={walletAddress}
          onClose={() => setConfirming(false)}
          onConfirmed={() => { setConfirming(false); setAmount(""); onWithdrawn(); }}
        />
      )}
    </>
  );
}

// ── Recent transactions (preview, on the Balance tab) ───────────────────────
function RecentTransactions({ transactions, loading, onViewAll }: { transactions: WalletTransaction[] | null; loading: boolean; onViewAll: () => void }) {
  const [filter, setFilter] = useState<"all" | "reward" | "withdrawal">("all");
  const filtered = (transactions ?? []).filter((t) => filter === "all" || t.type === filter).slice(0, 4);

  return (
    <Panel gradient={GRAD.glassPanel} style={{ padding: 24, width: "100%" }} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: 0 }}>Recent transactions</p>
        <button onClick={onViewAll} style={{ fontSize: 12, color: C.accent }}>View all →</button>
      </div>
      <div className="flex gap-4">
        {([["all", "All activity"], ["reward", "Rewards"], ["withdrawal", "Withdrawals"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: 12, borderRadius: 999, fontSize: 12,
              background: filter === key ? C.elevated : "transparent",
              color: filter === key ? C.text : C.muted,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={{ fontSize: 13, color: C.muted }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: C.muted }}>No transactions yet.</p>
      ) : (
        <div className="flex flex-col">
          {filtered.map((tx) => <TransactionRow key={`${tx.type}-${tx.id}`} tx={tx} />)}
        </div>
      )}
    </Panel>
  );
}

// ── Full transactions view (Transactions tab) ───────────────────────────────
function TransactionsView({ transactions, loading }: { transactions: WalletTransaction[] | null; loading: boolean }) {
  const [filter, setFilter] = useState<"all" | "reward" | "withdrawal">("all");
  const filtered = (transactions ?? []).filter((t) => filter === "all" || t.type === filter);

  return (
    <Panel gradient={GRAD.glassPanel} style={{ padding: 24, width: "100%", maxWidth: 706 }} className="flex flex-col gap-4">
      <p style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: 0 }}>All transactions</p>
      <div className="flex gap-4">
        {([["all", "All activity"], ["reward", "Rewards"], ["withdrawal", "Withdrawals"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: 12, borderRadius: 999, fontSize: 12,
              background: filter === key ? C.elevated : "transparent",
              color: filter === key ? C.text : C.muted,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={{ fontSize: 13, color: C.muted }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: C.muted }}>No transactions yet.</p>
      ) : (
        <div className="flex flex-col">
          {filtered.map((tx) => <TransactionRow key={`${tx.type}-${tx.id}`} tx={tx} />)}
        </div>
      )}
    </Panel>
  );
}

export default function WalletPage() {
  usePageTitle("Zerra · Wallet");
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "transactions" ? "transactions" : "balance";

  const { user, refresh } = useCurrentUser();
  const [walletAddress, setWalletAddress] = useState<string | null | undefined>(undefined);

  const [balanceData, setBalanceData] = useState<{ balance: WalletBalance; treasuryConfigured: boolean; withdrawalFeeUsdc: number } | null>(null);
  const [balanceError, setBalanceError] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[] | null>(null);
  const [txError, setTxError] = useState(false);

  useEffect(() => {
    if (walletAddress === undefined && user) setWalletAddress(user.wallet_address ?? null);
  }, [user, walletAddress]);

  const loadBalance = () => {
    getWalletBalance().then((d) => setBalanceData(d)).catch(() => setBalanceError(true));
  };
  const loadTransactions = () => {
    getWalletTransactions().then((d) => setTransactions(d.transactions)).catch(() => setTxError(true));
  };

  useEffect(() => { loadBalance(); loadTransactions(); }, []);

  const refreshAfterWithdraw = () => { loadBalance(); loadTransactions(); };

  return (
    <div className="pb-12" style={{ fontFamily: F }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 28, fontWeight: 600, color: C.text, margin: 0 }}>Your content. Your earnings.</p>
        <p style={{ fontSize: 14, color: C.muted, margin: "6px 0 0" }}>Track your rewards and move available USDC to your wallet.</p>
      </div>

      {tab === "balance" ? (
        balanceError ? (
          <p style={{ fontSize: 13, color: C.muted }}>Couldn't load your balance. Try refreshing.</p>
        ) : !balanceData ? (
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
            <div style={{ height: 320, borderRadius: 24, background: C.elevated, opacity: 0.4 }} className="animate-pulse" />
            <div style={{ height: 320, borderRadius: 24, background: C.elevated, opacity: 0.4 }} className="animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6 items-start">
            <div className="flex flex-col gap-6">
              <BalanceCard balance={balanceData.balance} />
              <div className="flex items-center gap-2">
                <img src={ICON.clock} alt="" style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: 12, color: C.muted }}>Pending rewards become available after content approval.</span>
              </div>
              <RecentTransactions
                transactions={transactions}
                loading={transactions === null && !txError}
                onViewAll={() => setSearchParams({ tab: "transactions" })}
              />
            </div>
            <WithdrawPanel
              balance={balanceData.balance}
              feeUsdc={balanceData.withdrawalFeeUsdc}
              treasuryConfigured={balanceData.treasuryConfigured}
              walletAddress={walletAddress ?? null}
              onWalletChanged={(a) => { setWalletAddress(a); if (refresh) refresh(); }}
              onWithdrawn={refreshAfterWithdraw}
            />
          </div>
        )
      ) : txError ? (
        <p style={{ fontSize: 13, color: C.muted }}>Couldn't load your transactions. Try refreshing.</p>
      ) : (
        <TransactionsView transactions={transactions} loading={transactions === null} />
      )}
    </div>
  );
}
