// components/product-card.tsx
"use client";

import * as React from "react";
import type { Product } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Komponen ini hanya akan render ulang jika props 'product' atau 'onAddToCart' berubah.
  console.log(`Rendering ProductCard: ${product.name}`); // Anda bisa gunakan ini untuk melihat kapan re-render terjadi

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">{product.name}</h3>
          <Badge variant={product.stock > 10 ? "default" : "destructive"}>
            Stok: {product.stock}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">
            Rp {product.price.toLocaleString()}
          </span>
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Bungkus dengan React.memo untuk mencegah re-render yang tidak perlu
export default React.memo(ProductCard);
