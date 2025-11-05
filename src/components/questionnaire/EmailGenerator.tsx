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
Tisztelt Ügyfél!

Köszönjük érdeklődését töltőtelepítési szolgáltatásunk iránt.

Az Ön által megadott adatok alapján az alábbi ajánlatot készítettük:

━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÜGYFÉL ADATOK
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Jármű: ${data.customCar ? data.customCar : `${data.carBrand} ${data.carModel}`}
Helyszín: ${data.city}, ${data.zipCode}
Épület típus: ${data.buildingType.replace("_", " ")}
Elektromos rendszer: ${data.phases} fázis, ${data.amperage} A

━━━━━━━━━━━━━━━━━━━━━━━━━━━
AJÁNLOTT TÖLTŐ
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${selectedTemplate.name}
Termékek: ${selectedTemplate.products.join(", ")}

Jellemzők:
• ${data.phases} fázis
• ${data.indoorOutdoor === "kültér" ? "Kültéri" : "Beltéri"} kivitel
${data.needsApp ? "• Okostelefonos vezérlés\n" : ""}${data.loadManagement ? "• Terhelésmenedzsment\n" : ""}${data.solarIntegration !== "nem" ? "• Napelemes integráció\n" : ""}${data.builtInCable ? "• Beépített töltőkábel\n" : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
TELEPÍTÉSI SPECIFIKÁCIÓ
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Telepítési hely: ${data.installLocation}
Rögzítési felület: ${data.mountingSurface}
${data.needsBackplate ? "• Hátlap szükséges\n" : ""}${data.needsPole ? "• Oszlop szükséges\n" : ""}${data.distanceFromBox ? `• Távolság a doboztól: ${data.distanceFromBox} méter\n` : ""}${data.needsElectricalPlanning ? "• Villamos tervezés szükséges\n" : ""}${data.overvoltageProtection ? "• Túlfeszültség védelem\n" : ""}
${data.groundworkWallPenetration ? `\nFöldmunka/Faláttörés:\n${data.groundworkWallPenetration}\n` : ""}
${selectedAdditionals.length > 0 ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━
KIEGÉSZÍTŐK
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${selectedAdditionals.map(item => `• ${item}`).join("\n")}
` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOLYAMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Webshop vásárlás / ajánlat elfogadása
2. Helyszíni felmérés egyeztetése
3. Telepítés ütemezése
4. Szakszerű kivitelezés
5. Átadás és használatba vétel

${data.otherComments ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━
EGYÉB MEGJEGYZÉSEK
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.otherComments}
` : ""}

További kérdés esetén állunk rendelkezésére!

Üdvözlettel,
[Az Ön Neve]
[Cégnév]
[Elérhetőség]
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
                <p className="text-sm font-medium text-secondary-foreground">
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
