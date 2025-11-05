import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionnaireData, chargerTemplates, ChargerTemplate } from "@/types/questionnaire";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Copy, Mail } from "lucide-react";
import { toast } from "sonner";

interface EmailGeneratorProps {
  data: QuestionnaireData;
}

const additionalItems = [
  "RFID Tag",
  "Terhelésmenedzsment rendszer",
  "Extra kábel (5m/10m)",
  "Töltő védődoboz",
  "Kábeltartó",
];

export const EmailGenerator = ({ data }: EmailGeneratorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ChargerTemplate | null>(null);
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([]);
  const [generatedEmail, setGeneratedEmail] = useState("");

  // Intelligens sablon ajánlás
  const recommendedTemplate = chargerTemplates.find(template => {
    if (data.solarIntegration !== "nem") return template.id === "template4";
    if (data.phases === "3") return template.id === "template3";
    if (data.needsApp) return template.id === "template1";
    return template.id === "template2";
  });

  const generateEmail = () => {
    if (!selectedTemplate) return;

    const email = `
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Töltő Telepítési Ajánlat</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Töltő Telepítési Ajánlat</h1>
            <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 15px;">Személyre szabott megoldás az Ön igényeihez</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 32px;">
            
            <!-- Intro -->
            <p style="margin: 0 0 32px 0; color: #374151; font-size: 15px; line-height: 1.6;">Tisztelt Ügyfél,</p>
            <p style="margin: 0 0 40px 0; color: #374151; font-size: 15px; line-height: 1.6;">Köszönjük érdeklődését! Az Ön által megadott adatok alapján az alábbi ajánlatot készítettük.</p>

            <!-- Client Data Section -->
            <div style="margin-bottom: 40px;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">Ügyfél adatok</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 40%;">Jármű</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.customCar ? data.customCar : `${data.carBrand} ${data.carModel}`}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Helyszín</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.city}, ${data.zipCode}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Épület típus</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.buildingType.replace("_", " ")}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Elektromos rendszer</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.phases} fázis, ${data.amperage} A</td>
                    </tr>
                </table>
            </div>

            <!-- Charger Section -->
            <div style="margin-bottom: 40px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%); padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">Ajánlott töltő</h2>
                <h3 style="margin: 0 0 8px 0; color: #667eea; font-size: 20px; font-weight: 600;">${selectedTemplate.name}</h3>
                <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">${selectedTemplate.products.join(", ")}</p>
                
                <div style="margin-top: 20px;">
                    <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">Jellemzők:</p>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                        <li>${data.phases} fázis</li>
                        <li>${data.indoorOutdoor === "kültér" ? "Kültéri" : "Beltéri"} kivitel</li>
                        ${data.needsApp ? "<li>Okostelefonos vezérlés</li>" : ""}
                        ${data.loadManagement ? "<li>Terhelésmenedzsment</li>" : ""}
                        ${data.solarIntegration !== "nem" ? "<li>Napelemes integráció</li>" : ""}
                        ${data.builtInCable ? "<li>Beépített töltőkábel</li>" : ""}
                    </ul>
                </div>
            </div>

            <!-- Installation Section -->
            <div style="margin-bottom: 40px;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">Telepítési specifikáció</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 40%;">Telepítési hely</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.installLocation}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Rögzítési felület</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.mountingSurface}</td>
                    </tr>
                </table>
                
                ${data.needsBackplate || data.needsPole || data.distanceFromBox || data.needsElectricalPlanning || data.overvoltageProtection ? `
                <div style="margin-top: 20px; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">További követelmények:</p>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                        ${data.needsBackplate ? "<li>Hátlap szükséges</li>" : ""}
                        ${data.needsPole ? "<li>Oszlop szükséges</li>" : ""}
                        ${data.distanceFromBox ? `<li>Távolság a doboztól: ${data.distanceFromBox} méter</li>` : ""}
                        ${data.needsElectricalPlanning ? "<li>Villamos tervezés szükséges</li>" : ""}
                        ${data.overvoltageProtection ? "<li>Túlfeszültség védelem</li>" : ""}
                    </ul>
                </div>
                ` : ""}
                
                ${data.groundworkWallPenetration ? `
                <div style="margin-top: 20px; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">Földmunka/Faláttörés:</p>
                    <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">${data.groundworkWallPenetration}</p>
                </div>
                ` : ""}
            </div>

            ${selectedAdditionals.length > 0 ? `
            <!-- Accessories Section -->
            <div style="margin-bottom: 40px;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">Kiegészítők</h2>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                    ${selectedAdditionals.map(item => `<li>${item}</li>`).join("")}
                </ul>
            </div>
            ` : ""}

            <!-- Process Section -->
            <div style="margin-bottom: 40px; background-color: #f9fafb; padding: 24px; border-radius: 12px;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600;">Folyamat</h2>
                <ol style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 2;">
                    <li>Webshop vásárlás / ajánlat elfogadása</li>
                    <li>Helyszíni felmérés egyeztetése</li>
                    <li>Telepítés ütemezése</li>
                    <li>Szakszerű kivitelezés</li>
                    <li>Átadás és használatba vétel</li>
                </ol>
            </div>

            ${data.otherComments ? `
            <!-- Other Comments -->
            <div style="margin-bottom: 40px; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <h2 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">Egyéb megjegyzések</h2>
                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">${data.otherComments}</p>
            </div>
            ` : ""}

            <!-- Closing -->
            <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">További kérdés esetén állunk rendelkezésére!</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Üdvözlettel,</p>
                <p style="margin: 8px 0 0 0; color: #111827; font-size: 14px; font-weight: 600;">[Az Ön Neve]</p>
                <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">[Cégnév]</p>
                <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">[Elérhetőség]</p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #9ca3af; font-size: 13px;">© 2024 [Cégnév]. Minden jog fenntartva.</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    setGeneratedEmail(email);
    toast.success("Email sikeresen generálva!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    toast.success("Email vágólapra másolva!");
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
          <CardTitle className="text-2xl">Email generátor</CardTitle>
          <CardDescription>Válasszon sablont és kiegészítőket az ajánlathoz</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Sablon választás */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Válasszon töltő sablont</h3>
            {recommendedTemplate && (
              <div className="mb-3 p-3 bg-secondary/20 rounded-lg border border-secondary">
                <p className="text-sm font-medium text-foreground">
                  ⭐ Ajánlott: {recommendedTemplate.name}
                </p>
              </div>
            )}
            <div className="space-y-2">
              {chargerTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.products.join(", ")}
                      </p>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Kiegészítők */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Kiegészítő javaslatok</h3>
            <div className="space-y-3">
              {additionalItems.map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    id={item}
                    checked={selectedAdditionals.includes(item)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAdditionals([...selectedAdditionals, item]);
                      } else {
                        setSelectedAdditionals(selectedAdditionals.filter((i) => i !== item));
                      }
                    }}
                  />
                  <Label htmlFor={item} className="cursor-pointer">
                    {item}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Generate gomb */}
          <Button
            onClick={generateEmail}
            disabled={!selectedTemplate}
            size="lg"
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            Email generálása
          </Button>
        </CardContent>
      </Card>

      {/* Generált email */}
      {generatedEmail && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-secondary/5 to-primary/5 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Generált email</CardTitle>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Másolás
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
              {generatedEmail}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
