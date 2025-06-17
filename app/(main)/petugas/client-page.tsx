"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import type { Staff } from "@/lib/types";
import {
  addStaffUser,
  deactivateStaff,
  reactivateStaff,
  updateStaff,
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
import { Edit, Search, UserPlus, ToggleLeft, ToggleRight } from "lucide-react";

export default function PetugasClientPage({
  initialStaff,
}: {
  initialStaff: Staff[];
}) {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "kasir" as "admin" | "kasir",
    status: "aktif" as "aktif" | "nonaktif",
  });

  useEffect(() => {
    setStaff(initialStaff);
  }, [initialStaff]);

  const debounceSearchTerm = useDebounce(searchTerm, 300);

  const filteredStaff = useMemo(
    () =>
      staff.filter(
        (member) =>
          member.name
            .toLowerCase()
            .includes(debounceSearchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(debounceSearchTerm.toLowerCase())
      ),
    [staff, debounceSearchTerm]
  );

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "kasir",
      status: "aktif",
    });
    setEditingStaff(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: "role" | "status") => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      // Kirim state formData langsung
      const result = await addStaffUser(formData);
      if (result && result.error) {
        alert("Gagal menambah petugas: " + result.error.message);
      } else {
        setIsAddDialogOpen(false);
        resetForm();
      }
    });
  };

  const handleEditClick = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role,
      status: staffMember.status ? "aktif" : "nonaktif",
      password: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStaff) return;
    startTransition(async () => {
      // Kirim state formData langsung
      const result = await updateStaff(editingStaff.id, formData);
      if (result && result.error) {
        alert("Gagal memperbarui petugas: " + result.error.message);
      } else {
        setIsEditDialogOpen(false);
        resetForm();
      }
    });
  };

  const handleDeactivateClick = (staffMember: Staff) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menonaktifkan ${staffMember.name}? Mereka tidak akan bisa login.`
      )
    ) {
      startTransition(async () => {
        if (!staffMember.user_id) {
          alert("Error: User ID tidak ditemukan.");
          return;
        }
        const result = await deactivateStaff(staffMember.user_id);
        if (result?.error) {
          alert("Gagal menonaktifkan petugas: " + result.error.message);
        }
      });
    }
  };

  const handleReactivateClick = (staffMember: Staff) => {
    if (confirm(`Aktifkan kembali ${staffMember.name}?`)) {
      startTransition(async () => {
        if (!staffMember.user_id) {
          alert("Error: User ID tidak ditemukan.");
          return;
        }
        const result = await reactivateStaff(staffMember.user_id);
        if (result?.error) {
          alert("Gagal mengaktifkan petugas: " + result.error.message);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Kelola Petugas</h2>
          <p className="text-muted-foreground">
            Tambah, edit, dan hapus data petugas
          </p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Petugas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Petugas Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={handleSelectChange("role")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kasir">Kasir</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={handleSelectChange("status")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="nonaktif">Non-aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Tambah Petugas"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email petugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabel */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Petugas ({filteredStaff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => (
                <TableRow
                  key={member.id}
                  className={!member.status ? "bg-muted/50" : ""}
                >
                  <TableCell>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.phone}
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.role === "admin" ? "default" : "secondary"
                      }
                    >
                      {member.role.charAt(0).toUpperCase() +
                        member.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status ? "default" : "destructive"}>
                      {member.status ? "Aktif" : "Non-aktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {member.status ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(member)}
                            title="Edit"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeactivateClick(member)}
                            disabled={isPending}
                            title="Nonaktifkan"
                          >
                            <ToggleLeft className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleReactivateClick(member)}
                          disabled={isPending}
                          className="bg-green-600 hover:bg-green-700"
                          title="Aktifkan Kembali"
                        >
                          <ToggleRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Edit */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Petugas</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nama</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Telepon</Label>
              <Input
                id="edit-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={handleSelectChange("role")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kasir">Kasir</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleSelectChange("status")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="nonaktif">Non-aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
