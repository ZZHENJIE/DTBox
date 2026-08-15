import { useState, type FormEvent } from "react";

import { useAuth } from "~/hooks/use-auth";
import { changePassword, updateProfile } from "~/lib/endpoints";
import type { UserProfileRequest } from "~/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>修改信息</DialogTitle>
          <DialogDescription>更改用户名、头像 URL 或密码</DialogDescription>
        </DialogHeader>
        <ProfileForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ProfileForm({ onClose }: { onClose: () => void }) {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const profile: UserProfileRequest = {};
      if (name !== (user?.name ?? "")) {
        profile.name = name;
      }
      if (avatar !== (user?.avatar ?? "")) {
        profile.avatar = avatar;
      }
      if (Object.keys(profile).length > 0) {
        await updateProfile(profile);
      }

      if (oldPassword || newPassword) {
        if (!oldPassword || !newPassword) {
          throw new Error("修改密码需同时填写旧密码与新密码");
        }
        await changePassword({
          old_password: oldPassword,
          new_password: newPassword,
        });
      }

      await refreshUser();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-name">用户名</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="至少 5 位，字母/数字/下划线"
          autoComplete="username"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-avatar">头像 URL</Label>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={avatar || undefined} alt="头像预览" />
            <AvatarFallback>
              {(name || "用").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Input
            id="profile-avatar"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://example.com/avatar.png"
          />
        </div>
      </div>

      <Separator />

      <div className="text-sm font-medium">修改密码</div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-old-password">旧密码</Label>
        <Input
          id="profile-old-password"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-new-password">新密码</Label>
        <Input
          id="profile-new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="至少 8 位，含大小写与数字"
          autoComplete="new-password"
        />
      </div>

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={busy}
        >
          取消
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "保存中…" : "保存"}
        </Button>
      </DialogFooter>
    </form>
  );
}
