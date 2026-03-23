import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

export interface ResidentialQuotePdfInput {
  customerCity?: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerZip?: string;
  grossPrice: number;
  productName: string;
  productUrl: string;
}

const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;

function sanitizePdfText(value: string): string {
  return value
    .replaceAll("á", "a")
    .replaceAll("Á", "A")
    .replaceAll("é", "e")
    .replaceAll("É", "E")
    .replaceAll("í", "i")
    .replaceAll("Í", "I")
    .replaceAll("ó", "o")
    .replaceAll("Ó", "O")
    .replaceAll("ö", "o")
    .replaceAll("Ö", "O")
    .replaceAll("ő", "o")
    .replaceAll("Ő", "O")
    .replaceAll("ú", "u")
    .replaceAll("Ú", "U")
    .replaceAll("ü", "u")
    .replaceAll("Ü", "U")
    .replaceAll("ű", "u")
    .replaceAll("Ű", "U");
}

function formatHuf(price: number): string {
  return new Intl.NumberFormat("hu-HU").format(price) + " Ft";
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}.`;
}

// Colors
const DARK_BLUE = rgb(10 / 255, 37 / 255, 64 / 255);        // #0a2540
const WHITE = rgb(1, 1, 1);
const SLATE = rgb(100 / 255, 116 / 255, 139 / 255);          // #64748b
const LIGHT_BG = rgb(248 / 255, 250 / 255, 252 / 255);       // #f8fafc
const BLUE_ACCENT = rgb(0 / 255, 113 / 255, 227 / 255);      // #0071e3
const BORDER_COLOR = rgb(226 / 255, 232 / 255, 240 / 255);   // #e2e8f0

export async function createResidentialQuotePdf(input: ResidentialQuotePdfInput): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const page = document.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);
  const font = await document.embedFont(StandardFonts.Helvetica);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);

  const margin = 56; // ~20mm
  const contentWidth = PDF_PAGE_WIDTH - margin * 2;
  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + 14);
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const quoteNumber = `EVIONOR / ${today.getFullYear()}-${randomSuffix}`;

  const netPrice = Math.round(input.grossPrice / 1.27);
  const vatAmount = input.grossPrice - netPrice;

  // ===== WHITE HEADER =====
  // Logo text (top-right, since we can't embed image easily in pdf-lib edge function)
  page.drawText("EVIONOR", {
    color: DARK_BLUE,
    font: boldFont,
    size: 18,
    x: PDF_PAGE_WIDTH - margin - boldFont.widthOfTextAtSize("EVIONOR", 18),
    y: PDF_PAGE_HEIGHT - 40,
  });

  // ===== DARK BLUE STRIPE =====
  page.drawRectangle({
    color: DARK_BLUE,
    height: 50,
    width: PDF_PAGE_WIDTH,
    x: 0,
    y: PDF_PAGE_HEIGHT - 105,
  });

  page.drawText(sanitizePdfText("Arajanlat"), {
    color: WHITE,
    font: boldFont,
    size: 22,
    x: margin,
    y: PDF_PAGE_HEIGHT - 82,
  });

  page.drawText(quoteNumber, {
    color: rgb(0.84, 0.9, 0.98),
    font,
    size: 9,
    x: margin,
    y: PDF_PAGE_HEIGHT - 98,
  });

  // ===== COMPANY & CUSTOMER INFO =====
  let y = PDF_PAGE_HEIGHT - 130;
  const colWidth = contentWidth / 2 - 14;
  const valueCol = margin + 120;

  // Left column — Issuer
  page.drawText(sanitizePdfText("ARAJANLAT KIBOCSATO"), {
    color: SLATE,
    font: boldFont,
    size: 8,
    x: margin,
    y,
  });

  y -= 16;
  page.drawText("Nordisk Inova Kft", {
    color: DARK_BLUE,
    font: boldFont,
    size: 11,
    x: margin,
    y,
  });

  y -= 14;
  page.drawText(sanitizePdfText("Varju Kalman utca 19."), {
    color: DARK_BLUE,
    font,
    size: 9,
    x: margin,
    y,
  });
  y -= 12;
  page.drawText(sanitizePdfText("1194 Budapest, Magyarorszag"), {
    color: DARK_BLUE,
    font,
    size: 9,
    x: margin,
    y,
  });

  y -= 16;
  page.drawText(sanitizePdfText("Adoszam:"), {
    color: SLATE,
    font,
    size: 8,
    x: margin,
    y,
  });
  page.drawText("32900545-2-43", {
    color: DARK_BLUE,
    font,
    size: 8,
    x: valueCol,
    y,
  });

  y -= 12;
  page.drawText(sanitizePdfText("Cegjegyzekszam:"), {
    color: SLATE,
    font,
    size: 8,
    x: margin,
    y,
  });
  page.drawText("01-09-448550", {
    color: DARK_BLUE,
    font,
    size: 8,
    x: valueCol,
    y,
  });

  y -= 12;
  page.drawText(sanitizePdfText("Kozossegi adoszam:"), {
    color: SLATE,
    font,
    size: 8,
    x: margin,
    y,
  });
  page.drawText("HU32900545", {
    color: DARK_BLUE,
    font,
    size: 8,
    x: valueCol,
    y,
  });

  y -= 16;
  page.drawText(sanitizePdfText("BANKSZAMLASZAM"), {
    color: SLATE,
    font: boldFont,
    size: 8,
    x: margin,
    y,
  });
  y -= 12;
  page.drawText("IBAN: HU25 1041 0400 0000 0190 1630 8774", {
    color: DARK_BLUE,
    font,
    size: 8,
    x: margin,
    y,
  });
  y -= 12;
  page.drawText("GIRO: 10410400-00000190-16308774", {
    color: DARK_BLUE,
    font,
    size: 8,
    x: margin,
    y,
  });
  y -= 12;
  page.drawText("Bank neve:", {
    color: SLATE,
    font,
    size: 8,
    x: margin,
    y,
  });
  page.drawText("K&H Bank", {
    color: DARK_BLUE,
    font,
    size: 8,
    x: margin + 62,
    y,
  });

  const companyBottomY = y;

  // Right column — Customer
  const rightCol = margin + colWidth + 28;
  let yRight = PDF_PAGE_HEIGHT - 130;

  page.drawText(sanitizePdfText("UGYFEL ADATAI"), {
    color: SLATE,
    font: boldFont,
    size: 8,
    x: rightCol,
    y: yRight,
  });

  yRight -= 16;
  page.drawText(sanitizePdfText(input.customerName), {
    color: DARK_BLUE,
    font: boldFont,
    size: 11,
    x: rightCol,
    y: yRight,
  });

  yRight -= 14;
  page.drawText(sanitizePdfText(input.customerEmail), {
    color: DARK_BLUE,
    font,
    size: 9,
    x: rightCol,
    y: yRight,
  });

  yRight -= 12;
  page.drawText(sanitizePdfText(input.customerPhone), {
    color: DARK_BLUE,
    font,
    size: 9,
    x: rightCol,
    y: yRight,
  });

  if (input.customerCity) {
    yRight -= 12;
    page.drawText(sanitizePdfText(`${input.customerZip || ""} ${input.customerCity}`.trim()), {
      color: DARK_BLUE,
      font,
      size: 9,
      x: rightCol,
      y: yRight,
    });
  }

  // ===== DATES BAR =====
  y = Math.min(companyBottomY, yRight) - 20;

  page.drawRectangle({
    color: LIGHT_BG,
    height: 20,
    width: contentWidth,
    x: margin,
    y: y - 4,
  });

  page.drawText(sanitizePdfText("Arajanlat datuma:"), {
    color: SLATE,
    font,
    size: 8,
    x: margin + 10,
    y: y + 4,
  });
  page.drawText(formatDate(today), {
    color: DARK_BLUE,
    font: boldFont,
    size: 8,
    x: margin + 100,
    y: y + 4,
  });

  page.drawText(sanitizePdfText("Ervenyesseg:"), {
    color: SLATE,
    font,
    size: 8,
    x: margin + 200,
    y: y + 4,
  });
  page.drawText(formatDate(validUntil), {
    color: DARK_BLUE,
    font: boldFont,
    size: 8,
    x: margin + 270,
    y: y + 4,
  });

  // ===== ITEMS TABLE =====
  y -= 30;

  // Table header
  const tableTop = y;
  const headerHeight = 22;
  page.drawRectangle({
    color: DARK_BLUE,
    height: headerHeight,
    width: contentWidth,
    x: margin,
    y: y - headerHeight,
  });

  page.drawText(sanitizePdfText("MEGNEVEZES"), {
    color: WHITE,
    font: boldFont,
    size: 8,
    x: margin + 8,
    y: y - 15,
  });
  page.drawText("MENNY.", {
    color: WHITE,
    font: boldFont,
    size: 8,
    x: margin + 230,
    y: y - 15,
  });
  page.drawText(sanitizePdfText("NETTO AR"), {
    color: WHITE,
    font: boldFont,
    size: 8,
    x: margin + 280,
    y: y - 15,
  });
  page.drawText(sanitizePdfText("AFA"), {
    color: WHITE,
    font: boldFont,
    size: 8,
    x: margin + 350,
    y: y - 15,
  });
  page.drawText(sanitizePdfText("BRUTTO AR"), {
    color: WHITE,
    font: boldFont,
    size: 8,
    x: margin + 390,
    y: y - 15,
  });

  y -= headerHeight;

  // Single row
  const rowHeight = 24;
  page.drawRectangle({
    color: LIGHT_BG,
    height: rowHeight,
    width: contentWidth,
    x: margin,
    y: y - rowHeight,
  });

  page.drawText(sanitizePdfText(`1. ${input.productName}`), {
    color: DARK_BLUE,
    font,
    size: 9,
    x: margin + 8,
    y: y - 16,
  });
  page.drawText("1 db", {
    color: DARK_BLUE,
    font,
    size: 9,
    x: margin + 230,
    y: y - 16,
  });
  page.drawText(formatHuf(netPrice), {
    color: DARK_BLUE,
    font,
    size: 9,
    x: margin + 280,
    y: y - 16,
  });
  page.drawText("27%", {
    color: DARK_BLUE,
    font,
    size: 9,
    x: margin + 350,
    y: y - 16,
  });
  page.drawText(formatHuf(input.grossPrice), {
    color: DARK_BLUE,
    font: boldFont,
    size: 9,
    x: margin + 390,
    y: y - 16,
  });

  y -= rowHeight;

  // Table border
  page.drawRectangle({
    borderColor: BORDER_COLOR,
    borderWidth: 1,
    height: headerHeight + rowHeight,
    width: contentWidth,
    x: margin,
    y,
  });

  // ===== TOTALS =====
  y -= 20;
  const totalsX = margin + contentWidth - 200;

  page.drawText(sanitizePdfText("Netto osszeg:"), {
    color: SLATE,
    font,
    size: 9,
    x: totalsX,
    y,
  });
  page.drawText(formatHuf(netPrice), {
    color: DARK_BLUE,
    font,
    size: 9,
    x: totalsX + 140,
    y,
  });

  y -= 14;
  page.drawText(sanitizePdfText("27% AFA:"), {
    color: SLATE,
    font,
    size: 9,
    x: totalsX,
    y,
  });
  page.drawText(formatHuf(vatAmount), {
    color: DARK_BLUE,
    font,
    size: 9,
    x: totalsX + 140,
    y,
  });

  y -= 20;
  // Blue total box
  page.drawRectangle({
    color: BLUE_ACCENT,
    height: 24,
    width: 210,
    x: totalsX - 5,
    y: y - 6,
  });

  page.drawText(sanitizePdfText("Brutto vegosszeg:"), {
    color: WHITE,
    font: boldFont,
    size: 10,
    x: totalsX + 4,
    y: y + 2,
  });
  page.drawText(formatHuf(input.grossPrice), {
    color: WHITE,
    font: boldFont,
    size: 10,
    x: totalsX + 140,
    y: y + 2,
  });

  // ===== PRODUCT LINK =====
  y -= 36;
  page.drawText(sanitizePdfText("Termek megtekintese:"), {
    color: BLUE_ACCENT,
    font,
    size: 8,
    x: margin,
    y,
  });
  page.drawText(sanitizePdfText(input.productUrl), {
    color: BLUE_ACCENT,
    font,
    size: 8,
    x: margin + 110,
    y,
  });

  // ===== FOOTER =====
  page.drawText(sanitizePdfText("Ez az arajanlat elektronikusan keszult es alairas nelkul ervenyes."), {
    color: SLATE,
    font,
    size: 7,
    x: margin,
    y: 52,
  });
  page.drawText("EVIONOR – Nordisk Inova Kft. | evionor.hu | info@evionor.hu", {
    color: SLATE,
    font,
    size: 7,
    x: margin,
    y: 40,
  });

  return await document.save();
}
