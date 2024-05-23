"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";

import { api } from "~/trpc/react";

export function UserProfileDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const userId = user?.publicMetadata?.id as string;
  const [imageUrl, setImageUrl] = useState(user?.imageUrl ?? "");
  const [newImageUrl, setNewImageUrl] = useState<string | undefined>(undefined);
  const [newImageFile, setNewImageFile] = useState<File | undefined>(undefined);
  const { data: userInOurDb } = api.user.getUserById.useQuery(
    {
      userId,
    },
    {
      enabled: userId != null,
    },
  );
  const [name, setName] = useState(userInOurDb?.name ?? "");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { mutateAsync: editConectaProfUser } =
    api.user.editConectaProfUser.useMutation();

  useEffect(() => {
    if (!userInOurDb) return;
    if (name === userInOurDb.name) return;
    if (name === "") {
      setName(userInOurDb?.name ?? "");
    }
  }, [userInOurDb, name]);

  useEffect(() => {
    if (!user) return;
    if (imageUrl === user.imageUrl) return;
    if (imageUrl === "") {
      setImageUrl(user?.imageUrl ?? "");
    }
  }, [user, imageUrl]);

  useEffect(() => {
    if (searchParams.has("seeProfile")) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [searchParams]);

  function handleOpenChange(open: boolean) {
    if (!open) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("seeProfile");
      router.push(`${pathname}?${params.toString()}`);
      setOpen(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;
      setNewImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleClose() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("seeProfile");
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleSave() {
    if (!user) return;
    if (!userInOurDb) return;
    if (name === userInOurDb.name) return;
    if (name === "") return;
    const toastId = toast.loading("Salvando...");
    try {
      if (newImageFile) {
        await user.setProfileImage({ file: newImageFile });
      }
      await editConectaProfUser({
        userId: userInOurDb.id,
        name,
      });
      toast.success("Perfil atualizado com sucesso!");
    } catch (e) {
      toast.error("Erro ao alterar perfil");
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>Atualize seu perfil</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="name">
              Name
            </Label>
            <Input
              className="col-span-3"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="profile-image">
              Imagem de perfil
            </Label>
            <div className="col-span-3 flex items-center gap-4">
              {newImageUrl || imageUrl ? (
                <Image
                  alt="Profile Image"
                  className="aspect-square rounded-full object-cover"
                  height={64}
                  src={newImageUrl ?? imageUrl}
                  width={64}
                />
              ) : null}
              <Label className="cursor-pointer">
                <Input
                  accept="image/*"
                  id="profile-image"
                  type="file"
                  onChange={handleImageChange}
                  className="hidden"
                />
                Selecionar imagem
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Salvar
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
