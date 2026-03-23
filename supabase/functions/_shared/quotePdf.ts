import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { EVIONOR_LOGO_JPEG_B64 } from "./logoData.ts";

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

/**
 * WinAnsiEncoding (used by StandardFonts) supports á, é, í, ó, ö, ú, ü
 * but NOT ő and ű — so we only replace those two.
 */
function sanitizePdfText(value: string): string {
  return value
    .replaceAll("ő", "ö")
    .replaceAll("Ő", "Ö")
    .replaceAll("ű", "ü")
    .replaceAll("Ű", "Ü");
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

function base64ToUint8Array(b64: string): Uint8Array {
  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

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

  // ===== WHITE HEADER WITH LOGO =====
  try {
    const logoBytes = base64ToUint8Array(EVIONOR_LOGO_JPEG_B64);
    const logoImage = await document.embedJpg(logoBytes);
    const logoDims = logoImage.scale(1);
    const logoTargetH = 30;
    const logoTargetW = (logoDims.width / logoDims.height) * logoTargetH;
    page.drawImage(logoImage, {
      x: PDF_PAGE_WIDTH - margin - logoTargetW,
      y: PDF_PAGE_HEIGHT - 50,
      width: logoTargetW,
      height: logoTargetH,
    });
  } catch (_e) {
    // Fallback to text if logo embedding fails
    page.drawText("EVIONOR", {
      color: DARK_BLUE,
      font: boldFont,
      size: 18,
      x: PDF_PAGE_WIDTH - margin - boldFont.widthOfTextAtSize("EVIONOR", 18),
      y: PDF_PAGE_HEIGHT - 40,
    });
  }

  // ===== DARK BLUE STRIPE =====
  page.drawRectangle({
    color: DARK_BLUE,
    height: 50,
    width: PDF_PAGE_WIDTH,
    x: 0,
    y: PDF_PAGE_HEIGHT - 105,
  });

  page.drawText(sanitizePdfText("Árajánlat"), {
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
  page.drawText(sanitizePdfText("ÁRAJÁNLAT KIBOCSÁTÓ"), {
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
  page.drawText(sanitizePdfText("Varjú Kálmán utca 19."), {
    color: DARK_BLUE,
    font,
    size: 9,
    x: margin,
    y,
  });
  y -= 12;
  page.drawText(sanitizePdfText("1194 Budapest, Magyarország"), {
    color: DARK_BLUE,
    font,
    size: 9,
    x: margin,
    y,
  });

  y -= 16;
  page.drawText(sanitizePdfText("Adószám:"), {
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
  page.drawText(sanitizePdfText("Cégjegyzékszám:"), {
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
  page.drawText(sanitizePdfText("Közösségi adószám:"), {
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
  page.drawText(sanitizePdfText("BANKSZÁMLASZÁM"), {
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

  page.drawText(sanitizePdfText("ÜGYFÉL ADATAI"), {
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

  page.drawText(sanitizePdfText("Árajánlat dátuma:"), {
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

  page.drawText(sanitizePdfText("Érvényesség:"), {
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
  const headerHeight = 22;
  page.drawRectangle({
    color: DARK_BLUE,
    height: headerHeight,
    width: contentWidth,
    x: margin,
    y: y - headerHeight,
  });

  page.drawText(sanitizePdfText("MEGNEVEZÉS"), {
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
  page.drawText(sanitizePdfText("NETTÓ ÁR"), {
    color: WHITE,
    font: boldFont,
    size: 8,
    x: margin + 280,
    y: y - 15,
  });
  page.drawText(sanitizePdfText("ÁFA"), {
    color: WHITE,
    font: boldFont,
    size: 8,
    x: margin + 350,
    y: y - 15,
  });
  page.drawText(sanitizePdfText("BRUTTÓ ÁR"), {
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

  // ===== TOTALS (spacious) =====
  y -= 28;
  const totalsX = margin + contentWidth - 200;

  page.drawText(sanitizePdfText("Nettó összeg:"), {
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

  y -= 18;
  page.drawText(sanitizePdfText("27% ÁFA:"), {
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

  // Separator line
  y -= 12;
  page.drawLine({
    start: { x: totalsX, y },
    end: { x: totalsX + 200, y },
    color: BORDER_COLOR,
    thickness: 1,
  });

  y -= 18;
  // Blue total box
  page.drawRectangle({
    color: BLUE_ACCENT,
    height: 28,
    width: 210,
    x: totalsX - 5,
    y: y - 8,
  });

  page.drawText(sanitizePdfText("Bruttó végösszeg:"), {
    color: WHITE,
    font: boldFont,
    size: 11,
    x: totalsX + 4,
    y: y + 2,
  });
  page.drawText(formatHuf(input.grossPrice), {
    color: WHITE,
    font: boldFont,
    size: 11,
    x: totalsX + 140,
    y: y + 2,
  });

  // ===== PRODUCT LINK =====
  y -= 44;
  page.drawText(sanitizePdfText("Termék megtekintése:"), {
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
  page.drawText(sanitizePdfText("Ez az árajánlat elektronikusan készült és aláírás nélkül érvényes."), {
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
