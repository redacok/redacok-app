"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Country = {
  id: string;
  name: string;
};

export function CreateUserDialog({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    // Charger la liste des pays
    async function fetchCountries() {
      try {
        const response = await fetch("/api/countries");
        if (response.ok) {
          const data = await response.json();
          setCountries(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des pays:", error);
      }
    }
    fetchCountries();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as UserRole,
      countryId: formData.get("countryId") as string,
    };

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Erreur lors de la création");

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nouvel utilisateur</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Input name="name" placeholder="Nom" required />
          </div>
          <div>
            <Input name="email" type="email" placeholder="Email" required />
          </div>
          <div>
            <Input name="phone" placeholder="Téléphone" />
          </div>
          <div>
            <Select name="role" required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.USER}>Utilisateur</SelectItem>
                <SelectItem value={UserRole.COMMERCIAL}>Commercial</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select name="countryId" required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un pays" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Création
              </>
            ) : (
              "Créer l'utilisateur"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
