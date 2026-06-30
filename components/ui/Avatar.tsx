import { avaClass, initials } from "@/lib/format";

type AvatarSize = "sm" | "md" | "lg";

/** Photo avatar if `avatarUrl` is set, otherwise colored initials (ported from `ava()`). */
export function Avatar({
  id,
  name,
  avatarUrl,
  size = "md",
}: {
  id: string;
  name: string;
  avatarUrl?: string | null;
  size?: AvatarSize;
}) {
  if (avatarUrl) {
    return (
      <div
        className={`ava ${size} has-img`}
        style={{ backgroundImage: `url('${avatarUrl}')` }}
      />
    );
  }
  return <div className={`ava ${size} ${avaClass(id)}`}>{initials(name)}</div>;
}
