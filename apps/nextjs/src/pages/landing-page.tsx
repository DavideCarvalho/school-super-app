"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "react-hot-toast";
import { z } from "zod";

import { api } from "~/trpc/react";

export default function LandingPage() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <header className="bg-white py-4 sm:py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="shrink-0">
              <Link href="/">
                <span className="text-3xl font-bold text-purple-600">Anuá</span>
              </Link>
            </div>

            <div className="hidden lg:ml-12 lg:flex lg:items-center lg:space-x-4">
              <Link
                href="#funcionalidades"
                className="focus:ring-ring-300 inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2.5 text-base font-medium text-purple-900 transition-all duration-200 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Funcionalidades
              </Link>

              <Link
                href="#preco"
                className="focus:ring-ring-300 inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2.5 text-base font-medium text-purple-900 transition-all duration-200 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Preço
              </Link>
            </div>

            <Link
              href="#fale-conosco"
              className="focus:ring-ring-300 inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2.5 text-base font-medium text-purple-900 transition-all duration-200 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              Fale conosco
            </Link>

            <div className="hidden sm:ml-auto sm:flex sm:items-center sm:justify-end sm:space-x-4">
              <Link
                href="/sign-in"
                className="focus:ring-ring-900 inline-flex items-center justify-center rounded-full border border-purple-900 px-6 py-2.5 text-base font-medium text-purple-900 transition-all duration-200 hover:bg-purple-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-900 focus:ring-offset-2"
                role="button"
              >
                Login
              </Link>
            </div>

            <div className="ml-4 flex lg:hidden">
              <button
                type="button"
                className="transiton-all inline-flex items-center rounded-full border border-purple-900 p-2.5 text-purple-900 duration-200 hover:bg-purple-900 hover:text-white focus:bg-purple-900 focus:text-white focus:outline-none focus:ring-2 focus:ring-purple-900 focus:ring-offset-2"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
              >
                {!expanded && (
                  <span aria-hidden="true">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <title>Icone</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </span>
                )}

                {expanded && (
                  <span aria-hidden="true">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <title>Icone</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-white py-12 sm:py-16 lg:py-20 xl:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-2">
            <div className="flex flex-col justify-between lg:order-2">
              <div className="flex-1">
                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl sm:tracking-tight xl:text-7xl">
                  Gerenciar sua escola nunca foi tão fácil!
                </h1>
              </div>

              <div className="mt-6 lg:mt-auto">
                <p className="text-lg leading-7 text-gray-700 lg:text-xl lg:leading-8">
                  <span className="font-bold text-purple-600">Anuá</span> te da
                  tudo que você precisa para gerenciar sua escola! Desde
                  controle das salas de aula, alunos, professores, até controle
                  da cantina!
                </p>
                <div className="mt-10">
                  <Link
                    href="#fale-conosco"
                    title=""
                    className="inline-flex items-center justify-center rounded-xl border border-transparent bg-purple-600 px-8 py-4 text-base font-medium text-white transition-all duration-200 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2"
                    role="button"
                  >
                    Interessado? Entre em contato!
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:order-1">
              <div className="relative mx-auto w-full max-w-sm">
                <Image
                  className="relative mx-auto w-full max-w-xs rounded-2xl sm:max-w-sm"
                  src="https://landingfoliocom.imgix.net/store/collection/saasui/images/hero/5/portrait-girl.png"
                  alt=""
                  width={500}
                  height={500}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Pricing() {
  return (
    <section className="py-10 sm:py-16 lg:py-24" id="preco">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">
            Preço
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-gray-600">
            Apenas R$1,99 por aluno!
          </p>
        </div>

        <div className="mx-auto mt-14 grid grid-cols-1 place-items-center gap-6 sm:grid-cols-1 md:gap-9">
          <div className="max-w-md overflow-hidden rounded-md border-2 border-gray-200 bg-transparent">
            <div className="p-6 md:px-9 md:py-8">
              <h3 className="text-xl font-semibold text-black">Tudo!</h3>

              <div className="mt-5 flex items-end">
                <div className="flex items-start">
                  <span className="text-xl font-medium text-black"> R$ </span>
                  <p className="text-6xl font-medium tracking-tight">1,99</p>
                </div>
                <span className="ml-0.5 text-lg text-gray-600"> / aluno </span>
              </div>

              <a
                href="#"
                title=""
                className="mt-6 inline-flex w-full items-center justify-center rounded-full border-2 border-fuchsia-600 bg-transparent px-4 py-3 font-semibold text-gray-900 transition-all duration-200 hover:bg-fuchsia-600 hover:text-white focus:bg-fuchsia-600 focus:text-white"
              >
                3 meses grátis!
              </a>

              <ul className="mt-8 flex flex-col space-y-4">
                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <title>Icone</title>
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-900">
                    Módulo de administração
                  </span>
                </li>

                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <title>Icone</title>
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-900">
                    Módulo de Cantina
                  </span>
                </li>

                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <title>Icone</title>
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-900">
                    Módulo pedagógico
                  </span>
                </li>

                <li className="inline-flex items-center space-x-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <title>Icone</title>
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-base font-medium">
                    Uploads de arquivos até 10MB
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const contactSchema = z
  .object({
    name: z
      .string({ required_error: "Seu nome é obrigatório" })
      .min(1, "É necessário que tenha mais de um caracter")
      .max(255, "O nome pode ter um máximo de 255 caracteres"),
    email: z
      .string({ required_error: "Email é obrigatório" })
      .email("O email precisa ser válido"),
    schoolName: z.string({ required_error: "Nome da escola é obrigatório" }),
    phone: z.string().optional(),
    message: z.string({ required_error: "Mensagem é obrigatória" }),
  })
  .required();

export function Contact() {
  const { mutate } = api.email.sendContactUsEmail.useMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
  });
  const onSubmit = (data: z.infer<typeof contactSchema>) => {
    toast.loading("Enviando mensagem de contato...");
    mutate(data, {
      onSuccess() {
        toast.dismiss();
        toast.success("Mensagem enviada com sucesso!");
      },
    });
    reset();
  };

  return (
    <section className="py-10 sm:py-16 lg:py-24" id="fale-conosco">
      <Toaster position="top-center" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Fale conosco
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-500">
            Tem alguma dúvida? Quer saber mais sobre o nosso trabalho? Entre em
            contato conosco!
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl sm:mt-16">
          <div className="mt-6 overflow-hidden rounded-xl bg-white">
            <div className="px-6 py-12 sm:p-12">
              <h3 className="text-center text-3xl font-semibold text-gray-900">
                Nos mande um e-mail!
              </h3>

              <form className="mt-14" onSubmit={void handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor=""
                      className="text-base font-medium text-gray-900"
                    >
                      Seu nome
                    </label>
                    <div className="relative mt-2.5">
                      <input
                        type="text"
                        {...register("name")}
                        className="block w-full rounded-md border border-gray-200 bg-white px-4 py-4 text-black placeholder-gray-500 caret-blue-600 transition-all duration-200 focus:border-blue-600 focus:outline-none"
                      />
                      {errors.name && <p>{errors.name?.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor=""
                      className="text-base font-medium text-gray-900"
                    >
                      Email
                    </label>
                    <div className="relative mt-2.5">
                      <input
                        type="email"
                        {...register("email")}
                        className="block w-full rounded-md border border-gray-200 bg-white px-4 py-4 text-black placeholder-gray-500 caret-blue-600 transition-all duration-200 focus:border-blue-600 focus:outline-none"
                      />
                      {errors.email && <p>{errors.email?.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor=""
                      className="text-base font-medium text-gray-900"
                    >
                      Telefone
                    </label>
                    <div className="relative mt-2.5">
                      <input
                        type="tel"
                        {...register("phone")}
                        className="block w-full rounded-md border border-gray-200 bg-white px-4 py-4 text-black placeholder-gray-500 caret-blue-600 transition-all duration-200 focus:border-blue-600 focus:outline-none"
                      />
                      {errors.phone && <p>{errors.phone?.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor=""
                      className="text-base font-medium text-gray-900"
                    >
                      Nome da escola
                    </label>
                    <div className="relative mt-2.5">
                      <input
                        type="text"
                        {...register("schoolName")}
                        className="block w-full rounded-md border border-gray-200 bg-white px-4 py-4 text-black placeholder-gray-500 caret-blue-600 transition-all duration-200 focus:border-blue-600 focus:outline-none"
                      />
                      {errors.schoolName && <p>{errors.schoolName?.message}</p>}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor=""
                      className="text-base font-medium text-gray-900"
                    >
                      Mensagem
                    </label>
                    <div className="relative mt-2.5">
                      <textarea
                        className="block w-full resize-y rounded-md border border-gray-200 bg-white px-4 py-4 text-black placeholder-gray-500 caret-blue-600 transition-all duration-200 focus:border-blue-600 focus:outline-none"
                        rows={4}
                        {...register("message")}
                      />
                      {errors.message && <p>{errors.message?.message}</p>}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-purple-700 focus:bg-purple-700 focus:outline-none"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="mt-14 flex flex-wrap items-center justify-center space-x-12 md:space-x-16">
          <li>
            <Link
              href="#funcionalidades"
              className="font-pj inline-flex transform text-lg font-medium text-gray-900 transition-all duration-200 hover:-translate-y-1 hover:text-gray-600"
            >
              Funcionalidades
            </Link>
          </li>

          <li>
            <Link
              href="#preco"
              className="font-pj inline-flex transform text-lg font-medium text-gray-900 transition-all duration-200 hover:-translate-y-1 hover:text-gray-600"
            >
              Preço
            </Link>
          </li>

          <li>
            <Link
              href="#fale-conosco"
              className="font-pj inline-flex transform text-lg font-medium text-gray-900 transition-all duration-200 hover:-translate-y-1 hover:text-gray-600"
            >
              Fale Conosco
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export function Features() {
  return (
    <section className="bg-white py-10 sm:py-16 lg:py-24" id="funcionalidades">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Funcionalidades
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-500">
          Tudo que o <span className="font-bold text-purple-600">Anuá</span>{" "}
          pode te ajudar!
        </p>
      </div>
      <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-flow-row grid-cols-1 gap-12 text-center sm:grid-cols-2 md:grid-cols-3 lg:gap-y-16">
          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-orange-100"
                width="62"
                height="64"
                viewBox="0 0 62 64"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Icone</title>
                <path d="M62 13.001C62 33.4355 53.9345 64.001 33.5 64.001C13.0655 64.001 0 50.435 0 30.0005C0 9.56596 2.56546 4.00021 23 4.00021C43.4345 4.00021 62 -7.43358 62 13.001Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-orange-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>Icone</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">Rápido</h3>
            <p className="mt-4 text-base text-gray-600">
              Nos preocupamos em deixar o sistema o mais rápido possível para
              que você e sua equipe não percam tempo.
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-green-100"
                width="66"
                height="68"
                viewBox="0 0 66 68"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Icone</title>
                <path d="M65.5 30C65.5 50.4345 46.4345 68 26 68C5.56546 68 0 50.4345 0 30C0 9.56546 12.5655 0 33 0C53.4345 0 65.5 9.56546 65.5 30Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>Icone</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">
              Solicitação de compras
            </h3>
            <p className="mt-4 text-base text-gray-600">
              Gerencie solicitações de compras e tenha controle total sobre o
              quanto está sendo gasto
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-green-100"
                width="66"
                height="68"
                viewBox="0 0 66 68"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Icone</title>
                <path d="M65.5 30C65.5 50.4345 46.4345 68 26 68C5.56546 68 0 50.4345 0 30C0 9.56546 12.5655 0 33 0C53.4345 0 65.5 9.56546 65.5 30Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>Icone</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">Impressão</h3>
            <p className="mt-4 text-base text-gray-600">
              Gerencie pedidos de impressão de seus professores e acompanhe o
              andamento de cada um deles
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-purple-100"
                width="66"
                height="68"
                viewBox="0 0 66 68"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Icone</title>
                <path d="M65.5 30C65.5 50.4345 46.4345 68 26 68C5.56546 68 0 50.4345 0 30C0 9.56546 12.5655 0 33 0C53.4345 0 65.5 9.56546 65.5 30Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-purple-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>Icone</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">
              Tarefas
              <span className="ml-2  rounded-xl bg-purple-300 p-1 text-sm">
                Em breve
              </span>
            </h3>
            <p className="mt-4 text-base text-gray-600">
              Saiba exatamente o que você precisa fazer em ordem de prioridade
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-gray-100"
                width="65"
                height="70"
                viewBox="0 0 65 70"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Icone</title>
                <path d="M64.5 26C64.5 46.4345 56.4345 70 36 70C15.5655 70 0 53.9345 0 33.5C0 13.0655 13.0655 0 33.5 0C53.9345 0 64.5 5.56546 64.5 26Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>Icone</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">Cantina</h3>
            <p className="mt-4 text-base text-gray-600">
              De a sua cantina um sistema para que ela controle tudo! Produtos,
              vendas, e muito mais!
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-gray-100"
                width="65"
                height="70"
                viewBox="0 0 65 70"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Icone</title>
                <path d="M64.5 26C64.5 46.4345 56.4345 70 36 70C15.5655 70 0 53.9345 0 33.5C0 13.0655 13.0655 0 33.5 0C53.9345 0 64.5 5.56546 64.5 26Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>Icone</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">Dashboard</h3>
            <p className="mt-4 text-base text-gray-600">
              Tenha visão geral de notas, faltas, e muito mais!
            </p>
          </div>

          <div>
            <div className="relative mx-auto flex items-center justify-center">
              <svg
                className="text-gray-100"
                width="65"
                height="70"
                viewBox="0 0 65 70"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Icone</title>
                <path d="M64.5 26C64.5 46.4345 56.4345 70 36 70C15.5655 70 0 53.9345 0 33.5C0 13.0655 13.0655 0 33.5 0C53.9345 0 64.5 5.56546 64.5 26Z" />
              </svg>
              <svg
                className="absolute h-9 w-9 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>Icone</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mt-8 text-lg font-semibold text-black">
              Módulo pedagógico
              <span className="ml-2  rounded-xl bg-purple-300 p-1 text-sm">
                Em breve
              </span>
            </h3>
            <p className="mt-4 text-base text-gray-600">
              Um canal de acesso facilitado entre escola e pais sobre o
              desenvolvimento do aluno.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
