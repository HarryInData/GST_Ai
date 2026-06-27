/**
 * GSTFlow Demo Seed Script
 * Seeds the database with realistic demo data for analytics demonstration
 * Uses libsql client directly (bypassing Prisma for seeding)
 */

import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const db = createClient({ url: "file:./dev.db" });

// ─── HELPERS ────────────────────────────────────────────────────

function cuid() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 25);
}

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isoDate(d) {
  return d.toISOString().replace("T", " ").replace(/\.\d{3}Z/, "");
}

// ─── MAIN ───────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding GSTFlow demo database...\n");

  const now = new Date();

  // 1. Create organization
  const orgId = cuid();
  await db.execute({
    sql: `INSERT OR IGNORE INTO Organization (id, name, gstin, pan, phone, email, address, city, state, stateCode, pincode, invoicePrefix, nextInvoiceNo, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      orgId,
      "TechVista Solutions Pvt. Ltd.",
      "27AADCB2230M1ZT",
      "AADCB2230M",
      "+91 9876543210",
      "billing@techvista.in",
      "42, Bandra Kurla Complex, G Block",
      "Mumbai",
      "Maharashtra",
      "27",
      "400051",
      "TV",
      1,
      isoDate(now),
      isoDate(now),
    ],
  });
  console.log("✅ Organization: TechVista Solutions Pvt. Ltd.");

  // 2. Create demo user
  const userId = cuid();
  const hashedPassword = await bcrypt.hash("Demo@123", 10);
  await db.execute({
    sql: `INSERT OR IGNORE INTO User (id, name, email, password, role, organizationId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [userId, "Rajesh Sharma", "demo@techvista.in", hashedPassword, "ADMIN", orgId, isoDate(now), isoDate(now)],
  });
  console.log("✅ Demo User: demo@techvista.in (password: Demo@123)");

  // 3. Create customers
  const customerData = [
    { name: "Infosys Technologies", email: "accounts@infosys.com", phone: "+91 8012345001", gstin: "29AABCI5134L1ZV", address: "Electronics City, Hosur Road", city: "Bangalore", state: "Karnataka", pincode: "560100" },
    { name: "Reliance Retail Ltd.", email: "vendor@relianceretail.com", phone: "+91 8012345002", gstin: "27AABCR4324F1Z2", address: "Maker Chambers IV, 222 Nariman Point", city: "Mumbai", state: "Maharashtra", pincode: "400021" },
    { name: "Wipro Digital Services", email: "procurement@wipro.com", phone: "+91 8012345003", gstin: "29AABCW6872K1Z1", address: "Doddakannelli, Sarjapur Road", city: "Bangalore", state: "Karnataka", pincode: "560035" },
    { name: "Tata Consultancy Services", email: "purchasing@tcs.com", phone: "+91 8012345004", gstin: "27AABCT1234Z1ZA", address: "TCS House, Ravindra Annexe", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    { name: "HCL Technologies", email: "vendor@hcl.com", phone: "+91 8012345005", gstin: "09AABCH2345Z1ZB", address: "HCL Technologies, Sector 126", city: "Noida", state: "Uttar Pradesh", pincode: "201304" },
    { name: "Flipkart Internet Pvt Ltd.", email: "seller@flipkart.com", phone: "+91 8012345006", gstin: "29AABCF5678Z1ZC", address: "Cessna Business Park, Outer Ring Road", city: "Bangalore", state: "Karnataka", pincode: "560103" },
    { name: "Zomato Ltd.", email: "partners@zomato.com", phone: "+91 8012345007", gstin: "06AABCZ9012Z1ZD", address: "Ground Floor, Tower D, DLF Cyber City", city: "Gurugram", state: "Haryana", pincode: "122002" },
    { name: "Paytm Payments Bank", email: "merchant@paytm.com", phone: "+91 8012345008", gstin: "09AABCP3456Z1ZE", address: "B-121, Sector 5", city: "Noida", state: "Uttar Pradesh", pincode: "201301" },
  ];

  const customers = [];
  for (const c of customerData) {
    const id = cuid();
    await db.execute({
      sql: `INSERT INTO Customer (id, organizationId, name, email, phone, gstin, billingAddress, city, state, pincode, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, orgId, c.name, c.email, c.phone, c.gstin, c.address, c.city, c.state, c.pincode, isoDate(now), isoDate(now)],
    });
    customers.push({ id, ...c });
  }
  console.log(`✅ ${customers.length} customers created`);

  // 4. Create products
  const productData = [
    { name: "Cloud Server Setup", description: "Full AWS/GCP server setup and configuration", hsnCode: "998314", sku: "SRV-001", unit: "NOS", price: 45000, purchasePrice: 15000, gstRate: 18, stock: 50, lowStockAlert: 5 },
    { name: "Enterprise Software License", description: "Annual enterprise software licensing fee", hsnCode: "998316", sku: "LIC-001", unit: "NOS", price: 120000, purchasePrice: 60000, gstRate: 18, stock: 100, lowStockAlert: 10 },
    { name: "IT Consultation (per hour)", description: "Professional IT consulting services", hsnCode: "998311", sku: "CON-001", unit: "HRS", price: 5000, purchasePrice: 2000, gstRate: 18, stock: 500, lowStockAlert: 20 },
    { name: "Website Development Package", description: "Full-stack web application development", hsnCode: "998314", sku: "WEB-001", unit: "NOS", price: 250000, purchasePrice: 80000, gstRate: 18, stock: 30, lowStockAlert: 3 },
    { name: "Mobile App Development", description: "Cross-platform mobile application", hsnCode: "998314", sku: "MOB-001", unit: "NOS", price: 350000, purchasePrice: 120000, gstRate: 18, stock: 20, lowStockAlert: 2 },
    { name: "Annual Maintenance Contract", description: "Yearly AMC for IT infrastructure", hsnCode: "998316", sku: "AMC-001", unit: "NOS", price: 75000, purchasePrice: 30000, gstRate: 18, stock: 40, lowStockAlert: 5 },
    { name: "Data Analytics Dashboard", description: "Custom BI dashboard development", hsnCode: "998314", sku: "ANA-001", unit: "NOS", price: 180000, purchasePrice: 60000, gstRate: 18, stock: 15, lowStockAlert: 3 },
    { name: "Cybersecurity Audit", description: "Comprehensive security assessment and report", hsnCode: "998315", sku: "SEC-001", unit: "NOS", price: 95000, purchasePrice: 35000, gstRate: 18, stock: 25, lowStockAlert: 5 },
    { name: "Server Rack (4U)", description: "Dell PowerEdge 4U server rack unit", hsnCode: "847150", sku: "HW-001", unit: "NOS", price: 285000, purchasePrice: 210000, gstRate: 18, stock: 8, lowStockAlert: 2 },
    { name: "Laptop (Business Grade)", description: "ThinkPad X1 Carbon business laptop", hsnCode: "847130", sku: "HW-002", unit: "NOS", price: 112000, purchasePrice: 85000, gstRate: 18, stock: 3, lowStockAlert: 5 },
  ];

  const products = [];
  for (const p of productData) {
    const id = cuid();
    await db.execute({
      sql: `INSERT INTO Product (id, organizationId, name, description, hsnCode, sku, unit, price, purchasePrice, gstRate, stock, lowStockAlert, isActive, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, orgId, p.name, p.description, p.hsnCode, p.sku, p.unit, p.price, p.purchasePrice, p.gstRate, p.stock, p.lowStockAlert, 1, isoDate(now), isoDate(now)],
    });
    products.push({ id, ...p });
  }
  console.log(`✅ ${products.length} products created`);

  // 5. Create invoices spanning last 12 months
  const statuses = ["DRAFT", "SENT", "PAID", "PAID", "PAID", "PARTIAL", "OVERDUE", "PAID"];
  let invoiceSeq = 1;
  const allInvoices = [];

  for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
    const invoicesThisMonth = randomInt(3, 7);

    for (let j = 0; j < invoicesThisMonth; j++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0);
      const invoiceDate = randomDate(monthStart, monthEnd);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);

      const customer = randomItem(customers);
      const isInterState = customer.state !== "Maharashtra";
      const status = randomItem(statuses);

      // Pick 1-4 random products
      const numItems = randomInt(1, 4);
      const selectedProducts = [];
      const usedIndexes = new Set();
      for (let k = 0; k < numItems; k++) {
        let idx = randomInt(0, products.length - 1);
        while (usedIndexes.has(idx)) idx = randomInt(0, products.length - 1);
        usedIndexes.add(idx);
        selectedProducts.push(products[idx]);
      }

      // Calculate totals
      let subtotal = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0;
      const items = [];

      for (const p of selectedProducts) {
        const quantity = randomInt(1, 5);
        const unitPrice = p.price;
        const taxableAmount = Math.round(quantity * unitPrice * 100) / 100;
        const totalTax = Math.round(taxableAmount * (p.gstRate / 100) * 100) / 100;

        let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
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

        items.push({
          productId: p.id,
          description: p.name,
          hsnCode: p.hsnCode,
          quantity,
          unitPrice,
          gstRate: p.gstRate,
          taxableAmount,
          cgstAmount,
          sgstAmount,
          igstAmount,
          totalAmount,
        });
      }

      const totalAmount = Math.round((subtotal + cgstTotal + sgstTotal + igstTotal) * 100) / 100;
      const invoiceNumber = `TV-${String(invoiceSeq).padStart(4, "0")}`;
      const invoiceId = cuid();
      invoiceSeq++;

      await db.execute({
        sql: `INSERT INTO Invoice (id, invoiceNumber, organizationId, customerId, invoiceDate, dueDate, subtotal, cgstTotal, sgstTotal, igstTotal, totalAmount, placeOfSupply, reverseCharge, status, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          invoiceId, invoiceNumber, orgId, customer.id,
          isoDate(invoiceDate), isoDate(dueDate),
          Math.round(subtotal * 100) / 100,
          Math.round(cgstTotal * 100) / 100,
          Math.round(sgstTotal * 100) / 100,
          Math.round(igstTotal * 100) / 100,
          totalAmount,
          customer.state || "Maharashtra",
          0, status,
          isoDate(invoiceDate), isoDate(invoiceDate),
        ],
      });

      // Create invoice items
      for (const item of items) {
        const itemId = cuid();
        await db.execute({
          sql: `INSERT INTO InvoiceItem (id, invoiceId, productId, description, hsnCode, quantity, unitPrice, gstRate, taxableAmount, cgstAmount, sgstAmount, igstAmount, totalAmount, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            itemId, invoiceId, item.productId, item.description, item.hsnCode,
            item.quantity, item.unitPrice, item.gstRate,
            item.taxableAmount, item.cgstAmount, item.sgstAmount, item.igstAmount, item.totalAmount,
            isoDate(invoiceDate), isoDate(invoiceDate),
          ],
        });
      }

      allInvoices.push({ invoiceId, invoiceDate, totalAmount, status });
    }
  }

  // Update org next invoice number
  await db.execute({
    sql: `UPDATE Organization SET nextInvoiceNo = ?, updatedAt = ? WHERE id = ?`,
    args: [invoiceSeq, isoDate(now), orgId],
  });

  console.log(`✅ ${allInvoices.length} invoices created (12 months of data)`);

  // 6. Create payments
  let paymentCount = 0;
  for (const inv of allInvoices) {
    if (inv.status === "PAID") {
      const payId = cuid();
      const payDate = new Date(inv.invoiceDate.getTime() + randomInt(1, 15) * 86400000);
      await db.execute({
        sql: `INSERT INTO Payment (id, organizationId, invoiceId, amount, date, method, status, reference, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          payId, orgId, inv.invoiceId, inv.totalAmount,
          isoDate(payDate),
          randomItem(["BANK_TRANSFER", "UPI", "CHEQUE", "CASH"]),
          "COMPLETED",
          `TXN${randomInt(100000, 999999)}`,
          isoDate(payDate), isoDate(payDate),
        ],
      });
      paymentCount++;
    } else if (inv.status === "PARTIAL") {
      const payId = cuid();
      const partialAmount = Math.round(inv.totalAmount * randomBetween(0.3, 0.7) * 100) / 100;
      const payDate = new Date(inv.invoiceDate.getTime() + randomInt(1, 10) * 86400000);
      await db.execute({
        sql: `INSERT INTO Payment (id, organizationId, invoiceId, amount, date, method, status, reference, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          payId, orgId, inv.invoiceId, partialAmount,
          isoDate(payDate),
          randomItem(["BANK_TRANSFER", "UPI", "CASH"]),
          "COMPLETED",
          `TXN${randomInt(100000, 999999)}`,
          isoDate(payDate), isoDate(payDate),
        ],
      });
      paymentCount++;
    }
  }
  console.log(`✅ ${paymentCount} payments created`);

  // 7. Create expenses
  const expenseCategories = ["RENT", "SALARY", "UTILITIES", "SUPPLIES", "TRAVEL", "TAX"];
  let expenseCount = 0;

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
      const halfTax = Math.round((tax / 2) * 100) / 100;

      const expId = cuid();
      const vendors = ["WeWork India", "AWS India", "Google Cloud", "Office Depot", "Swiggy Corporate", "MSEB"];
      await db.execute({
        sql: `INSERT INTO Expense (id, organizationId, description, category, date, vendorName, taxableAmount, cgstAmount, sgstAmount, igstAmount, totalAmount, paymentMethod, status, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          expId, orgId,
          `${category.charAt(0) + category.slice(1).toLowerCase()} - ${expDate.toLocaleString("en-IN", { month: "short", year: "numeric" })}`,
          category, isoDate(expDate), randomItem(vendors),
          baseAmount, halfTax, halfTax, 0,
          Math.round((baseAmount + tax) * 100) / 100,
          randomItem(["BANK_TRANSFER", "UPI", "CASH"]),
          "PAID", isoDate(expDate), isoDate(expDate),
        ],
      });
      expenseCount++;
    }
  }
  console.log(`✅ ${expenseCount} expenses created\n`);

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
  console.log(`     • ${expenseCount} expenses`);
  console.log("");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
