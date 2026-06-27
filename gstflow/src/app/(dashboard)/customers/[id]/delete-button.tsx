"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCustomer } from "@/backend/actions/customer.actions";

interface DeleteCustomerButtonProps {
  id: string;
  name: string;
  hasInvoices: boolean;
}

export function DeleteCustomerButton({
  id,
  name,
  hasInvoices,
}: DeleteCustomerButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (hasInvoices) {
      toast.error("Cannot delete customer with existing invoices.");
      return;
    }

    if (!confirm(`Delete customer "${name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteCustomer(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Customer deleted successfully.");
        router.push("/dashboard/customers");
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:text-destructive"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4 mr-2" />
      )}
      Delete
    </Button>
  );
}
