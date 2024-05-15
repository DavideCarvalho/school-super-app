import Link from "next/link";

export default function LandingPageBanner() {
  return (
    <div className="flex items-center gap-x-6 bg-purple-600 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <p className="text-sm leading-6 text-white">
        <Link href="#fale-conosco">
          <strong className="font-semibold">Periodo de testes</strong>
          <svg
            viewBox="0 0 2 2"
            className="mx-2 inline h-0.5 w-0.5 fill-current"
            aria-hidden="true"
          >
            <circle cx={1} cy={1} r={1} />
          </svg>
          Gratuito durante o período de testes! Entre em contato para saber mais
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </p>
      <div className="flex flex-1 justify-end" />
    </div>
  );
}
