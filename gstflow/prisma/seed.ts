/**
 * GSTFlow Demo Seed Script
 * Seeds the database with realistic demo data for analytics demonstration
 */

import "dotenv/config";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

// Resolve absolute path to dev.db
const dbPath = path.resolve(process.cwd(), "dev.db");
const dbUrl = `file:${dbPath}`;
console.log("📂 Database path:", dbPath);

const libsql = createClient({ url: dbUrl });
const adapter = new PrismaLibSql(libsql as any);

// @ts-ignore - Prisma 7 needs adapter passed to constructor
const prisma = new PrismaClient({ adapter });

// ─── HELPERS ────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── SEED DATA ──────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding GSTFlow demo database...\n");

  // 1. Create demo user + organization
  const hashedPassword = await bcrypt.hash("Demo@123", 10);

  const org = await prisma.organization.upsert({
    where: { gstin: "27AADCB2230M1ZT" },
    update: {},
    create: {
      name: "TechVista Solutions Pvt. Ltd.",
      gstin: "27AADCB2230M1ZT",
      pan: "AADCB2230M",
      phone: "+91 9876543210",
      email: "billing@techvista.in",
      address: "42, Bandra Kurla Complex, G Block",
      city: "Mumbai",
      state: "Maharashtra",
      stateCode: "27",
      pincode: "400051",
      invoicePrefix: "TV",
      nextInvoiceNo: 1,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "demo@techvista.in" },
    update: {},
    create: {
      name: "Rajesh Sharma",
      email: "demo@techvista.in",
      password: hashedPassword,
      role: "ADMIN",
      organizationId: org.id,
    },
  });

  console.log(`✅ Organization: ${org.name}`);
  console.log(`✅ Demo User: ${user.email} (password: Demo@123)\n`);

  // 2. Create customers
  const customerData = [
    {
      name: "Infosys Technologies",
      email: "accounts@infosys.com",
      phone: "+91 8012345001",
      gstin: "29AABCI5134L1ZV",
      billingAddress: "Electronics City, Hosur Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560100",
    },
    {
      name: "Reliance Retail Ltd.",
      email: "vendor@relianceretail.com",
      phone: "+91 8012345002",
      gstin: "27AABCR4324F1Z2",
      billingAddress: "Maker Chambers IV, 222 Nariman Point",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400021",
    },
    {
      name: "Wipro Digital Services",
      email: "procurement@wipro.com",
      phone: "+91 8012345003",
      gstin: "29AABCW6872K1Z1",
      billingAddress: "Doddakannelli, Sarjapur Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560035",
    },
    {
      name: "Tata Consultancy Services",
      email: "purchasing@tcs.com",
      phone: "+91 8012345004",
      gstin: "27AABCT1234Z1ZA",
      billingAddress: "TCS House, Ravindra Annexe",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
    {
      name: "HCL Technologies",
      email: "vendor@hcl.com",
      phone: "+91 8012345005",
      gstin: "09AABCH2345Z1ZB",
      billingAddress: "HCL Technologies, Sector 126",
      city: "Noida",
      state: "Uttar Pradesh",
      pincode: "201304",
    },
    {
      name: "Flipkart Internet Pvt Ltd.",
      email: "seller@flipkart.com",
      phone: "+91 8012345006",
      gstin: "29AABCF5678Z1ZC",
      billingAddress: "Cessna Business Park, Outer Ring Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560103",
    },
    {
      name: "Zomato Ltd.",
      email: "partners@zomato.com",
      phone: "+91 8012345007",
      gstin: "06AABCZ9012Z1ZD",
      billingAddress: "Ground Floor, Tower D, DLF Cyber City",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122002",
    },
    {
      name: "Paytm Payments Bank",
      email: "merchant@paytm.com",
      phone: "+91 8012345008",
      gstin: "09AABCP3456Z1ZE",
      billingAddress: "B-121, Sector 5",
      city: "Noida",
      state: "Uttar Pradesh",
      pincode: "201301",
    },
  ];

  const customers = [];
  for (const c of customerData) {
    const customer = await prisma.customer.create({
      data: { ...c, organizationId: org.id },
    });
    customers.push(customer);
  }
  console.log(`✅ ${customers.length} customers created`);

  // 3. Create products
  const productData = [
    {
      name: "Cloud Server Setup",
      description: "Full AWS/GCP server setup and configuration",
      hsnCode: "998314",
      sku: "SRV-001",
      unit: "NOS",
      price: 45000,
      purchasePrice: 15000,
      gstRate: 18,
      stock: 50,
      lowStockAlert: 5,
    },
    {
      name: "Enterprise Software License",
      description: "Annual enterprise software licensing fee",
      hsnCode: "998316",
      sku: "LIC-001",
      unit: "NOS",
      price: 120000,
      purchasePrice: 60000,
      gstRate: 18,
      stock: 100,
      lowStockAlert: 10,
    },
    {
      name: "IT Consultation (per hour)",
      description: "Professional IT consulting services",
      hsnCode: "998311",
      sku: "CON-001",
      unit: "HRS",
      price: 5000,
      purchasePrice: 2000,
      gstRate: 18,
      stock: 500,
      lowStockAlert: 20,
    },
    {
      name: "Website Development Package",
      description: "Full-stack web application development",
      hsnCode: "998314",
      sku: "WEB-001",
      unit: "NOS",
      price: 250000,
      purchasePrice: 80000,
      gstRate: 18,
      stock: 30,
      lowStockAlert: 3,
    },
    {
      name: "Mobile App Development",
      description: "Cross-platform mobile application",
      hsnCode: "998314",
      sku: "MOB-001",
      unit: "NOS",
      price: 350000,
      purchasePrice: 120000,
      gstRate: 18,
      stock: 20,
      lowStockAlert: 2,
    },
    {
      name: "Annual Maintenance Contract",
      description: "Yearly AMC for IT infrastructure",
      hsnCode: "998316",
      sku: "AMC-001",
      unit: "NOS",
      price: 75000,
      purchasePrice: 30000,
      gstRate: 18,
      stock: 40,
      lowStockAlert: 5,
    },
    {
      name: "Data Analytics Dashboard",
      description: "Custom BI dashboard development",
      hsnCode: "998314",
      sku: "ANA-001",
      unit: "NOS",
      price: 180000,
      purchasePrice: 60000,
      gstRate: 18,
      stock: 15,
      lowStockAlert: 3,
    },
    {
      name: "Cybersecurity Audit",
      description: "Comprehensive security assessment and report",
      hsnCode: "998315",
      sku: "SEC-001",
      unit: "NOS",
      price: 95000,
      purchasePrice: 35000,
      gstRate: 18,
      stock: 25,
      lowStockAlert: 5,
    },
    {
      name: "Server Rack (4U)",
      description: "Dell PowerEdge 4U server rack unit",
      hsnCode: "847150",
      sku: "HW-001",
      unit: "NOS",
      price: 285000,
      purchasePrice: 210000,
      gstRate: 18,
      stock: 8,
      lowStockAlert: 2,
    },
    {
      name: "Laptop (Business Grade)",
      description: "ThinkPad X1 Carbon business laptop",
      hsnCode: "847130",
      sku: "HW-002",
      unit: "NOS",
      price: 112000,
      purchasePrice: 85000,
      gstRate: 18,
      stock: 3,
      lowStockAlert: 5,
    },
  ];

  const products = [];
  for (const p of productData) {
    const product = await prisma.product.create({
      data: { ...p, organizationId: org.id },
    });
    products.push(product);
  }
  console.log(`✅ ${products.length} products created`);

  // 4. Create invoices spanning last 12 months
  const now = new Date();
  const statuses = ["DRAFT", "SENT", "PAID", "PAID", "PAID", "PARTIAL", "OVERDUE", "PAID"];
  let invoiceSeq = 1;

  const allInvoices = [];

  for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
    const invoicesThisMonth = randomInt(3, 7); // 3-7 invoices per month

    for (let j = 0; j < invoicesThisMonth; j++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0);
      const invoiceDate = randomDate(monthStart, monthEnd);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);

      const customer = randomItem(customers);
      const isInterState = customer.state !== "Maharashtra"; // org is in Maharashtra
      const status = randomItem(statuses);

      // Pick 1-4 random products
      const numItems = randomInt(1, 4);
      const selectedProducts = [];
      const usedIndexes = new Set<number>();
      for (let k = 0; k < numItems; k++) {
        let idx = randomInt(0, products.length - 1);
        while (usedIndexes.has(idx)) {
          idx = randomInt(0, products.length - 1);
        }
        usedIndexes.add(idx);
        selectedProducts.push(products[idx]);
      }

      // Calculate item totals
      let subtotal = 0;
      let cgstTotal = 0;
      let sgstTotal = 0;
      let igstTotal = 0;

      const items = selectedProducts.map((p) => {
        const quantity = randomInt(1, 5);
        const unitPrice = p.price;
        const taxableAmount = Math.round(quantity * unitPrice * 100) / 100;
        const totalTax = Math.round(taxableAmount * (p.gstRate / 100) * 100) / 100;

        let cgstAmount = 0;
        let sgstAmount = 0;
        let igstAmount = 0;

        if (isInterState) {
          igstAmount = totalTax;
        } else {
          cgstAmount = Math.round((totalTax / 2) * 100) / 100;
          sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;
        }

        const totalAmount = Math.round((taxableAmount + totalTax) * 100) / 100;

        subtotal += taxableAmount;
        cgstTotal += cgstAmount;
        sgstTotal += sgstAmount;
        igstTotal += igstAmount;

        return {
          productId: p.id,
          description: p.name,
          hsnCode: p.hsnCode || "",
          quantity,
          unitPrice,
          gstRate: p.gstRate,
          taxableAmount,
          cgstAmount,
          sgstAmount,
          igstAmount,
          totalAmount,
        };
      });

      const totalAmount = Math.round((subtotal + cgstTotal + sgstTotal + igstTotal) * 100) / 100;
      const invoiceNumber = `TV-${String(invoiceSeq).padStart(4, "0")}`;
      invoiceSeq++;

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          organizationId: org.id,
          customerId: customer.id,
          invoiceDate,
          dueDate,
          subtotal: Math.round(subtotal * 100) / 100,
          cgstTotal: Math.round(cgstTotal * 100) / 100,
          sgstTotal: Math.round(sgstTotal * 100) / 100,
          igstTotal: Math.round(igstTotal * 100) / 100,
          totalAmount,
          placeOfSupply: customer.state || "Maharashtra",
          reverseCharge: false,
          status,
          notes: null,
          items: {
            create: items,
          },
        },
      });

      allInvoices.push({ invoice, totalAmount, status });
    }
  }

  // Update org next invoice number
  await prisma.organization.update({
    where: { id: org.id },
    data: { nextInvoiceNo: invoiceSeq },
  });

  console.log(`✅ ${allInvoices.length} invoices created`);

  // 5. Create payments for PAID and PARTIAL invoices
  let paymentCount = 0;
  for (const { invoice, totalAmount, status } of allInvoices) {
    if (status === "PAID") {
      await prisma.payment.create({
        data: {
          organizationId: org.id,
          invoiceId: invoice.id,
          amount: totalAmount,
          date: new Date(new Date(invoice.invoiceDate).getTime() + randomInt(1, 15) * 86400000),
          method: randomItem(["BANK_TRANSFER", "UPI", "CHEQUE", "CASH"]),
          status: "COMPLETED",
          reference: `TXN${randomInt(100000, 999999)}`,
        },
      });
      paymentCount++;
    } else if (status === "PARTIAL") {
      const partialAmount = Math.round(totalAmount * randomBetween(0.3, 0.7) * 100) / 100;
      await prisma.payment.create({
        data: {
          organizationId: org.id,
          invoiceId: invoice.id,
          amount: partialAmount,
          date: new Date(new Date(invoice.invoiceDate).getTime() + randomInt(1, 10) * 86400000),
          method: randomItem(["BANK_TRANSFER", "UPI", "CASH"]),
          status: "COMPLETED",
          reference: `TXN${randomInt(100000, 999999)}`,
        },
      });
      paymentCount++;
    }
  }
  console.log(`✅ ${paymentCount} payments created`);

  // 6. Create some expenses
  const expenseCategories = ["RENT", "SALARY", "UTILITIES", "SUPPLIES", "TRAVEL", "TAX"];

  for (let m = 5; m >= 0; m--) {
    const numExpenses = randomInt(2, 4);
    for (let i = 0; i < numExpenses; i++) {
      const expDate = randomDate(
        new Date(now.getFullYear(), now.getMonth() - m, 1),
        new Date(now.getFullYear(), now.getMonth() - m + 1, 0)
      );
      const category = randomItem(expenseCategories);
      const baseAmount = randomBetween(5000, 150000);
      const gstRate = category === "SALARY" ? 0 : 18;
      const tax = Math.round(baseAmount * (gstRate / 100) * 100) / 100;

      await prisma.expense.create({
        data: {
          organizationId: org.id,
          description: `${category.charAt(0) + category.slice(1).toLowerCase()} - ${expDate.toLocaleString("en-IN", { month: "short", year: "numeric" })}`,
          category,
          date: expDate,
          vendorName: randomItem([
            "WeWork India",
            "AWS India",
            "Google Cloud",
            "Office Depot",
            "Swiggy Corporate",
            "MSEB",
          ]),
          taxableAmount: baseAmount,
          cgstAmount: Math.round((tax / 2) * 100) / 100,
          sgstAmount: Math.round((tax / 2) * 100) / 100,
          igstAmount: 0,
          totalAmount: Math.round((baseAmount + tax) * 100) / 100,
          paymentMethod: randomItem(["BANK_TRANSFER", "UPI", "CASH"]),
          status: "PAID",
        },
      });
    }
  }
  console.log(`✅ Expenses created\n`);

  // Summary
  console.log("═══════════════════════════════════════════");
  console.log("  🎉 GSTFlow Demo Data Seeded Successfully!");
  console.log("═══════════════════════════════════════════");
  console.log("");
  console.log("  📧 Login: demo@techvista.in");
  console.log("  🔑 Password: Demo@123");
  console.log("");
  console.log("  📊 Data seeded:");
  console.log(`     • ${customers.length} customers`);
  console.log(`     • ${products.length} products`);
  console.log(`     • ${allInvoices.length} invoices (12 months)`);
  console.log(`     • ${paymentCount} payments`);
  console.log("     • Multiple expenses");
  console.log("");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
