import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionnaireData, chargerTemplates, type ChargerTemplate } from "@/types/questionnaire";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Copy, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveSavedQuestionnaireResponse } from "@/integrations/evionor/client";
import { supabase } from "@/integrations/supabase/client";
import { useEVData } from "@/hooks/useEVData";
import { evionorAuth } from "@/integrations/evionor/auth-client";
import {
  DEFAULT_RESIDENTIAL_SENDER,
  getAutomaticResidentialTemplateIds,
  getRecommendedResidentialTemplateId,
  residentialAdditionalItems,
  type ResidentialOfferInput,
  type ResidentialOfferRenderResult,
} from "@/shared/residentialOffer.ts";

interface EmailGeneratorProps {
  autoGenerate?: boolean;
  data: QuestionnaireData;
}

export const EmailGenerator = ({ data, autoGenerate = false }: EmailGeneratorProps) => {
  const { getOnboardChargerKw } = useEVData();
  const onboardChargerKw =
    data.carBrand && data.carModel ? getOnboardChargerKw(data.carBrand, data.carModel) : undefined;
  const carDisplayText = data.customCar
    ? data.customCar
    : `${data.carBrand} ${data.carModel}${onboardChargerKw ? ` (${onboardChargerKw}kW fedélzeti töltő)` : ""}`;

  const [selectedTemplates, setSelectedTemplates] = useState<ChargerTemplate[]>([]);
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([]);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [senderName, setSenderName] = useState(DEFAULT_RESIDENTIAL_SENDER);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (autoGenerate && selectedTemplates.length === 0) {
      const templateIds = getAutomaticResidentialTemplateIds({
        phases: data.phases,
        solarIntegration: data.solarIntegration,
      });
      const templates = templateIds
        .map((templateId) => chargerTemplates.find((template) => template.id === templateId))
        .filter((template): template is ChargerTemplate => Boolean(template));
      setSelectedTemplates(templates);
    }
  }, [autoGenerate, data.phases, data.solarIntegration, selectedTemplates.length]);

  useEffect(() => {
    setGeneratedEmail("");
    setEmailSubject("");
  }, [selectedAdditionals, selectedTemplates, senderName]);

  const recommendedTemplate = useMemo(() => {
    const templateId = getRecommendedResidentialTemplateId({
      needsApp: data.needsApp,
      phases: data.phases,
      solarIntegration: data.solarIntegration,
    });
    return chargerTemplates.find((template) => template.id === templateId) || null;
  }, [data.needsApp, data.phases, data.solarIntegration]);

  const toggleTemplate = (template: ChargerTemplate) => {
    const exists = selectedTemplates.some((item) => item.id === template.id);
    if (exists) {
      setSelectedTemplates(selectedTemplates.filter((item) => item.id !== template.id));
      return;
    }

    setSelectedTemplates([...selectedTemplates, template]);
  };

  const generateEmail = useCallback(async () => {
    if (selectedTemplates.length === 0) return;

    setIsGenerating(true);

    try {
      try {
        const {
          data: { user },
        } = await evionorAuth.auth.getUser();

        const responseData = {
          original_response_id: null,
          contact_name: data.contactName,
          email: data.email,
          phone_number: data.phoneNumber,
          car_brand: data.carBrand,
          car_model: data.carModel,
          custom_car: data.customCar || null,
          zip_code: data.zipCode || "N/A",
          city: data.city || "Nincs megadva",
          phases: data.phases,
          amperage: data.amperage,
          install_location: data.installLocation,
          building_type: data.buildingType || null,
          needs_installation: data.needsInstallation,
          needs_electrical_planning: data.needsElectricalPlanning,
          indoor_outdoor: data.indoorOutdoor,
          mounting_surface: data.mountingSurface || null,
          needs_pole: data.needsPole,
          distance_from_box: data.distanceFromBox,
          space_in_box: data.spaceInBox,
          groundwork_wall_penetration: data.groundworkWallPenetration || null,
          other_comments: data.otherComments || null,
          solar_integration: data.solarIntegration,
          load_management: data.loadManagement,
          built_in_cable: data.builtInCable,
          needs_app: data.needsApp,
          infrastructure_development: data.infrastructureDevelopment,
          infrastructure_details: data.infrastructureDetails || null,
          overvoltage_protection: data.overvoltageProtection,
          network_expansion: data.networkExpansion,
          expansion_phase: data.expansionPhase || null,
          expansion_amperage: data.expansionAmperage || null,
          created_by: user?.id || null,
        };

        await saveSavedQuestionnaireResponse(responseData);
        toast.success("Sikeres mentés az EVIONOR-ba", {
          description: "A kérdőív adatok mentésre kerültek és az email elkészült.",
        });
      } catch (error) {
        console.error("Error saving to EVIONOR:", error);
        toast.error("Mentési hiba", {
          description: "Nem sikerült menteni az adatokat az EVIONOR-ba, de az email elkészült.",
        });
      }

      const {
        data: { session },
      } = await evionorAuth.auth.getSession();

      const offerInput: ResidentialOfferInput = {
        ...data,
        additionalItems: selectedAdditionals,
        carDisplayText,
        selectedTemplateIds: selectedTemplates.map((template) => template.id),
        senderName,
      };

      const { data: renderData, error } = await supabase.functions.invoke<ResidentialOfferRenderResult>(
        "render-residential-offer",
        {
          body: {
            access_token: session?.access_token,
            offerInput,
          },
        },
      );

      if (error || !renderData?.html || !renderData?.subject) {
        throw error || new Error("No render result returned");
      }

      setGeneratedEmail(renderData.html);
      setEmailSubject(renderData.subject);
      toast.success("Email sikeresen generálva!");
    } catch (error) {
      console.error("Error generating residential email:", error);
      toast.error("Email generálási hiba", {
        description: error instanceof Error ? error.message : "Ismeretlen hiba történt.",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [carDisplayText, data, selectedAdditionals, selectedTemplates, senderName]);

  useEffect(() => {
    if (autoGenerate && selectedTemplates.length > 0 && !generatedEmail && !isGenerating) {
      void generateEmail();
    }
  }, [autoGenerate, generateEmail, generatedEmail, isGenerating, selectedTemplates]);

  const copyToClipboard = async () => {
    try {
      const iframe = document.querySelector('iframe[title="Email előnézet"]') as HTMLIFrameElement | null;
      if (!iframe?.contentWindow) {
        throw new Error("Az email előnézet nem érhető el.");
      }

      const iframeDocument = iframe.contentWindow.document;
      const bodyContent = iframeDocument.body;
      if (!bodyContent) {
        throw new Error("Az email tartalma nem érhető el.");
      }

      const range = iframeDocument.createRange();
      range.selectNodeContents(bodyContent);

      const selection = iframe.contentWindow.getSelection();
      if (!selection) {
        throw new Error("Nem sikerült kijelölni az email tartalmát.");
      }

      selection.removeAllRanges();
      selection.addRange(range);

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([bodyContent.innerHTML], { type: "text/html" }),
            "text/plain": new Blob([bodyContent.innerText], { type: "text/plain" }),
          }),
        ]);
      } catch {
        iframe.contentWindow.document.execCommand("copy");
      }

      toast.success("Email kijelölve és vágólapra másolva!");
    } catch (error) {
      console.error("Másolási hiba:", error);
      toast.error("Hiba történt a másolás során. Próbálja újra!");
    }
  };

  const sendEmail = async () => {
    if (!generatedEmail || !data.email) {
      toast.error("Hiba: Az email generálása vagy a címzett email címe hiányzik.");
      return;
    }

    setIsSending(true);

    try {
      const {
        data: { session },
      } = await evionorAuth.auth.getSession();

      const { data: emailData, error } = await supabase.functions.invoke("send-email", {
        body: {
          access_token: session?.access_token,
          from: `${senderName} - EVIONOR <hello@notifications.evionor.hu>`,
          html: generatedEmail,
          subject: emailSubject,
          to: data.email,
        },
      });

      if (error) throw error;

      if (emailData?.success) {
        toast.success(`Email sikeresen elküldve ${data.email} címre!`);
      } else {
        throw new Error(emailData?.error || "Ismeretlen hiba");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Email küldési hiba. Ellenőrizd a RESEND_API_KEY beállítását.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Email generátor</CardTitle>
              <CardDescription className="mt-1">
                Válasszon töltőket és kiegészítőket az ajánlathoz
              </CardDescription>
            </div>
            {generatedEmail && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(emailSubject);
                    toast.success("Email tárgy vágólapra másolva!");
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Tárgy másolása
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Email másolása
                </Button>
                <Button size="sm" onClick={sendEmail} disabled={isSending || !generatedEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  {isSending ? "Küldés..." : "Email küldése"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Ajánlatküldő neve</h3>
            <Select value={senderName} onValueChange={setSenderName}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Válasszon ajánlatküldőt" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="Horváth Gáspár">Horváth Gáspár</SelectItem>
                <SelectItem value="Kovács Attila Tibor - EV-töltés szakértő">
                  Kovács Attila Tibor - EV-töltés szakértő
                </SelectItem>
                <SelectItem value="Kocsis Zsombor - EV-töltés szakértő">
                  Kocsis Zsombor - EV-töltés szakértő
                </SelectItem>
                <SelectItem value="Nagy István">Nagy István</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Válasszon töltőket (több is kiválasztható)</h3>
            {recommendedTemplate && (
              <div className="mb-3 p-3 bg-secondary/20 rounded-lg border border-secondary">
                <p className="text-sm font-medium text-foreground">⭐ Ajánlott: {recommendedTemplate.name}</p>
              </div>
            )}

            {selectedTemplates.length > 0 && (
              <div className="mb-3 p-3 bg-primary/10 rounded-lg border border-primary">
                <p className="text-sm font-medium text-foreground mb-2">
                  Kiválasztott töltők ({selectedTemplates.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{template.name}</span>
                      <button
                        onClick={() => toggleTemplate(template)}
                        className="hover:bg-primary/30 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {chargerTemplates.map((template) => {
                const isSelected = selectedTemplates.some((item) => item.id === template.id);
                return (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{template.products.join(", ")}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Kiegészítő javaslatok</h3>
            <div className="space-y-3">
              {residentialAdditionalItems.map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    id={item}
                    checked={selectedAdditionals.includes(item)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAdditionals([...selectedAdditionals, item]);
                        return;
                      }

                      setSelectedAdditionals(selectedAdditionals.filter((selectedItem) => selectedItem !== item));
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

          <Button onClick={generateEmail} disabled={selectedTemplates.length === 0 || isGenerating} size="lg" className="w-full">
            <Mail className="mr-2 h-4 w-4" />
            {isGenerating ? "Email generálása..." : "Email generálása"}
          </Button>
        </CardContent>
      </Card>

      {emailSubject && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
            <CardTitle className="text-xl">Email tárgy</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{emailSubject}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(emailSubject);
                  toast.success("Email tárgy vágólapra másolva!");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedEmail && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-secondary/5 to-primary/5 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Generált email előnézet</CardTitle>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Email másolása
              </Button>
            </div>
            <CardDescription className="mt-2">
              Az alábbi előnézet mutatja, hogy néz majd ki az email. Az "Email másolása" gombbal kijelölöd és
              vágólapra másolod a teljes emailt, amit be tudsz illeszteni Gmail-be vagy bármilyen email kliensbe.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <iframe
              srcDoc={generatedEmail}
              className="w-full border rounded-lg"
              style={{ minHeight: "800px" }}
              title="Email előnézet"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
