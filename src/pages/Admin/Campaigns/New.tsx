import { useState } from "react";
import { DiamondIcon } from "@/components/icons/DiamondIcon";
import { apiPost } from "@/lib/api/client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import { X, Copy, Check } from "lucide-react";

function TagInput({ label, placeholder, values, onChange, prefix }: {
  label: string; placeholder: string; values: string[];
  onChange: (v: string[]) => void; prefix?: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const formatted = prefix && !trimmed.startsWith(prefix) ? `${prefix}${trimmed}` : trimmed;
    if (!values.includes(formatted)) onChange([...values, formatted]);
    setInput("");
  };

  return (
    <div>
      <p className="text-[12.5px] text-fg-tertiary mb-2">{label}</p>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-bg-base/60 text-[13.5px] text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-white/[0.15] transition-colors" />
        <button onClick={addTag} type="button"
          className="px-4 py-2.5 rounded-xl text-[12.5px] font-medium border border-white/[0.08] bg-bg-elevated text-fg-primary hover:bg-bg-card transition-colors">
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {values.map((v) => (
            <span key={v} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] border border-brand/25 bg-brand/10 text-brand">
              {v}
              <button onClick={() => onChange(values.filter((x) => x !== v))} type="button">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <p className="text-[12.5px] text-fg-tertiary mb-2">{label}</p>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-white/[0.06] bg-bg-base/60 text-[13.5px] text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-white/[0.15] transition-colors";

export default function AdminCampaignNewPage() {
  usePageTitle("Zerra Admin · New Campaign");
  const navigate = useNavigate();

  const [projectName,   setProjectName]   = useState("");
  const [contactEmail,  setContactEmail]  = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tokenIconUrl,  setTokenIconUrl]  = useState("");
  const [campaignTitle, setCampaignTitle] = useState("");
  const [description,   setDescription]   = useState("");
  const [hashtags,      setHashtags]      = useState<string[]>([]);
  const [keywords,      setKeywords]      = useState<string[]>([]);
  const [rewardUsdc,    setRewardUsdc]    = useState("");
  const [totalBudget,   setTotalBudget]   = useState("");
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [credentials,   setCredentials]   = useState<{ email: string; tempPassword: string } | null>(null);
  const [copied,        setCopied]        = useState<string | null>(null);

  const handleCreate = async () => {
    if (!projectName || !contactEmail || !campaignTitle || hashtags.length === 0) {
      setError("Project name, contact email, campaign title, and at least one hashtag are required.");
      return;
    }
    setSaving(true); setError(null);
    try {
      const res = await apiPost<{
        campaign: any;
        generatedCredentials: { email: string; tempPassword: string } | null;
      }>("/admin/campaigns", {
        projectName,
        projectContactEmail: contactEmail,
        campaignTitle,
        description,
        coverImageUrl: coverImageUrl || undefined,
        tokenIconUrl: tokenIconUrl || undefined,
        requiredHashtags: hashtags,
        requiredKeywords: keywords,
        rewardUsdc:       rewardUsdc   ? Number(rewardUsdc)   : undefined,
        totalBudgetUsdc:  totalBudget  ? Number(totalBudget)  : undefined,
      });
      if (res.generatedCredentials) {
        setCredentials(res.generatedCredentials);
      } else {
        navigate("/admin/campaigns");
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Credential reveal — shown once after creation
  if (credentials) {
    return (
      <div className="pb-12 max-w-lg">
        <div className="pt-2 mb-6">
          <div className="flex items-center gap-2.5 text-fg-tertiary">
            <DiamondIcon size={14} />
            <span className="text-[12.5px]">Campaign created</span>
          </div>
          <h2 className="mt-4 text-[28px] md:text-[36px] font-display font-medium text-fg-primary">
            Save these credentials
          </h2>
          <p className="mt-2 text-[13px] text-fg-tertiary leading-relaxed">
            This password is shown only once and cannot be retrieved again. Share it securely with the project.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-brand/25 bg-brand/5 p-5 space-y-4">
          {[
            { label: "Login Email", value: credentials.email, key: "email" },
            { label: "Temporary Password", value: credentials.tempPassword, key: "password" },
          ].map(({ label, value, key }) => (
            <div key={key}>
              <p className="text-[11px] text-fg-tertiary mb-1.5">{label}</p>
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-bg-base/60 border border-white/[0.06]">
                <p className="text-[13.5px] font-mono text-fg-primary truncate">{value}</p>
                <button onClick={() => copy(value, key)} className="shrink-0 text-fg-tertiary hover:text-fg-primary">
                  {copied === key ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate("/admin/campaigns")}
          className="mt-6 w-full py-3 rounded-xl text-[13.5px] font-semibold text-white"
          style={{ background: "rgb(74 125 255)" }}>
          Done — Go to Campaigns
        </button>
      </div>
    );
  }

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 space-y-4"
      style={{ background: "rgb(var(--bg-card))" }}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent)" }} />
      <p className="relative text-[14px] font-semibold text-fg-primary">{title}</p>
      {children}
    </div>
  );

  return (
    <div className="pb-12 max-w-lg space-y-6">
      <div className="pt-2">
        <div className="flex items-center gap-2.5 text-fg-tertiary">
          <DiamondIcon size={14} />
          <span className="text-[12.5px]">New campaign</span>
        </div>
        <h2 className="mt-4 text-[28px] md:text-[36px] font-display font-medium text-fg-primary">
          Create Campaign
        </h2>
      </div>

      {error && (
        <div className="p-3 rounded-xl text-[13px] bg-[rgb(var(--danger)/0.08)] border border-[rgb(var(--danger)/0.2)] text-[rgb(var(--danger))]">
          {error}
        </div>
      )}

      <Card title="Project Details">
        <Field label="Project Name">
          <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. ZerraSwap" className={inputCls} />
        </Field>
        <Field label="Contact Email (becomes their login)">
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
            placeholder="team@project.com" className={inputCls} />
        </Field>
        <Field label="Campaign Cover Image URL (shown on the campaign card)">
          <input type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://..." className={inputCls} />
          {coverImageUrl && (
            <div className="mt-2 h-24 rounded-xl overflow-hidden border border-white/[0.06]">
              <img src={coverImageUrl} alt="preview" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
        </Field>
        <Field label="Token / Project Icon URL (small logo shown on card)">
          <input type="url" value={tokenIconUrl} onChange={(e) => setTokenIconUrl(e.target.value)}
            placeholder="https://..." className={inputCls} />
        </Field>
      </Card>

      <Card title="Campaign Details">
        <Field label="Campaign Title">
          <input type="text" value={campaignTitle} onChange={(e) => setCampaignTitle(e.target.value)}
            placeholder="e.g. ZerraSwap Launch Campaign" className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the campaign..."
            rows={3} className={inputCls + " resize-none"} />
        </Field>
        <TagInput
          label="Required Hashtags (creators must include these in their caption)"
          placeholder="zerraswap" values={hashtags} onChange={setHashtags} prefix="#" />
        <TagInput
          label="Required Keywords (must be SAID out loud in the video)"
          placeholder="swap on zerra" values={keywords} onChange={setKeywords} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Reward per Creator (USDC)">
            <input type="number" value={rewardUsdc} onChange={(e) => setRewardUsdc(e.target.value)}
              placeholder="50" className={inputCls} />
          </Field>
          <Field label="Total Budget (USDC)">
            <input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)}
              placeholder="5000" className={inputCls} />
          </Field>
        </div>
      </Card>

      <button onClick={handleCreate} disabled={saving}
        className="w-full py-3 rounded-xl text-[13.5px] font-semibold text-white disabled:opacity-50 transition-opacity"
        style={{ background: "rgb(74 125 255)" }}>
        {saving ? "Creating..." : "Create Campaign"}
      </button>
    </div>
  );
}