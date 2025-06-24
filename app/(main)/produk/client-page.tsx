"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { Category, Product } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowUp,
  ArrowDown,
  History,
} from "lucide-react";
import { TransferDialog } from "@/components/transfer-dialog";
import { TransferHistory } from "@/components/transfer-history";
import { useDebounce } from "@/hooks/useDebounce";
import { addProduct, deleteProduct, updateProduct } from "./actions";

export default function ProdukPage({
  initialProducts,
  allCategories,
}: {
  initialProducts: Product[];
  allCategories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [transferType, setTransferType] = useState<"in" | "out">("in");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category_id: "",
    barcode: "",
  });

  // Sinkronisasi state jika data dari server berubah (misalnya setelah revalidasi)
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const debounceSearchTerm = useDebounce(searchTerm, 300);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(debounceSearchTerm.toLowerCase()) ||
          product.category_id
            .toLowerCase()
            .includes(debounceSearchTerm.toLowerCase())
      ),
    [products, debounceSearchTerm]
  );

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      stock: "",
      category_id: "",
      barcode: "",
    });
  };

  const handleAdd = () => {
    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.category_id
    )
      return;

    startTransition(async () => {
      const result = await addProduct({
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category_id: formData.category_id,
        barcode: formData.barcode || undefined,
      });

      if (!result.success) {
        alert(`Gagal: ${result.message}`);
      } else {
        setIsAddDialogOpen(false);
        resetForm();
      }
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id,
      barcode: product.barcode || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (
      !editingProduct ||
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.category_id
    )
      return;

    startTransition(async () => {
      const result = await updateProduct(editingProduct.id, {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category_id: formData.category_id,
        barcode: formData.barcode || undefined,
      });

      if (!result.success) {
        alert(`Gagal: ${result.message}`);
      } else {
        setIsEditDialogOpen(false);
        resetForm();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      startTransition(async () => {
        const result = await deleteProduct(id);
        if (!result.success) {
          alert(`Gagal: ${result.message}`);
        }
      });
    }
  };

  const handleTransfer = (product: Product, type: "in" | "out") => {
    setSelectedProduct(product);
    setTransferType(type);
    setIsTransferDialogOpen(true);
  };

  const handleViewHistory = (product: Product) => {
    setSelectedProduct(product);
    setIsHistoryDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Kelola Produk</h2>
          <p className="text-muted-foreground">
            Tambah, edit, dan kelola stok produk
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
              <DialogDescription>
                Masukkan informasi produk yang akan ditambahkan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Produk</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Masukkan nama produk"
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Harga</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stok Awal</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="barcode">Barcode (Opsional)</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  placeholder="Masukkan barcode"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} className="flex-1">
                  Tambah Produk
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Transfer Stok</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.categories.name}</Badge>
                  </TableCell>
                  <TableCell>Rp {product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.stock > 10
                          ? "default"
                          : product.stock > 0
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {product.barcode || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTransfer(product, "in")}
                        className="text-green-600 hover:text-green-700"
                        title="Transfer In"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTransfer(product, "out")}
                        className="text-red-600 hover:text-red-700"
                        title="Transfer Out"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewHistory(product)}
                        title="Riwayat Transfer"
                      >
                        <History className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
            <DialogDescription>Ubah informasi produk</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nama Produk</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Masukkan nama produk"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Kategori</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Harga</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stok</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-barcode">Barcode (Opsional)</Label>
              <Input
                id="edit-barcode"
                value={formData.barcode}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
                placeholder="Masukkan barcode"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdate} className="flex-1">
                Simpan Perubahan
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      {selectedProduct && (
        <TransferDialog
          open={isTransferDialogOpen}
          onOpenChange={setIsTransferDialogOpen}
          product={selectedProduct}
          type={transferType}
        />
      )}

      {/* Transfer History Dialog */}
      {selectedProduct && (
        <TransferHistory
          open={isHistoryDialogOpen}
          onOpenChange={setIsHistoryDialogOpen}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
