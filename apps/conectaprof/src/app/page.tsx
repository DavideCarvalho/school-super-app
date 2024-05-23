import Link from "next/link";

import { Button } from "@acme/ui/button";

import { SubscribeForm } from "./subscribe-form";

export default function Component() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b px-4 lg:px-6">
        <Link className="mr-auto flex items-center justify-center" href="#">
          <BookIcon className="mr-2 h-6 w-6 text-orange-500" />
          <span className="text-lg font-semibold text-orange-600">
            ConectaProf
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium text-orange-600 underline-offset-4 hover:underline"
            href="#plataforma"
          >
            Saiba mais
          </Link>
          <Link
            href={"/feed"}
            className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-1  disabled:pointer-events-none disabled:opacity-50 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
          >
            Vá para o feed!
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1
                  id="title"
                  className="text-3xl font-bold tracking-tighter text-orange-600 sm:text-4xl md:text-5xl lg:text-6xl/none"
                >
                  Conecte-se com outros educadores
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                  Junte-se à nossa vibrante comunidade de professores,
                  compartilhe recursos e colabore para aprimorar a experiência
                  de aprendizado.
                </p>
                {/* <p className="font-semibold text-orange-600">em breve</p> */}
              </div>
              {/* <SubscribeForm /> */}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32" id="plataforma">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-orange-100 px-3 py-1 text-sm text-orange-600">
                  Sobre a Plataforma
                </div>
                <h2 className="text-3xl font-bold tracking-tighter text-orange-600 sm:text-5xl">
                  Uma plataforma feita para educadores
                </h2>
                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A ConectaProf é uma plataforma que permite aos educadores
                  compartilhar suas experiências e interagir uns com os outros.
                  Aqui, você pode encontrar uma comunidade vibrante de
                  professores apaixonados, trocar ideias, recursos e melhores
                  práticas, além de colaborar em projetos educacionais.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mt-8 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-orange-600 sm:text-5xl">
                  Quem somos?
                </h2>
                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Olá, somos os criadores do Anuá, uma plataforma de gestão
                  escolar. Não somos educadores, mas vemos nas pessoas que estão
                  no meio da educação que falta um ambiente para troca de ideias
                  e conhecimento.
                </p>
                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Sim, o Anuá é uma empresa, e queremos usar essa empresa para
                  colaborar com a comunidade de educação de uma forma positiva.
                  A educação é uma luta, e como todas as lutas, precisam ser
                  feitas em conjunto.
                </p>

                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  <span className="highlight width-full">
                    O ConectaProf é uma plataforma cujo intuito é fazer os
                    professores serem o centro do debate de educação.
                  </span>
                </p>

                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Se você acredita no potencial potencial do ConectaProf, uma
                  forma de nos ajudar é divulgando o Anuá em suas redes sociais
                  e compartilhando suas experiências com a comunidade de
                  educação. Quanto mais pessoas usarem o Anuá, mais fácil será
                  de mantermos o ConectaProf funcionando como um apoio para a
                  educação.
                </p>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-orange-500 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-950 disabled:pointer-events-none disabled:opacity-50"
                  href="https://anuaapp.com.br/"
                >
                  Saiba mais sobre a Anua
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* <footer className="w-full bg-gray-100 p-6 md:py-12 dark:bg-gray-800">
        <div className="container grid max-w-7xl grid-cols-2 gap-8 text-sm sm:grid-cols-3 md:grid-cols-5">
          <div className="grid gap-1">
            <h3 className="font-semibold text-orange-600">Empresa</h3>
            <Link className="hover:text-orange-600" href="#">
              Sobre Nós
            </Link>
            <Link className="hover:text-orange-600" href="#">
              Nosso Time
            </Link>
            <Link className="hover:text-orange-600" href="#">
              Carreiras
            </Link>
            <Link className="hover:text-orange-600" href="#">
              Notícias
            </Link>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold text-orange-600">Recursos</h3>
            <Link className="hover:text-orange-600" href="#">
              Blog
            </Link>
            <Link className="hover:text-orange-600" href="#">
              Comunidade
            </Link>
            <Link className="hover:text-orange-600" href="#">
              Suporte
            </Link>
            <Link className="hover:text-orange-600" href="#">
              FAQs
            </Link>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold text-orange-600">Legal</h3>
            <Link className="hover:text-orange-600" href="#">
              Política de Privacidade
            </Link>
            <Link className="hover:text-orange-600" href="#">
              Termos de Serviço
            </Link>
            <Link className="hover:text-orange-600" href="#">
              Política de Cookies
            </Link>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold text-orange-600">Contato</h3>
            <Link className="hover:text-orange-600" href="#">
              Suporte
            </Link>
            <Link className="hover:text-orange-600" href="#">
              Vendas
            </Link>
            <Link className="hover:text-orange-600" href="#">
              Imprensa
            </Link>
            <Link className="hover:text-orange-600" href="#">
              Parcerias
            </Link>
          </div>
        </div>
      </footer> */}
    </div>
  );
}

function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Icone</title>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
