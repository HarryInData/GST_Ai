import { Button } from "@/frontend/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/backend/actions/product.actions";
import { ProductForm } from "@/frontend/components/forms/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-9 w-9">
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Product</h2>
          <p className="text-muted-foreground text-sm">
            Update {product.name}
          </p>
        </div>
      </div>

      <ProductForm mode="edit" initialData={product} />
    </div>
  );
}
