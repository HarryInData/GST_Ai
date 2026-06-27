import { notFound } from "next/navigation";
import { getInvoice } from "@/backend/actions/invoice.actions";
import { InvoiceTemplate } from "@/frontend/components/documents/invoice-pdf";
import { PrintButton } from "./print-button";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) notFound();

  return (
    <div className="print-page">
      {/* Print Controls - hidden in print */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <PrintButton />
      </div>

      {/* Invoice Template */}
      <InvoiceTemplate invoice={invoice} isPrintMode={true} />

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          .print-page,
          .print-page * {
            visibility: visible;
          }
          .print-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }

        @media screen {
          .print-page {
            max-width: 210mm;
            margin: 2rem auto;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
