"use client";

import { UserAvatar } from "@/components/user-avatar";
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
import { UpdateUserSchema } from "@/lib/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { updateUser } from "../actions";
import * as z from "zod";
import { toast } from "sonner";
import axios from "axios";

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
      console.error("something whent wrong", error)
      toast.error("Une erreur est survenue, veuillez réessayer plus tard");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="border-b bg-card mb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <UserAvatar name={user.name} className="h-16 w-16" />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Update user details and role</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                      <Input 
                        {...field} 
                        value={field.value ?? ''}
                        disabled
                      />
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
                        value={field.value ?? ''}
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
                      <Input 
                        {...field} 
                        value={field.value ?? ''}
                        disabled
                      />
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
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              Careful, these actions cannot be undone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 space-x-2">
            <Button variant="destructive">Disable Account</Button>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}