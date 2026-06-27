// ─── GST CALCULATION UTILITIES ─────────────────────────────────
// Core tax calculation logic for Indian GST-compliant invoicing

export interface LineItemTax {
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface InvoiceTotals {
  subtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  grandTotal: number;
}

/**
 * Calculate tax for a single line item
 * For intra-state: GST is split equally into CGST + SGST
 * For inter-state: Full GST goes as IGST
 */
export function calculateLineItemTax(
  quantity: number,
  unitPrice: number,
  gstRate: number,
  isInterState: boolean
): LineItemTax {
  const taxableAmount = round(quantity * unitPrice);
  const totalTax = round(taxableAmount * (gstRate / 100));

  if (isInterState) {
    return {
      taxableAmount,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: totalTax,
      totalAmount: round(taxableAmount + totalTax),
    };
  }

  const halfTax = round(totalTax / 2);
  return {
    taxableAmount,
    cgstAmount: halfTax,
    sgstAmount: round(totalTax - halfTax), // handle odd paise
    igstAmount: 0,
    totalAmount: round(taxableAmount + totalTax),
  };
}

/**
 * Calculate totals for an entire invoice from line items
 */
export function calculateInvoiceTotals(
  items: LineItemTax[]
): InvoiceTotals {
  const subtotal = round(items.reduce((sum, item) => sum + item.taxableAmount, 0));
  const cgstTotal = round(items.reduce((sum, item) => sum + item.cgstAmount, 0));
  const sgstTotal = round(items.reduce((sum, item) => sum + item.sgstAmount, 0));
  const igstTotal = round(items.reduce((sum, item) => sum + item.igstAmount, 0));
  const grandTotal = round(subtotal + cgstTotal + sgstTotal + igstTotal);

  return { subtotal, cgstTotal, sgstTotal, igstTotal, grandTotal };
}

/**
 * Determine if a supply is inter-state based on state codes
 */
export function isInterStateSupply(
  orgStateCode: string | null | undefined,
  customerStateCode: string | null | undefined
): boolean {
  if (!orgStateCode || !customerStateCode) return false;
  return orgStateCode !== customerStateCode;
}

/**
 * Format a number as Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert a number to words (Indian format)
 * e.g., 1250.50 → "Rupees One Thousand Two Hundred Fifty and Paise Fifty Only"
 */
export function numberToWords(num: number): string {
  if (num === 0) return "Rupees Zero Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convertLessThanThousand(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
    );
  }

  function convertToIndianWords(n: number): string {
    if (n === 0) return "";

    let result = "";
    // Crore
    if (n >= 10000000) {
      result += convertLessThanThousand(Math.floor(n / 10000000)) + " Crore ";
      n %= 10000000;
    }
    // Lakh
    if (n >= 100000) {
      result += convertLessThanThousand(Math.floor(n / 100000)) + " Lakh ";
      n %= 100000;
    }
    // Thousand
    if (n >= 1000) {
      result += convertLessThanThousand(Math.floor(n / 1000)) + " Thousand ";
      n %= 1000;
    }
    // Remainder
    if (n > 0) {
      result += convertLessThanThousand(n);
    }

    return result.trim();
  }

  const intPart = Math.floor(Math.abs(num));
  const decPart = Math.round((Math.abs(num) - intPart) * 100);

  let result = "Rupees " + convertToIndianWords(intPart);
  if (decPart > 0) {
    result += " and Paise " + convertToIndianWords(decPart);
  }
  result += " Only";

  return result;
}

/**
 * Round to 2 decimal places (avoiding floating point issues)
 */
export function round(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

// ─── INDIAN STATES & CODES ────────────────────────────────────

export const INDIAN_STATES = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "25", name: "Daman & Diu" },
  { code: "26", name: "Dadra & Nagar Haveli" },
  { code: "27", name: "Maharashtra" },
  { code: "28", name: "Andhra Pradesh (Old)" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh (New)" },
] as const;

export function getStateName(code: string): string {
  return INDIAN_STATES.find((s) => s.code === code)?.name || code;
}
