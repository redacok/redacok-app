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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Image from 'next/image';
import Link from 'next/link';

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
  documents: Array<{
    id: string | null;
    type: string;
    url: string | null;
  }>;
}

const rejectionFormSchema = z.object({
  reason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

type RejectionFormValues = z.infer<typeof rejectionFormSchema>;

export function KycRequestsTable() {
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [fullScreenDoc, setFullScreenDoc] = useState<{ url: string; type: string } | null>(null);

  const form = useForm<RejectionFormValues>({
    resolver: zodResolver(rejectionFormSchema),
    defaultValues: {
      reason: "",
    },
  });

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

  const handleReject = async (values: RejectionFormValues) => {
    if (!selectedRequest) return;
    
    try {
      await axios.post('/api/kyc/review', {
        kycId: selectedRequest.id,
        status: 'REJECTED',
        rejectionReason: values.reason,
      });
      
      toast.success('KYC request rejected');
      setShowRejectionDialog(false);
      form.reset();
      fetchKycRequests();
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
                <Link href={`/admin/dashboard/kyc/${request.id}`}>
                  <div className="flex flex-col">
                    <span className="font-medium">{request.user.name}</span>
                    <span className="text-sm text-muted-foreground">{request.user.email}</span>
                  </div>
                </Link>
              </TableCell>
              <TableCell>{request.type}</TableCell>
              <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.status === 'APPROVED'
                      ? 'default'
                      : request.status === 'REJECTED'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowDocumentDialog(true);
                  }}
                >
                  View Documents
                  {request.documents.length > 0 && (
                    <span className="ml-1 text-xs bg-secondary px-1.5 py-0.5 rounded-full">
                      {request.documents.length}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  disabled={request.status !== 'PENDING'}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowRejectionDialog(true);
                  }}
                  disabled={request.status !== 'PENDING'}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Document Preview Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Documents Preview</DialogTitle>
            <DialogDescription>
              Reviewing documents for {selectedRequest?.user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 150px)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedRequest?.documents.map((doc) => (
                doc.url && (
                  <div key={doc.id} className="bg-card rounded-lg shadow-sm">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{doc.type}</h3>
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFullScreenDoc({ url: doc.url!, type: doc.type })}
                          >
                            Open
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await axios.get(doc.url!, {
                                  responseType: 'blob',
                                  headers: {
                                    'Accept': 'application/pdf,image/*'
                                  }
                                });
                                const blob = response.data;
                                const fileExtension = doc.url!.toLowerCase().endsWith('.pdf') ? 'pdf' : 
                                  blob.type.split('/')[1] || 'pdf';
                                const downloadUrl = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = downloadUrl;
                                link.download = `${doc.type.toLowerCase().replace(/\s+/g, '-')}.${fileExtension}`;
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(downloadUrl);
                              } catch (error) {
                                console.error('Error downloading document:', error);
                                toast.error('Failed to download document');
                              }
                            }}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="aspect-[4/3] relative overflow-hidden">
                      {doc.url.toLowerCase().endsWith('.pdf') ? (
                        <object
                          data={doc.url}
                          type="application/pdf"
                          className="w-full h-full"
                        >
                          <div className="w-full h-full flex items-center justify-center bg-secondary p-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground mb-2">
                                Click Open to view PDF
                              </p>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setFullScreenDoc({ url: doc.url!, type: doc.type })}
                              >
                                Open PDF
                              </Button>
                            </div>
                          </div>
                        </object>
                      ) : (
                        <Image
                          src={doc.url}
                          alt={doc.type}
                          fill
                          className="object-contain bg-secondary"
                          priority
                        />
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Screen Document Viewer */}
      <Dialog open={!!fullScreenDoc} onOpenChange={() => setFullScreenDoc(null)}>
        <DialogContent className="max-w-[95vw] min-h-[95vh] p-0">
          {fullScreenDoc && (
            <>
              <div className="flex justify-between items-center p-4 bg-background border-b">
                <h2 className="font-semibold">{fullScreenDoc.type}</h2>
              </div>
              <div className="relative w-full h-[calc(95vh-65px)]">
                {fullScreenDoc.url.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={fullScreenDoc.url}
                    className="w-full h-full border-0"
                    title={`${fullScreenDoc.type} Viewer`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <Image
                      src={fullScreenDoc.url}
                      alt={fullScreenDoc.type}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC request.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleReject)} className="space-y-4">
              <FormField
                control={form.control}
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
                <div className='flex gap-2 items-center justify-end'>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRejectionDialog(false)}
                  >
                    Cancel
                  </Button>
                <Button
                  type="submit"
                  variant="destructive"
                >
                  Submit
                </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
