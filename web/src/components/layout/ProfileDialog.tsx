import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "~/hooks/use-auth";
import { useToast } from "~/hooks/use-toast";
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
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("profile.title")}</DialogTitle>
          <DialogDescription>{t("profile.subtitle")}</DialogDescription>
        </DialogHeader>
        <ProfileForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ProfileForm({ onClose }: { onClose: () => void }) {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
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
          throw new Error(t("profile.bothPasswordRequired"));
        }
        await changePassword({
          old_password: oldPassword,
          new_password: newPassword,
        });
      }

      await refreshUser();
      onClose();
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-name">{t("profile.username")}</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("profile.usernamePlaceholder")}
          autoComplete="username"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-avatar">{t("profile.avatarUrl")}</Label>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={avatar || undefined} alt={t("profile.avatarPreview")} />
            <AvatarFallback>
              {(name || t("profile.avatarFallback")).slice(0, 1).toUpperCase()}
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

      <div className="text-sm font-medium">{t("profile.changePassword")}</div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-old-password">{t("profile.oldPassword")}</Label>
        <Input
          id="profile-old-password"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-new-password">{t("profile.newPassword")}</Label>
        <Input
          id="profile-new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={t("profile.passwordPlaceholder")}
          autoComplete="new-password"
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={busy}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? t("common.saving") : t("common.save")}
        </Button>
      </DialogFooter>
    </form>
  );
}
