'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface KycRequest {
  id: string;
  userId: string;
  type: 'PERSONAL' | 'BUSINESS';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  idType: string;
  idNumber: string;
  idExpirationDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export function KycRequestsTable() {
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchKycRequests = async () => {
    try {
      const { data } = await axios.get<KycRequest[]>('/api/kyc/requests');
      setRequests(data);
    } catch (error) {
      console.error('Error fetching KYC requests:', error);
      toast.error('Failed to load KYC requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await axios.post('/api/kyc/review', {
        kycId: id,
        status: 'APPROVED',
      });
      
      toast.success('KYC request approved successfully');
      fetchKycRequests(); // Refresh the list
    } catch (error) {
      console.error('Error approving KYC request:', error);
      toast.error('Failed to approve KYC request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.post('/api/kyc/review', {
        kycId: id,
        status: 'REJECTED',
        rejectionReason: 'Documents verification failed', // You might want to add a reason input
      });
      
      toast.success('KYC request rejected');
      fetchKycRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting KYC request:', error);
      toast.error('Failed to reject KYC request');
    }
  };

  if (isLoading) {
    return <div>Loading KYC requests...</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{request.user.name}</span>
                  <span className="text-sm text-muted-foreground">{request.user.email}</span>
                </div>
              </TableCell>
              <TableCell>{request.type}</TableCell>
              <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.status === 'APPROVED'
                      ? 'secondary'
                      : request.status === 'REJECTED'
                      ? 'destructive'
                      : 'default'
                  }
                >
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  disabled={request.status !== 'PENDING'}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(request.id)}
                  disabled={request.status !== 'PENDING'}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
