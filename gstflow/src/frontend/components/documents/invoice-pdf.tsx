
import { formatCurrency, numberToWords, getStateName } from "@/backend/services/gst";
import { formatDate } from "@/backend/db/helpers";
import { INVOICE_STATUSES } from "@/backend/validations/invoice";

interface InvoiceTemplateProps {
  invoice: {
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate: Date | null;
    subtotal: number;
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    totalAmount: number;
    placeOfSupply: string | null;
    reverseCharge: boolean;
    status: string;
    notes: string | null;
    organization: {
      name: string;
      gstin: string | null;
      address: string | null;
      city: string | null;
      state: string | null;
      stateCode: string | null;
      pincode: string | null;
      phone: string | null;
      email: string | null;
    };
    customer: {
      name: string;
      gstin: string | null;
      billingAddress: string | null;
      city: string | null;
      state: string | null;
      pincode: string | null;
      phone: string | null;
      email: string | null;
    };
    items: Array<{
      description: string;
      hsnCode: string | null;
      quantity: number;
      unitPrice: number;
      gstRate: number;
      taxableAmount: number;
      cgstAmount: number;
      sgstAmount: number;
      igstAmount: number;
      totalAmount: number;
    }>;
  };
  isPrintMode?: boolean;
}

export function InvoiceTemplate({ invoice, isPrintMode = false }: InvoiceTemplateProps) {
  const hasIGST = invoice.igstTotal > 0;
  const statusConfig = INVOICE_STATUSES.find((s) => s.value === invoice.status);

  return (
    <div
      className={`bg-white text-gray-900 ${
        isPrintMode
          ? "w-[210mm] min-h-[297mm] p-8 mx-auto"
          : "rounded-xl border border-border/50 p-6 lg:p-8"
      }`}
      id="invoice-template"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            TAX INVOICE
          </h1>
          {!isPrintMode && statusConfig && (
            <span
              className={`inline-block mt-1 text-xs px-2 py-0.5 rounded border ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-blue-600">
            {invoice.organization.name}
          </p>
          {invoice.organization.gstin && (
            <p className="text-sm text-gray-600 font-mono">
              GSTIN: {invoice.organization.gstin}
            </p>
          )}
        </div>
      </div>

      {/* Business & Customer Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            From
          </p>
          <p className="font-semibold text-sm">{invoice.organization.name}</p>
          {invoice.organization.address && (
            <p className="text-sm text-gray-600">{invoice.organization.address}</p>
          )}
          <p className="text-sm text-gray-600">
            {[
              invoice.organization.city,
              invoice.organization.state,
              invoice.organization.pincode,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          {invoice.organization.phone && (
            <p className="text-sm text-gray-600">Ph: {invoice.organization.phone}</p>
          )}
          {invoice.organization.email && (
            <p className="text-sm text-gray-600">{invoice.organization.email}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Bill To
          </p>
          <p className="font-semibold text-sm">{invoice.customer.name}</p>
          {invoice.customer.gstin && (
            <p className="text-sm text-gray-600 font-mono">
              GSTIN: {invoice.customer.gstin}
            </p>
          )}
          {invoice.customer.billingAddress && (
            <p className="text-sm text-gray-600">{invoice.customer.billingAddress}</p>
          )}
          <p className="text-sm text-gray-600">
            {[
              invoice.customer.city,
              invoice.customer.state,
              invoice.customer.pincode,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      </div>

      {/* Invoice Meta */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500">Invoice No.</p>
          <p className="font-semibold text-sm font-mono">{invoice.invoiceNumber}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Date</p>
          <p className="font-semibold text-sm">{formatDate(invoice.invoiceDate)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Due Date</p>
          <p className="font-semibold text-sm">{formatDate(invoice.dueDate)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Place of Supply</p>
          <p className="font-semibold text-sm">
            {invoice.placeOfSupply
              ? getStateName(invoice.placeOfSupply)
              : "—"}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="p-2 text-left rounded-tl-lg">#</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-center">HSN</th>
            <th className="p-2 text-right">Qty</th>
            <th className="p-2 text-right">Rate</th>
            <th className="p-2 text-right">Taxable</th>
            {!hasIGST ? (
              <>
                <th className="p-2 text-right">CGST</th>
                <th className="p-2 text-right">SGST</th>
              </>
            ) : (
              <th className="p-2 text-right">IGST</th>
            )}
            <th className="p-2 text-right rounded-tr-lg">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr
              key={idx}
              className={`${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              } border-b border-gray-100`}
            >
              <td className="p-2 text-gray-500">{idx + 1}</td>
              <td className="p-2 font-medium">{item.description}</td>
              <td className="p-2 text-center font-mono text-xs">
                {item.hsnCode || "—"}
              </td>
              <td className="p-2 text-right font-mono">{item.quantity}</td>
              <td className="p-2 text-right font-mono">
                {formatCurrency(item.unitPrice)}
              </td>
              <td className="p-2 text-right font-mono">
                {formatCurrency(item.taxableAmount)}
              </td>
              {!hasIGST ? (
                <>
                  <td className="p-2 text-right font-mono text-xs">
                    {formatCurrency(item.cgstAmount)}
                    <br />
                    <span className="text-gray-400">@{item.gstRate / 2}%</span>
                  </td>
                  <td className="p-2 text-right font-mono text-xs">
                    {formatCurrency(item.sgstAmount)}
                    <br />
                    <span className="text-gray-400">@{item.gstRate / 2}%</span>
                  </td>
                </>
              ) : (
                <td className="p-2 text-right font-mono text-xs">
                  {formatCurrency(item.igstAmount)}
                  <br />
                  <span className="text-gray-400">@{item.gstRate}%</span>
                </td>
              )}
              <td className="p-2 text-right font-mono font-semibold">
                {formatCurrency(item.totalAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-80 space-y-1">
          <div className="flex justify-between text-sm p-1">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
          </div>
          {!hasIGST ? (
            <>
              <div className="flex justify-between text-sm p-1">
                <span className="text-gray-600">CGST</span>
                <span className="font-mono">
                  {formatCurrency(invoice.cgstTotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm p-1">
                <span className="text-gray-600">SGST</span>
                <span className="font-mono">
                  {formatCurrency(invoice.sgstTotal)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-sm p-1">
              <span className="text-gray-600">IGST</span>
              <span className="font-mono">
                {formatCurrency(invoice.igstTotal)}
              </span>
            </div>
          )}
          {invoice.reverseCharge && (
            <div className="flex justify-between text-sm p-1 text-amber-600">
              <span>Reverse Charge</span>
              <span>Applicable</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold p-2 bg-blue-50 rounded-lg border border-blue-100">
            <span>Grand Total</span>
            <span className="font-mono text-blue-600">
              {formatCurrency(invoice.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500">Amount in Words</p>
        <p className="text-sm font-medium italic">
          {numberToWords(invoice.totalAmount)}
        </p>
      </div>

      {/* Notes & Terms */}
      {invoice.notes && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Notes / Terms
          </p>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {invoice.notes}
          </p>
        </div>
      )}

      {/* Footer: Signature */}
      <div className="flex justify-between items-end pt-8 border-t border-gray-200 mt-8">
        <div className="text-xs text-gray-400">
          <p>This is a computer-generated invoice.</p>
          <p>Generated by GSTFlow</p>
        </div>
        <div className="text-center">
          <div className="w-40 border-b border-gray-400 mb-1 h-12" />
          <p className="text-xs text-gray-500">Authorized Signatory</p>
          <p className="text-xs font-medium">{invoice.organization.name}</p>
        </div>
      </div>
    </div>
  );
}
