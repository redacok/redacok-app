"use client";

import TransactionTable from "@/app/(protected)/(dashboard)/dashboard/transactions/_components/transaction-table";
import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/user-avatar";
import { MAX_DATE_RANGE_DAYS } from "@/constants";
import { UpdateUserSchema } from "@/lib/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole } from "@prisma/client";
import axios from "axios";
import { differenceInDays, startOfMonth } from "date-fns";
import { Loader } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { updateUser } from "../actions";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  phone: string | null;
}

export default function UserById() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const form = useForm<z.infer<typeof UpdateUserSchema>>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      id: params.userId as string,
      name: "",
      email: "",
      phone: "",
      role: "USER",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`/api/users/${params.userId}`);
        if (data.user) {
          setUser(data.user);
          form.reset({
            id: data.user.id,
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            role: data.user.role,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
        toast.error("Une erreur est survenue, veuillez réessayer plus tard");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.userId]);

  const onSubmit = async (values: z.infer<typeof UpdateUserSchema>) => {
    try {
      const result = await updateUser(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Utilisateur mis à jour avec succès");
        router.refresh();
      }
    } catch (error) {
      console.error("something whent wrong", error);
      toast.error("Une erreur est survenue, veuillez réessayer plus tard");
    }
  };

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    try {
      const { data } = await axios.patch<User>(`/api/users/${userId}/update`, {
        active: newStatus,
      });

      // Update local state
      // setUsers(
      //   users.map((user) =>
      //     user.id === userId ? { ...user, active: data.active } : user
      //   )
      // );
      console.log(data);
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-10 pt-16">
        <p className="text-2xl font-semibold">Chargement...</p>
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto space-y-4 pb-10 md:pb-0">
      <div className="bg-card border rounded-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <UserAvatar name={user.name} className="h-16 w-16" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-card space-y-2 my-4 py-4 rounded-xl border">
        <div className="md:container mx-auto px-4 flex flex-wrap items-center justify-between gap-6 py-6">
          <div>
            <p className="text-xl md:text-2xl font-bold">Transactions</p>
            <p className="text-muted-foreground text-sm mt-2">
              Transactions de {user.name}
            </p>
          </div>
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            showCompare={false}
            onUpdate={(values) => {
              const { from, to } = values.range;

              if (!from || !to) return;
              if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                toast.error(
                  `L'intervalle sélectionné est trop grand, le maximum autorisé est de ${MAX_DATE_RANGE_DAYS} jours`
                );
                return;
              }

              setDateRange({ from, to });
            }}
          />
        </div>
        <div className="px-4">
          <TransactionTable
            from={dateRange.from}
            to={dateRange.to}
            userId={user.id}
          />
        </div>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl md:text-2xl font-bold">
              User Informations
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Informations de l&apos;utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="email"
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="PERSONAL">Personal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit">Update User</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Danger Zone</CardTitle>
            <CardDescription>
              Attention, la suppression de compte est irréversible !
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 space-x-2">
            <Button
              variant="destructive"
              onClick={() => handleStatusChange(user.id, false)}
            >
              Désactiver le compte
            </Button>
            <Button variant="destructive">Supprimer le compte</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
