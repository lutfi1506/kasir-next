"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import type { Product, Staff, Category } from "@/lib/types";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  addStockTransfer,
  getProductTransfers,
} from "./actions";
import { useDebounce } from "@/hooks/useDebounce";

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

type ActiveStaff = Pick<Staff, "id" | "name">;

export default function ProdukClientPage({
  initialProducts,
  allCategories,
  activeStaff,
  userRole,
}: {
  initialProducts: Product[];
  allCategories: Category[];
  activeStaff: ActiveStaff[];
  userRole: "admin" | "kasir" | null;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [isPending, startTransition] = useTransition();

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

  console.log("Initial products:", initialProducts);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const debounceSearchTerm = useDebounce(searchTerm, 300);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(debounceSearchTerm.toLowerCase()) ||
          (p.categories &&
            p.categories?.name
              .toLowerCase()
              .includes(debounceSearchTerm.toLowerCase())) ||
          p.barcode?.includes(debounceSearchTerm)
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
    setEditingProduct(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category_id: value }));
  };

  const handleAdd = () => {
    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.category_id
    ) {
      alert("Harap isi semua field yang wajib diisi.");
      return;
    }
    startTransition(async () => {
      const result = await addProduct({
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        category_id: formData.category_id,
        barcode: formData.barcode,
      });
      if (result.error) {
        alert("Gagal menambah produk: " + result.error.message);
      } else {
        setIsAddDialogOpen(false);
        resetForm();
      }
    });
  };

  const handleEditClick = (product: Product) => {
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
    if (!editingProduct) return;
    startTransition(async () => {
      const result = await updateProduct(editingProduct.id, {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        category_id: formData.category_id,
        barcode: formData.barcode,
      });
      if (result.error) {
        alert("Gagal update produk: " + result.error.message);
      } else {
        setIsEditDialogOpen(false);
        resetForm();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "Apakah Anda yakin ingin menghapus produk ini? Semua data terkait akan hilang."
      )
    ) {
      startTransition(async () => {
        const result = await deleteProduct(id);
        if (result.error)
          alert("Gagal menghapus produk: " + result.error.message);
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Kelola Produk</h2>
          <p className="text-muted-foreground">
            Tambah, edit, dan kelola stok produk
          </p>
        </div>
        {userRole === "admin" && (
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Produk Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nama Produk</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <Label>Kategori</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={handleCategoryChange}
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
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stok Awal</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="barcode">Barcode (Opsional)</Label>
                  <Input
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAdd}
                    className="flex-1"
                    disabled={isPending}
                  >
                    {isPending ? "Menyimpan..." : "Tambah Produk"}
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
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk atau barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

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
                {userRole === "admin" && (
                  <>
                    <TableHead>Transfer Stok</TableHead>
                    <TableHead>Aksi</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.categories?.name || "Tidak ada kategori"}
                    </Badge>
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
                  {userRole === "admin" && (
                    <>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTransfer(product, "in")}
                            title="Transfer In"
                          >
                            <ArrowUp className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTransfer(product, "out")}
                            title="Transfer Out"
                          >
                            <ArrowDown className="h-3 w-3 text-red-600" />
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
                            onClick={() => handleEditClick(product)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {userRole === "admin" && editingProduct && (
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Produk</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Nama Produk</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label>Kategori</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={handleCategoryChange}
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
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-stock">Stok (Info)</Label>
                  <Input
                    id="edit-stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    disabled
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-barcode">Barcode</Label>
                <Input
                  id="edit-barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleFormChange}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpdate}
                  className="flex-1"
                  disabled={isPending}
                >
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
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
      )}

      {selectedProduct && (
        <TransferDialog
          open={isTransferDialogOpen}
          onOpenChange={setIsTransferDialogOpen}
          product={selectedProduct}
          type={transferType}
          activeStaff={activeStaff}
          onConfirm={addStockTransfer}
        />
      )}

      {selectedProduct && (
        <TransferHistory
          open={isHistoryDialogOpen}
          onOpenChange={setIsHistoryDialogOpen}
          product={selectedProduct}
          fetchTransfers={() => getProductTransfers(selectedProduct.id)}
        />
      )}
    </div>
  );
}
