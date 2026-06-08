import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@/contexts/AuthContext";
import { saveWallet } from "@/lib/api";
import { cn } from "@/lib/cn";
import { DiamondIcon } from "@/components/icons/DiamondIcon";

const CHAINS = [
  { id: "ethereum", label: "Ethereum", symbol: "ETH", color: "rgb(98 126 234)", prefix: "0x" },
  { id: "solana",   label: "Solana",   symbol: "SOL", color: "rgb(153 69 255)", prefix: "" },
  { id: "base",     label: "Base",     symbol: "ETH", color: "rgb(0 82 255)",   prefix: "0x" },
];

function truncateAddress(addr: string) {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function WalletCard({ address, chain, onDisconnect }: { address: string; chain: string; onDisconnect: () => void }) {
  const chainInfo = CHAINS.find((c) => c.id === chain) ?? CHAINS[0];
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6"
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

      {/* Glow */}
      <div aria-hidden className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${chainInfo.color}20 0%, transparent 70%)` }} />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl border border-white/[0.08] flex items-center justify-center text-[13px] font-bold"
            style={{ background: `${chainInfo.color}18`, color: chainInfo.color }}>
            {chainInfo.symbol}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-fg-primary">{chainInfo.label} Wallet</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-[12px] text-success">Connected</span>
            </div>
          </div>
        </div>
        <button onClick={onDisconnect} className="text-[12.5px] text-danger hover:opacity-80 transition-opacity">
          Disconnect
        </button>
      </div>

      {/* Address */}
      <div className="relative mt-6 p-4 rounded-xl border border-white/[0.05] bg-bg-base/60">
        <p className="text-[11px] text-fg-tertiary mb-1.5">Wallet Address</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13.5px] font-mono text-fg-primary break-all">{address}</p>
          <button onClick={handleCopy}
            className="shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-white/[0.06] bg-bg-elevated text-fg-secondary hover:text-fg-primary transition-colors">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Airdrop status */}
      <div className="relative mt-4 p-4 rounded-xl border border-white/[0.05] bg-bg-base/60">
        <p className="text-[11px] text-fg-tertiary mb-1.5">Airdrop / Reward Address</p>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
          <p className="text-[13px] text-fg-primary">
            {truncateAddress(address)} is set as your reward address
          </p>
        </div>
        <p className="mt-1.5 text-[11.5px] text-fg-tertiary">
          Campaign rewards and airdrops will be sent to this address.
        </p>
      </div>
    </div>
  );
}

function ConnectWalletForm({ onConnect }: { onConnect: (address: string, chain: string) => void }) {
  const [address,  setAddress]  = useState("");
  const [chain,    setChain]    = useState("ethereum");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const validateAddress = (addr: string, chainId: string) => {
    if (chainId === "solana") return addr.length >= 32 && addr.length <= 44;
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleConnect = async () => {
    if (!address) { setError("Please enter a wallet address."); return; }
    if (!validateAddress(address, chain)) {
      setError(chain === "solana"
        ? "Invalid Solana address. Should be 32-44 characters."
        : "Invalid Ethereum address. Should start with 0x and be 42 characters.");
      return;
    }
    setSaving(true); setError(null);
    try {
      await onConnect(address, chain);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6"
      style={{ background: "rgb(var(--bg-card))" }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />

      <div className="relative">
        <h3 className="text-[15px] font-semibold text-fg-primary">Connect Your Wallet</h3>
        <p className="text-[12.5px] text-fg-tertiary mt-1">
          Add your wallet address to receive campaign rewards and airdrops.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl text-[13px] bg-[rgb(var(--danger)/0.08)] border border-[rgb(var(--danger)/0.2)] text-[rgb(var(--danger))]">
            {error}
          </div>
        )}

        {/* Chain selector */}
        <div className="mt-5">
          <p className="text-[12.5px] text-fg-tertiary mb-2">Select Network</p>
          <div className="grid grid-cols-3 gap-3">
            {CHAINS.map((c) => (
              <button key={c.id} onClick={() => { setChain(c.id); setAddress(""); setError(null); }}
                className={cn(
                  "p-3 rounded-xl border text-center transition-all",
                  chain === c.id
                    ? "border-brand/50 bg-brand/10"
                    : "border-white/[0.06] bg-bg-base/40 hover:border-white/[0.12]"
                )}>
                <p className="text-[13px] font-semibold" style={{ color: chain === c.id ? c.color : "rgb(var(--fg-primary))" }}>
                  {c.label}
                </p>
                <p className="text-[11px] text-fg-tertiary mt-0.5">{c.symbol}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Address input */}
        <div className="mt-4">
          <p className="text-[12.5px] text-fg-tertiary mb-2">Wallet Address</p>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value.trim())}
            placeholder={chain === "solana" ? "Enter Solana address..." : "0x..."}
            className="w-full px-4 py-3 rounded-xl border border-white/[0.06] bg-bg-base/60 text-[13.5px] font-mono text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-white/[0.15] transition-colors"
          />
          <p className="mt-1.5 text-[11.5px] text-fg-muted">
            {chain === "solana"
              ? "Solana wallet address (32-44 characters)"
              : "Ethereum-compatible address starting with 0x"}
          </p>
        </div>

        <button
          onClick={handleConnect}
          disabled={saving || !address}
          className="mt-5 w-full py-3 rounded-xl text-[13.5px] font-semibold border border-white/[0.08] bg-brand text-white hover:bg-brand/90 transition-colors disabled:opacity-50"
          style={{ background: "rgb(74 125 255)" }}
        >
          {saving ? "Saving..." : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
}

export default function WalletPage() {
  usePageTitle("Zerra · Wallet");
  const { user, refresh } = useCurrentUser() as any;
  const { session } = useAuth();

  const walletAddress = user?.wallet_address ?? null;
  const walletChain   = user?.wallet_chain   ?? "ethereum";

  const handleConnect = async (address: string, chain: string) => {
    await saveWallet({ wallet_address: address, wallet_chain: chain });
    if (refresh) refresh();
  };

  const handleDisconnect = async () => {
    await saveWallet({ wallet_address: "", wallet_chain: walletChain });
    if (refresh) refresh();
  };

  return (
    <div className="pb-12 space-y-8">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">Airdrop & reward address</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium tracking-[-0.03em]",
          "text-[64px] leading-[0.95]",
          "bg-clip-text text-transparent",
          "bg-gradient-to-b from-white via-white to-[#7d8aa8]"
        )}>
          Wallet
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
        <div className="space-y-4">
          {walletAddress ? (
            <WalletCard address={walletAddress} chain={walletChain} onDisconnect={handleDisconnect} />
          ) : (
            <ConnectWalletForm onConnect={handleConnect} />
          )}
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6"
            style={{ background: "rgb(var(--bg-card))" }}>
            <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
            <div className="relative">
              <h3 className="text-[15px] font-semibold text-fg-primary mb-4">How it works</h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Connect your wallet", desc: "Add your Ethereum, Solana, or Base wallet address." },
                  { step: "2", title: "Participate in campaigns", desc: "Claim bounties and create qualifying content." },
                  { step: "3", title: "Receive rewards", desc: "USDC and airdrop tokens are sent directly to your wallet." },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-brand/15 border border-brand/25 flex items-center justify-center text-[12px] font-bold text-brand shrink-0">
                      {step}
                    </div>
                    <div>
                      <p className="text-[13.5px] font-medium text-fg-primary">{title}</p>
                      <p className="text-[12px] text-fg-tertiary mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5"
            style={{ background: "rgb(var(--bg-card))" }}>
            <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
            <div className="relative flex items-start gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-[12.5px] text-fg-tertiary leading-relaxed">
                We only store your wallet address for reward delivery. We never ask for your private key or seed phrase. Zerra cannot access or move funds in your wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}