"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  setting?: Setting | null;
}

export function SettingDialog({ open, onOpenChange, onSuccess, setting }: Props) {
  const isEditing = !!setting;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: "",
      value: "",
      description: "",
    },
  });

  useEffect(() => {
    if (setting) {
      form.reset({
        key: setting.key,
        value: setting.value,
        description: setting.description || "",
      });
    } else {
      form.reset({
        key: "",
        value: "",
        description: "",
      });
    }
  }, [setting, form]);

  const onSubmit = async (data: FormData) => {
    try {
      const url = "/api/admin/settings";
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing ? { ...data, id: setting.id } : data;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to save setting");

      toast.success(isEditing ? "Setting updated" : "Setting created");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Setting" : "Create Setting"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                {...form.register("key")}
                disabled={isEditing}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                {...form.register("value")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
