/** Renders a user's avatar image, or initials as a fallback. Shared by Sidebar (desktop) and MobileIdentityHeader. */
export function UserAvatar({ name, avatar }: { name: string | null; avatar: string | null }) {
  if (avatar) {
    return <img src={avatar} alt={name ?? "User"} className="w-full h-full object-cover" />;
  }
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  return (
    <div className="w-full h-full flex items-center justify-center bg-bg-elevated text-fg-secondary text-[15px] font-semibold">
      {initials}
    </div>
  );
}