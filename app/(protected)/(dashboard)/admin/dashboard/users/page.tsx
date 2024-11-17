"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { UserRole } from "@prisma/client";
import { getUsers } from "./actions";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  phone: string | null;
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const data = await getUsers(searchQuery);
      setUsers(data.users);
      setLoading(false);
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <div className="container mx-auto py-8">
      <div className="border-b bg-card mb-8">
        <div className="md:container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor user accounts
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Input
          placeholder="Rechercher un utilisateur..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button>Add New User</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader className="bg-white">
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <Link
                    className="hover:text-primary/80"
                    href={`/admin/dashboard/users/${user.id}`}
                  >
                    <TableCell> <UserAvatar name={user.name} image={null} /></TableCell>
                    <TableCell> {user.name} </TableCell>
                  </Link>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="mr-2">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      Disable
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
