'use client';

import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import logger from "@/logging";

export interface FeedbackItem {
  id: string;
  userId: string;
  feedback: string;
  image: Buffer | null;
  metadata: {
    url: string;
    userAgent: string;
    timestamp: string;
    pathname?: string;
    search?: string;
  };
  createdAt: string;
  user: {
    id: string,
    metadata: {
      username: string;
      authSource: {
        type: string;
      };
    };
  };
}

interface FeedbackListProps {
  items: FeedbackItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOrderChange: (order: "asc" | "desc") => void;
  onLimitChange: (limit: number) => void;
}

export function FeedbackList({
  items,
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onOrderChange,
  onLimitChange,
}: FeedbackListProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const { toast } = useToast();

  const handleItemClick = (feedback: FeedbackItem) => {
    if (imageModalOpen) return; // Don't open feedback dialog if image modal is open
    setSelectedFeedback(feedback);
  };

  const handleImageView = (feedback: FeedbackItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedFeedback(feedback);
    logger.info(`Selected feedback: ${JSON.stringify(feedback)}`);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    // Clear selected feedback only if we're not showing the feedback report
    if (!selectedFeedback || imageModalOpen) {
      setSelectedFeedback(null);
    }
  };

  const handleDownloadImage = (image: Buffer) => {
    const base64 = Buffer.from(image).toString('base64');
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = 'feedback-screenshot.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Downloaded",
      description: "Screenshot downloaded successfully",
    });
  };

  const handleCopyMetadata = (metadata: FeedbackItem['metadata']) => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    toast({
      title: "Copied",
      description: "Metadata copied to clipboard",
    });
  };

  const truncateText = (text: string | undefined | null, length: number) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Select
              value={limit.toString()}
              onValueChange={(value) => onLimitChange(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="10 items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 items</SelectItem>
                <SelectItem value="10">10 items</SelectItem>
                <SelectItem value="20">20 items</SelectItem>
                <SelectItem value="50">50 items</SelectItem>
              </SelectContent>
            </Select>
            <Select
              defaultValue="desc"
              onValueChange={(value) => onOrderChange(value as "asc" | "desc")}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {total} items
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow 
                  key={item.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleItemClick(item)}
                >
                  <TableCell>
                    {format(new Date(item.createdAt), "PPpp")}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>{truncateText(item.user.metadata.username, 20)}</div>
                      <div className="text-xs text-muted-foreground">
                        ID: {truncateText(item.user.id, 8)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{truncateText(item.feedback, 50)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {truncateText(item.metadata.url, 30)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                      {item.image && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleImageView(item, e)}
                        >
                          <Icons.image className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyMetadata(item.metadata)}
                      >
                        <Icons.copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </Card>

      <Dialog 
        open={!!selectedFeedback && !imageModalOpen} 
        onOpenChange={(open) => {
          if (!open) setSelectedFeedback(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">User Feedback Report</DialogTitle>
            <DialogDescription>
              Submitted on {selectedFeedback && format(new Date(selectedFeedback.createdAt), "PPpp")}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-8 py-4">
              {/* URL */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">URL</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm break-all">{selectedFeedback.metadata.url}</p>
                </div>
              </div>

              {/* Feedback Message */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Feedback Message</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap break-words">{selectedFeedback.feedback}</p>
                </div>
              </div>

              {/* Screenshot - only show if there is one */}
              {selectedFeedback.image && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Screenshot</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadImage(selectedFeedback.image!)}
                      >
                        <Icons.download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setImageModalOpen(true)}
                      >
                        <Icons.maximize className="h-4 w-4 mr-2" />
                        View Full Size
                      </Button>
                    </div>
                  </div>
                  <div 
                    className="relative w-full h-[300px] border rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setImageModalOpen(true)}
                  >
                    <Image
                      src={`data:image/png;base64,${Buffer.from(selectedFeedback.image).toString('base64')}`}
                      alt="Feedback screenshot"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* User Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">User Information</h3>
                  <Badge variant="outline">
                    {selectedFeedback.user.metadata.authSource.type}
                  </Badge>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                  <div className="text-sm font-medium">Username</div>
                  <div className="text-sm break-all">{selectedFeedback.user.metadata.username}</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    ID: {selectedFeedback.user.id}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Metadata</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyMetadata(selectedFeedback.metadata)}
                  >
                    <Icons.copy className="h-4 w-4 mr-2" />
                    Copy Metadata
                  </Button>
                </div>
                <ScrollArea className="h-[200px] w-full rounded-md border">
                  <pre className="text-sm p-4 whitespace-pre-wrap break-words">
                    {JSON.stringify(selectedFeedback.metadata, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full-size Image Modal */}
      <Dialog 
        open={imageModalOpen} 
        onOpenChange={handleCloseImageModal}
      >
        <DialogContent className="max-w-[90vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Screenshot</DialogTitle>
          </DialogHeader>
          {selectedFeedback?.image && (
            <div className="relative w-full h-[80vh]">
              <Image
                src={`data:image/png;base64,${Buffer.from(selectedFeedback.image).toString('base64')}`}
                alt="Feedback screenshot"
                fill
                className="object-contain"
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleDownloadImage(selectedFeedback!.image!)}
            >
              <Icons.download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={handleCloseImageModal}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 