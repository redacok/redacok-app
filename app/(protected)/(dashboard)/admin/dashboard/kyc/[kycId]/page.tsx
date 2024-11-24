'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

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
  niu: string | null;
  idPicture: string | null;
  idOnHand: string | null;
  entirePhoto: string | null;
  locationPlan: string | null;
  documents: Array<{
    id: string | null;
    type: string;
    url: string | null;
  }>;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

const rejectionFormSchema = z.object({
  reason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

type RejectionFormValues = z.infer<typeof rejectionFormSchema>;

export default function KycVerificationPage() {
  const params = useParams();
  const [kycRequest, setKycRequest] = useState<KycRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [isConfirmApproveModalOpen, setIsConfirmApproveModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const rejectionForm = useForm<RejectionFormValues>({
    resolver: zodResolver(rejectionFormSchema),
    defaultValues: {
      reason: "",
    },
  });

  useEffect(() => {
    const fetchKycRequest = async () => {
      try {
        const response = await axios.get(`/api/kyc/requests/${params.kycId}`);
        setKycRequest(response.data);
      } catch (error) {
        console.error('Error fetching KYC request:', error);
        toast.error('Failed to load KYC request details');
      } finally {
        setLoading(false);
      }
    };

    fetchKycRequest();
  }, [params.kycId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!kycRequest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">KYC request not found</p>
      </div>
    );
  }

  const handleDocumentView = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDocumentDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = url.split('/').pop() || 'document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleApprove = async () => {
    try {
      setIsUpdating(true);
      await axios.patch(`/api/kyc/requests/${params.kycId}/update`, {
        status: 'APPROVED',
      });
      toast.success('KYC request approved successfully');
      setKycRequest(prev => prev ? { ...prev, status: 'APPROVED' } : null);
      setIsConfirmApproveModalOpen(false);
    } catch (error) {
      console.error('Error approving KYC request:', error);
      toast.error('Failed to approve KYC request');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async (values: RejectionFormValues) => {
    try {
      setIsUpdating(true);
      await axios.patch(`/api/kyc/requests/${params.kycId}/update`, {
        status: 'REJECTED',
        rejectionReason: values.reason,
      });
      toast.success('KYC request rejected successfully');
      setKycRequest(prev => prev ? { ...prev, status: 'REJECTED', rejectionReason: values.reason } : null);
      setIsRejectionModalOpen(false);
      rejectionForm.reset();
    } catch (error) {
      console.error('Error rejecting KYC request:', error);
      toast.error('Failed to reject KYC request');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">KYC Verification Details</h1>
        <div className="flex items-center gap-4">
          <Badge variant={
            kycRequest.status === 'APPROVED' ? 'default' :
            kycRequest.status === 'REJECTED' ? 'destructive' :
            'default'
          }>
            {kycRequest.status}
          </Badge>
          {kycRequest.status === 'PENDING' && (
            <>
              <Button
                onClick={() => setIsConfirmApproveModalOpen(true)}
                variant="default"
                disabled={isUpdating}
              >
                Approve
              </Button>
              <Button
                onClick={() => setIsRejectionModalOpen(true)}
                variant="destructive"
                disabled={isUpdating}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{kycRequest.firstName} {kycRequest.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{format(new Date(kycRequest.dateOfBirth), 'PPP')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nationality</p>
              <p className="font-medium">{kycRequest.nationality}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{kycRequest.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{kycRequest.user.phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>ID Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">ID Type</p>
              <p className="font-medium">{kycRequest.idType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID Number</p>
              <p className="font-medium">{kycRequest.idNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID Expiration Date</p>
              <p className="font-medium">{format(new Date(kycRequest.idExpirationDate), 'PPP')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Submitted Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kycRequest.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium">{doc.type}</span>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDocumentView(doc.url || '')}
                    >
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDocumentDownload(doc.url || '')}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal for Approval */}
      <Dialog open={isConfirmApproveModalOpen} onOpenChange={setIsConfirmApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm KYC Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this KYC request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmApproveModalOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                'Confirm Approval'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={isRejectionModalOpen} onOpenChange={setIsRejectionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC request.
            </DialogDescription>
          </DialogHeader>
          <Form {...rejectionForm}>
            <form onSubmit={rejectionForm.handleSubmit(handleReject)} className="space-y-4">
              <FormField
                control={rejectionForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rejection Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the reason for rejection..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRejectionModalOpen(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject Request'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
