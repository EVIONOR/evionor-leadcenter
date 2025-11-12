import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { QuestionnaireData } from "@/types/questionnaire";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { InstallationSection } from "./sections/InstallationSection";
import { ChargerSpecsSection } from "./sections/ChargerSpecsSection";
import { ClientSummary } from "./ClientSummary";
import { EmailGenerator } from "./EmailGenerator";
import { ArrowRight, ArrowLeft, TestTube } from "lucide-react";

const formSchema = z.object({
  contactName: z.string().trim().min(1, "Kötelező mező").max(100, "Maximum 100 karakter"),
  email: z.string().trim().email("Érvényes email cím szükséges").max(255, "Maximum 255 karakter"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Kötelező mező")
    .regex(/^[\d\s+()-]+$/, "Érvényes telefonszám formátum szükséges"),
  carBrand: z.string().min(1, "Kötelező mező"),
  carModel: z.string().min(1, "Kötelező mező"),
  customCar: z.string().optional(),
  zipCode: z.string().min(4, "Érvényes irányítószám szükséges").max(4),
  city: z.string().min(1, "A város automatikusan kitöltődik"),
  phases: z.enum(["1", "3"]),
  amperage: z.string().min(1, "Kötelező mező"),
  installLocation: z.string().min(1, "Kötelező mező"),
  buildingType: z.enum(["családi_ház", "társas_ház", "sorház", ""]),
  needsInstallation: z.boolean(),
  needsElectricalPlanning: z.boolean(),
  indoorOutdoor: z.enum(["kültér", "beltér"]),
  mountingSurface: z.enum(["beton", "fa", "tégla", ""]),
  needsBackplate: z.boolean(),
  needsPole: z.boolean(),
  distanceFromBox: z.string(),
  spaceInBox: z.enum(["igen", "nem", "nemtudom"]),
  groundworkWallPenetration: z.string(),
  otherComments: z.string(),
  solarIntegration: z.enum(["nem", "1fázis", "3fázis"]),
  loadManagement: z.boolean(),
  builtInCable: z.boolean(),
  needsApp: z.boolean(),
  infrastructureDevelopment: z.boolean(),
  infrastructureDetails: z.string(),
  overvoltageProtection: z.boolean(),
  networkExpansion: z.boolean(),
  expansionPhase: z.string(),
  expansionAmperage: z.string(),
});

export const QuestionnaireForm = () => {
  const [step, setStep] = useState<"form" | "summary" | "email">("form");
  const [formData, setFormData] = useState<QuestionnaireData | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const [hasPrefillData, setHasPrefillData] = useState(false);

  const form = useForm<QuestionnaireData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactName: "",
      email: "",
      phoneNumber: "",
      carBrand: "",
      carModel: "",
      customCar: "",
      zipCode: "",
      city: "",
      phases: "1",
      amperage: "",
      installLocation: "",
      buildingType: "",
      needsInstallation: true,
      needsElectricalPlanning: false,
      indoorOutdoor: "kültér",
      mountingSurface: "",
      needsBackplate: false,
      needsPole: false,
      distanceFromBox: "",
      spaceInBox: "nemtudom",
      groundworkWallPenetration: "",
      otherComments: "",
      solarIntegration: "nem",
      loadManagement: false,
      builtInCable: false,
      needsApp: false,
      infrastructureDevelopment: false,
      infrastructureDetails: "",
      overvoltageProtection: false,
      networkExpansion: false,
      expansionPhase: "",
      expansionAmperage: "",
    },
  });

  useEffect(() => {
    const prefillData = localStorage.getItem("prefill_lead_data");
    console.log(prefillData);
    if (prefillData) {
      try {
        const leadData = JSON.parse(prefillData);
        Object.keys(leadData).forEach((key) => {
          if (leadData[key]) {
            form.setValue(key as keyof QuestionnaireData, leadData[key]);
          }
        });
        setHasPrefillData(true);
        localStorage.removeItem("prefill_lead_data");
      } catch (error) {
        console.error("Error loading prefill data:", error);
      }
    }
  }, [form]);

  const loadTestData = () => {
    const testData: QuestionnaireData = {
      contactName: "Teszt Felhasználó",
      email: "teszt@example.com",
      phoneNumber: "+36 20 123 4567",
      carBrand: "Tesla",
      carModel: "Model 3",
      customCar: "",
      zipCode: "1011",
      city: "Budapest",
      phases: "3",
      amperage: "32",
      installLocation: "Garázs",
      buildingType: "családi_ház",
      needsInstallation: true,
      needsElectricalPlanning: false,
      indoorOutdoor: "beltér",
      mountingSurface: "beton",
      needsBackplate: false,
      needsPole: false,
      distanceFromBox: "5",
      spaceInBox: "igen",
      groundworkWallPenetration: "",
      otherComments: "Teszt megjegyzés",
      solarIntegration: "nem",
      loadManagement: true,
      builtInCable: true,
      needsApp: true,
      infrastructureDevelopment: false,
      infrastructureDetails: "",
      overvoltageProtection: true,
      networkExpansion: false,
      expansionPhase: "",
      expansionAmperage: "",
    };

    Object.keys(testData).forEach((key) => {
      form.setValue(key as keyof QuestionnaireData, testData[key as keyof QuestionnaireData]);
    });
  };

  const loadAutofillData = () => {
    // Get current form values (from the prefilled lead)
    const currentValues = form.getValues();
    
    // Default values to fill in missing fields
    const defaultAutofillData = {
      amperage: "32",
      installLocation: "Garázs",
      needsInstallation: true,
      needsElectricalPlanning: false,
      indoorOutdoor: "beltér",
      needsBackplate: false,
      needsPole: false,
      distanceFromBox: "10",
      spaceInBox: "nemtudom",
      groundworkWallPenetration: "",
      solarIntegration: "nem",
      loadManagement: false,
      builtInCable: false,
      needsApp: true,
      infrastructureDevelopment: false,
      infrastructureDetails: "",
      overvoltageProtection: false,
      networkExpansion: false,
      expansionPhase: "",
      expansionAmperage: "",
    };

    // Only fill in fields that are empty or have default values
    Object.keys(defaultAutofillData).forEach((key) => {
      const currentValue = currentValues[key as keyof QuestionnaireData];
      // Only set if current value is empty, undefined, or is a default empty value
      if (!currentValue || currentValue === "" || currentValue === "nemtudom") {
        form.setValue(key as keyof QuestionnaireData, defaultAutofillData[key as keyof typeof defaultAutofillData]);
      }
    });

    setAutoMode(true);
    setTimeout(() => {
      form.handleSubmit(onSubmit)();
    }, 100);
  };

  const onSubmit = (data: QuestionnaireData) => {
    setFormData(data);
    setStep("summary");
  };

  if (step === "summary" && formData) {
    if (autoMode) {
      setTimeout(() => {
        setStep("email");
      }, 500);
    }
    
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <ClientSummary data={formData} />
        <div className="flex gap-4 mt-6">
          <Button variant="outline" onClick={() => {
            setStep("form");
            setAutoMode(false);
          }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Vissza az űrlaphoz
          </Button>
          <Button onClick={() => setStep("email")}>
            Email generátor
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === "email" && formData) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <EmailGenerator data={formData} autoGenerate={autoMode} />
        <div className="flex gap-4 mt-6">
          <Button variant="outline" onClick={() => {
            setStep("summary");
            setAutoMode(false);
          }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Vissza az összefoglalóhoz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader className="space-y-1 bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold">Töltőtelepítés Kérdőív</CardTitle>
              <CardDescription className="text-base">
                Kérjük, töltse ki az alábbi kérdőívet, hogy pontos ajánlatot készíthessünk az Ön számára.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadTestData}
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                Teszt adatok
              </Button>
              {hasPrefillData && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={loadAutofillData}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Autofill
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <BasicInfoSection form={form} />
              <InstallationSection form={form} />
              <ChargerSpecsSection form={form} />

              <div className="flex justify-end pt-6 border-t">
                <Button type="submit" size="lg" className="min-w-[200px]">
                  Összefoglaló megtekintése
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
