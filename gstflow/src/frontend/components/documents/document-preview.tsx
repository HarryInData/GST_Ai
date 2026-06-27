"use client";

import { forwardRef } from "react";
import { formatCurrency } from "@/backend/services/gst";

export interface DocumentItem {
  description: string;
  hsnCode?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gstRate: number;
  amount: number;
}

export interface DocumentData {
  type: "QUOTATION" | "PURCHASE_ORDER" | "CREDIT_NOTE" | "DELIVERY_CHALLAN";
  number: string;
  date: string;
  validUntil?: string;
  // From
  fromName: string;
  fromAddress?: string;
  fromGstin?: string;
  fromPhone?: string;
  fromEmail?: string;
  // To
  toName: string;
  toAddress?: string;
  toGstin?: string;
  toPhone?: string;
  toEmail?: string;
  // Items
  items: DocumentItem[];
  // Totals
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  // Additional
  notes?: string;
  terms?: string;
  // Credit note specific
  originalInvoice?: string;
  reason?: string;
  // Delivery challan specific
  vehicleNo?: string;
  transporterName?: string;
  deliveryAddress?: string;
}

const DOCUMENT_TITLES: Record<string, string> = {
  QUOTATION: "Quotation / Estimate",
  PURCHASE_ORDER: "Purchase Order",
  CREDIT_NOTE: "Credit Note",
  DELIVERY_CHALLAN: "Delivery Challan",
};

export const DocumentPreview = forwardRef<HTMLDivElement, { data: DocumentData }>(
  function DocumentPreview({ data }, ref) {
    return (
      <div
        ref={ref}
        className="bg-white text-gray-900 p-8 rounded-xl shadow-lg max-w-3xl mx-auto print-page"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-indigo-500">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">
              {DOCUMENT_TITLES[data.type]}
            </h1>
            <p className="text-sm text-gray-500 mt-1">#{data.number}</p>
          </div>
          <div className="text-right">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center mb-1 ml-auto">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <p className="text-xs font-semibold text-gray-700">GST AI</p>
          </div>
        </div>

        {/* Date and Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Date
            </p>
            <p className="text-sm">{data.date}</p>
            {data.validUntil && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-3 mb-2">
                  Valid Until
                </p>
                <p className="text-sm">{data.validUntil}</p>
              </>
            )}
            {data.originalInvoice && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-3 mb-2">
                  Original Invoice
                </p>
                <p className="text-sm">{data.originalInvoice}</p>
              </>
            )}
            {data.vehicleNo && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-3 mb-2">
                  Vehicle No.
                </p>
                <p className="text-sm">{data.vehicleNo}</p>
              </>
            )}
          </div>
          <div className="text-right">
            {data.reason && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Reason
                </p>
                <p className="text-sm">{data.reason}</p>
              </>
            )}
            {data.transporterName && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Transporter
                </p>
                <p className="text-sm">{data.transporterName}</p>
              </>
            )}
          </div>
        </div>

        {/* From/To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              From
            </p>
            <p className="text-sm font-semibold">{data.fromName}</p>
            {data.fromGstin && (
              <p className="text-xs text-gray-500 mt-0.5">
                GSTIN: {data.fromGstin}
              </p>
            )}
            {data.fromAddress && (
              <p className="text-xs text-gray-500 mt-1">{data.fromAddress}</p>
            )}
            {data.fromPhone && (
              <p className="text-xs text-gray-500">📞 {data.fromPhone}</p>
            )}
            {data.fromEmail && (
              <p className="text-xs text-gray-500">✉️ {data.fromEmail}</p>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              To
            </p>
            <p className="text-sm font-semibold">{data.toName}</p>
            {data.toGstin && (
              <p className="text-xs text-gray-500 mt-0.5">
                GSTIN: {data.toGstin}
              </p>
            )}
            {data.toAddress && (
              <p className="text-xs text-gray-500 mt-1">{data.toAddress}</p>
            )}
            {data.toPhone && (
              <p className="text-xs text-gray-500">📞 {data.toPhone}</p>
            )}
            {data.toEmail && (
              <p className="text-xs text-gray-500">✉️ {data.toEmail}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-indigo-50">
                <th className="text-left py-2.5 px-3 font-semibold text-indigo-700 text-xs">#</th>
                <th className="text-left py-2.5 px-3 font-semibold text-indigo-700 text-xs">Description</th>
                {data.type !== "DELIVERY_CHALLAN" && (
                  <>
                    <th className="text-right py-2.5 px-3 font-semibold text-indigo-700 text-xs">Qty</th>
                    <th className="text-right py-2.5 px-3 font-semibold text-indigo-700 text-xs">Rate</th>
                    <th className="text-right py-2.5 px-3 font-semibold text-indigo-700 text-xs">GST %</th>
                    <th className="text-right py-2.5 px-3 font-semibold text-indigo-700 text-xs">Amount</th>
                  </>
                )}
                {data.type === "DELIVERY_CHALLAN" && (
                  <>
                    <th className="text-right py-2.5 px-3 font-semibold text-indigo-700 text-xs">Qty</th>
                    <th className="text-right py-2.5 px-3 font-semibold text-indigo-700 text-xs">Unit</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2.5 px-3 text-gray-500">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    {item.description}
                    {item.hsnCode && (
                      <span className="text-[10px] text-gray-400 ml-1">
                        (HSN: {item.hsnCode})
                      </span>
                    )}
                  </td>
                  {data.type !== "DELIVERY_CHALLAN" ? (
                    <>
                      <td className="py-2.5 px-3 text-right">{item.quantity} {item.unit}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right">{item.gstRate}%</td>
                      <td className="py-2.5 px-3 text-right font-medium">{formatCurrency(item.amount)}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 px-3 text-right">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right">{item.unit}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals — only for non-challan documents */}
        {data.type !== "DELIVERY_CHALLAN" && (
          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(data.subtotal)}</span>
              </div>
              {data.cgst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">CGST</span>
                  <span>{formatCurrency(data.cgst)}</span>
                </div>
              )}
              {data.sgst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SGST</span>
                  <span>{formatCurrency(data.sgst)}</span>
                </div>
              )}
              {data.igst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IGST</span>
                  <span>{formatCurrency(data.igst)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t-2 border-indigo-500">
                <span>Total</span>
                <span className="text-indigo-600">{formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes & Terms */}
        {data.notes && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-gray-600">{data.notes}</p>
          </div>
        )}
        {data.terms && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Terms & Conditions</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{data.terms}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-[10px] text-gray-400">
            Generated by GST AI — AI-Powered Business Management Platform
          </p>
        </div>
      </div>
    );
  }
);
