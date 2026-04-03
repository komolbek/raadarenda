export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold">Product Detail</h1>
      <p className="mt-1 font-mono text-sm text-muted-foreground">ID: {id}</p>
      <p className="mt-2 text-muted-foreground">
        ProductDetailPage - TODO: migrate from existing app
      </p>
    </main>
  );
}
