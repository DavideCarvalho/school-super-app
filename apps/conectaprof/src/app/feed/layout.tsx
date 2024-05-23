export default function FeedLayout(props: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-orange-600 py-4 text-white">
        <div className="container mx-auto flex flex-wrap items-center justify-between px-4">
          <h1 className="text-2xl font-bold">ConectaProf</h1>
        </div>
      </header>
      <main className="flex-1 bg-gray-100 py-8">{props.children}</main>
    </div>
  );
}
