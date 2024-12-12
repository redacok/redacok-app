"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  active: boolean;
  role: "ADMIN" | "COMMERCIAL" | "BUSINESS" | "PERSONAL" | "USER";
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get<User[]>("/api/users");
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    try {
      const { data } = await axios.patch<User>(`/api/users/${userId}/update`, {
        active: newStatus,
      });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, active: data.active } : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  // const handleRoleChange = async (userId: string, newRole: User['role']) => {
  //   try {
  //     const { data } = await axios.patch<User>(`/api/users/${userId}/update`, {
  //       role: newRole,
  //     });

  //     // Update local state
  //     setUsers(users.map(user =>
  //       user.id === userId ? { ...user, role: data.role } : user
  //     ));
  //   } catch (error) {
  //     console.error('Error updating user role:', error);
  //   }
  // };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Loading users...
              </TableCell>
            </TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Link
                    href={`/admin/dashboard/users/${user.id}`}
                    key={user.id}
                  >
                    {user.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/dashboard/users/${user.id}`}
                    key={user.id}
                  >
                    {user.email}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={user.active ? "secondary" : "destructive"}>
                    {user.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role.toLowerCase()}</Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(user.id, !user.active)}
                  >
                    {user.active ? "Deactivate" : "Activate"}
                  </Button>
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextRole = user.role === 'USER' ? 'ADMIN' : 'USER';
                      handleRoleChange(user.id, nextRole);
                    }}
                  >
                    {user.role === 'USER' ? 'Make Admin' : 'Make User'}
                  </Button> */}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
