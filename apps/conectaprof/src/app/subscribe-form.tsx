"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

export function SubscribeForm() {
  const form = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");

  function sendEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.current) {
      toast.error(
        "Opa, tivemos um erro tentando enviar o email, tente novamente.",
      );
      return;
    }

    const toastId = toast.loading("Enviando email...");

    emailjs
      .send(
        "service_uwtde87",
        "template_gcr2v68",
        { email },
        {
          publicKey: "9zYFVOsSxrFrlmCBc",
        },
      )
      .then(() => {
        toast.success(
          "Obrigado! Você será notificado quando ConectaProf for lançado!",
        );
      })
      .catch(() => {
        toast.error(
          "Opa, tivemos um erro tentando enviar o email, tente novamente.",
        );
      })
      .finally(() => {
        toast.dismiss(toastId);
      });
  }
  return (
    <>
      <form ref={form} onSubmit={sendEmail} id="subscribe-form">
        <div className="w-full max-w-sm space-y-2">
          <Input
            className="max-w-lg flex-1"
            placeholder="Digite seu e-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Inscreva-se para ser notificado quando lançarmos.
          </p>
        </div>
        <div className="space-x-4 space-y-4">
          <Button className="bg-orange-500 text-white hover:bg-orange-600">
            Junte-se agora
          </Button>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
            href="#plataforma"
          >
            Saiba mais
          </Link>
        </div>
      </form>
    </>
  );
}
