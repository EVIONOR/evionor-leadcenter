import jsPDF from "jspdf";

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

interface QuoteItem {
  name: string;
  quantity: number;
  grossPrice: number;
}

interface QuoteData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCity?: string;
  customerZip?: string;
  items: QuoteItem[];
  productUrl?: string;
}

// Generate a quote number based on date
const generateQuoteNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `EVIONOR / ${year}-${random}`;
};

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}.`;
};

export const generateQuotePdf = async (data: QuoteData): Promise<Blob> => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const quoteNumber = generateQuoteNumber();
  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + 14);

  // Calculate totals
  const totalGross = data.items.reduce((sum, item) => sum + item.grossPrice * item.quantity, 0);
  const totalNet = Math.round(totalGross / 1.27);
  const totalVat = totalGross - totalNet;

  // ===== HEADER =====
  doc.setFillColor(10, 37, 64); // #0a2540
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Árajánlat", margin, 18);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(quoteNumber, margin, 28);

  // Logo in top-right corner
  try {
    const logoImg = await loadImage("/images/evionor-logo-pdf.png");
    doc.addImage(logoImg, "PNG", pageWidth - margin - 40, 8, 40, 24, undefined, "FAST");
  } catch (e) {
    // Fallback text if logo fails
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("EVIONOR", pageWidth - margin, 18, { align: "right" });
  }

  // ===== COMPANY & CUSTOMER INFO =====
  let y = 52;
  const colWidth = contentWidth / 2 - 5;
  const labelCol = margin;
  const valueCol = margin + 42;

  // Left column - Company
  doc.setTextColor(100, 116, 139); // #64748b
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("ÁRAJÁNLAT KIBOCSÁTÓ", labelCol, y);

  y += 6;
  doc.setTextColor(10, 37, 64);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Nordisk Inova Kft", labelCol, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Varjú Kálmán utca 19.", labelCol, y);
  y += 4;
  doc.text("1194 Budapest, Magyarország", labelCol, y);

  y += 7;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Adószám:", labelCol, y);
  doc.setTextColor(10, 37, 64);
  doc.text("32900545-2-43", valueCol, y);

  y += 4;
  doc.setTextColor(100, 116, 139);
  doc.text("Cégjegyzékszám:", labelCol, y);
  doc.setTextColor(10, 37, 64);
  doc.text("01-09-448550", valueCol, y);

  y += 4;
  doc.setTextColor(100, 116, 139);
  doc.text("Közösségi adószám:", labelCol, y);
  doc.setTextColor(10, 37, 64);
  doc.text("HU32900545", valueCol, y);

  y += 7;
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("BANKSZÁMLASZÁM", labelCol, y);
  y += 4;
  doc.setTextColor(10, 37, 64);
  doc.setFont("helvetica", "normal");
  doc.text("IBAN: HU25 1041 0400 0000 0190 1630 8774", labelCol, y);
  y += 4;
  doc.text("GIRO: 10410400-00000190-16308774", labelCol, y);
  y += 4;
  doc.setTextColor(100, 116, 139);
  doc.text("Bank neve:", labelCol, y);
  doc.setTextColor(10, 37, 64);
  doc.text("K&H Bank", labelCol + 22, y);

  // Right column - Customer
  const rightCol = margin + colWidth + 10;
  let yRight = 52;

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("ÜGYFÉL ADATAI", rightCol, yRight);

  yRight += 6;
  doc.setTextColor(10, 37, 64);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(data.customerName, rightCol, yRight);

  yRight += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(data.customerEmail, rightCol, yRight);

  yRight += 4;
  doc.text(data.customerPhone, rightCol, yRight);

  if (data.customerCity) {
    yRight += 4;
    doc.text(`${data.customerZip || ""} ${data.customerCity}`, rightCol, yRight);
  }

  // ===== DATES =====
  y = Math.max(y, yRight) + 12;

  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.roundedRect(margin, y - 4, contentWidth, 16, 3, 3, "F");

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Árajánlat dátuma:", margin + 4, y + 3);
  doc.setTextColor(10, 37, 64);
  doc.setFont("helvetica", "bold");
  doc.text(formatDate(today), margin + 40, y + 3);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Érvényesség:", margin + 80, y + 3);
  doc.setTextColor(10, 37, 64);
  doc.setFont("helvetica", "bold");
  doc.text(formatDate(validUntil), margin + 108, y + 3);

  // ===== ITEMS TABLE =====
  y += 20;

  // Table header
  doc.setFillColor(10, 37, 64);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("MEGNEVEZÉS", margin + 3, y + 5.5);
  doc.text("MENNY.", margin + 90, y + 5.5);
  doc.text("NETTÓ ÁR", margin + 108, y + 5.5);
  doc.text("ÁFA", margin + 135, y + 5.5);
  doc.text("BRUTTÓ ÁR", margin + 148, y + 5.5);

  y += 8;

  // Table rows
  data.items.forEach((item, index) => {
    const netPrice = Math.round(item.grossPrice / 1.27);
    const vatAmount = item.grossPrice - netPrice;
    const rowHeight = 9;

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
    }

    doc.setTextColor(10, 37, 64);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`${index + 1}. ${item.name}`, margin + 3, y + 6);
    doc.text(`${item.quantity} db`, margin + 90, y + 6);
    doc.text(`${formatHuf(netPrice)}`, margin + 108, y + 6);
    doc.text("27%", margin + 135, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text(`${formatHuf(item.grossPrice)}`, margin + 148, y + 6);

    y += rowHeight;
  });

  // Table border
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y - data.items.length * 9 - 8, contentWidth, data.items.length * 9 + 8);

  // ===== TOTALS =====
  y += 8;

  const totalsX = margin + contentWidth - 70;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Nettó összeg:", totalsX, y);
  doc.setTextColor(10, 37, 64);
  doc.text(`${formatHuf(totalNet)}`, totalsX + 50, y, { align: "right" });

  y += 5;
  doc.setTextColor(100, 116, 139);
  doc.text("27% ÁFA:", totalsX, y);
  doc.setTextColor(10, 37, 64);
  doc.text(`${formatHuf(totalVat)}`, totalsX + 50, y, { align: "right" });

  y += 7;
  doc.setFillColor(0, 113, 227); // #0071e3
  doc.roundedRect(totalsX - 5, y - 5, 75, 12, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Bruttó végösszeg:", totalsX, y + 2);
  doc.text(`${formatHuf(totalGross)}`, totalsX + 65, y + 2, { align: "right" });

  // ===== FOOTER NOTE =====
  y += 20;
  if (data.productUrl) {
    doc.setFontSize(8);
    doc.setTextColor(0, 113, 227);
    doc.text("Termék megtekintése:", margin, y);
    doc.textWithLink(data.productUrl, margin + 40, y, { url: data.productUrl });
  }

  y += 10;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.text("Ez az árajánlat elektronikusan készült és aláírás nélkül érvényes.", margin, y);
  y += 4;
  doc.text("EVIONOR – Nordisk Inova Kft. | evionor.hu | info@evionor.hu", margin, y);

  return doc.output("blob");
};

function formatHuf(amount: number): string {
  return new Intl.NumberFormat("hu-HU").format(amount) + " Ft";
}
