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
  return new Intl.NumberFormat("hu-HU", {
    currency: "HUF",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  }).format(price);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}.`;
}

export async function createResidentialQuotePdf(input: ResidentialQuotePdfInput): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const page = document.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);
  const font = await document.embedFont(StandardFonts.Helvetica);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + 14);
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const quoteNumber = `EVIONOR/${today.getFullYear()}-${randomSuffix}`;

  page.drawRectangle({
    color: rgb(0.04, 0.145, 0.251),
    height: 90,
    width: PDF_PAGE_WIDTH,
    x: 0,
    y: PDF_PAGE_HEIGHT - 90,
  });

  page.drawText("EVIONOR", {
    color: rgb(1, 1, 1),
    font: boldFont,
    size: 28,
    x: margin,
    y: PDF_PAGE_HEIGHT - 54,
  });

  page.drawText("Residential EV charger quote", {
    color: rgb(0.84, 0.9, 0.98),
    font,
    size: 12,
    x: margin,
    y: PDF_PAGE_HEIGHT - 74,
  });

  page.drawText("Quote", {
    color: rgb(0.04, 0.145, 0.251),
    font: boldFont,
    size: 24,
    x: margin,
    y: PDF_PAGE_HEIGHT - 136,
  });

  page.drawText(quoteNumber, {
    color: rgb(0.39, 0.45, 0.52),
    font,
    size: 11,
    x: margin,
    y: PDF_PAGE_HEIGHT - 156,
  });

  page.drawText(`Date: ${formatDate(today)}`, {
    color: rgb(0.11, 0.15, 0.22),
    font,
    size: 11,
    x: margin,
    y: PDF_PAGE_HEIGHT - 188,
  });

  page.drawText(`Valid until: ${formatDate(validUntil)}`, {
    color: rgb(0.11, 0.15, 0.22),
    font,
    size: 11,
    x: margin + 180,
    y: PDF_PAGE_HEIGHT - 188,
  });

  page.drawText("Issuer", {
    color: rgb(0.39, 0.45, 0.52),
    font: boldFont,
    size: 10,
    x: margin,
    y: PDF_PAGE_HEIGHT - 226,
  });

  page.drawText("Nordisk Inova Kft", {
    color: rgb(0.04, 0.145, 0.251),
    font: boldFont,
    size: 12,
    x: margin,
    y: PDF_PAGE_HEIGHT - 244,
  });

  page.drawText("1194 Budapest, Varju Kalman utca 19.", {
    color: rgb(0.11, 0.15, 0.22),
    font,
    size: 10,
    x: margin,
    y: PDF_PAGE_HEIGHT - 260,
  });

  page.drawText("Customer", {
    color: rgb(0.39, 0.45, 0.52),
    font: boldFont,
    size: 10,
    x: margin + 280,
    y: PDF_PAGE_HEIGHT - 226,
  });

  const customerLines = [
    sanitizePdfText(input.customerName),
    sanitizePdfText(input.customerEmail),
    sanitizePdfText(input.customerPhone),
    input.customerCity ? sanitizePdfText(`${input.customerZip || ""} ${input.customerCity}`.trim()) : "",
  ].filter((line) => line.length > 0);

  customerLines.forEach((line, index) => {
    page.drawText(line, {
      color: rgb(0.04, 0.145, 0.251),
      font: index === 0 ? boldFont : font,
      size: index === 0 ? 12 : 10,
      x: margin + 280,
      y: PDF_PAGE_HEIGHT - 244 - index * 16,
    });
  });

  page.drawRectangle({
    borderColor: rgb(0.79, 0.85, 0.9),
    borderWidth: 1,
    color: rgb(0.97, 0.98, 0.99),
    height: 174,
    width: PDF_PAGE_WIDTH - margin * 2,
    x: margin,
    y: PDF_PAGE_HEIGHT - 500,
  });

  page.drawText("Offer details", {
    color: rgb(0.04, 0.145, 0.251),
    font: boldFont,
    size: 13,
    x: margin + 20,
    y: PDF_PAGE_HEIGHT - 528,
  });

  page.drawText("Item", {
    color: rgb(0.39, 0.45, 0.52),
    font: boldFont,
    size: 10,
    x: margin + 20,
    y: PDF_PAGE_HEIGHT - 560,
  });

  page.drawText("Gross price", {
    color: rgb(0.39, 0.45, 0.52),
    font: boldFont,
    size: 10,
    x: margin + 320,
    y: PDF_PAGE_HEIGHT - 560,
  });

  page.drawText(sanitizePdfText(input.productName), {
    color: rgb(0.11, 0.15, 0.22),
    font: boldFont,
    size: 12,
    x: margin + 20,
    y: PDF_PAGE_HEIGHT - 584,
  });

  page.drawText(formatHuf(input.grossPrice), {
    color: rgb(0, 0.44, 0.89),
    font: boldFont,
    size: 12,
    x: margin + 320,
    y: PDF_PAGE_HEIGHT - 584,
  });

  page.drawText("Product link", {
    color: rgb(0.39, 0.45, 0.52),
    font: boldFont,
    size: 10,
    x: margin + 20,
    y: PDF_PAGE_HEIGHT - 620,
  });

  page.drawText(sanitizePdfText(input.productUrl), {
    color: rgb(0, 0.44, 0.89),
    font,
    size: 9,
    x: margin + 20,
    y: PDF_PAGE_HEIGHT - 638,
  });

  page.drawText("This quote was generated automatically from the EVIONOR lead center.", {
    color: rgb(0.39, 0.45, 0.52),
    font,
    size: 9,
    x: margin,
    y: 64,
  });

  return await document.save();
}
