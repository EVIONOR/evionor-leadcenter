import { useState } from "react";
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
import { ArrowRight, ArrowLeft } from "lucide-react";

const formSchema = z.object({
  carBrand: z.string().min(1, "Kötelező mező"),
  carModel: z.string().min(1, "Kötelező mező"),
  zipCode: z.string().min(4, "Érvényes irányítószám szükséges").max(4),
  city: z.string().min(1, "A város automatikusan kitöltődik"),
  phases: z.enum(["1", "3"]),
  amperage: z.string().min(1, "Kötelező mező"),
  installLocation: z.string().min(1, "Kötelező mező"),
  buildingType: z.enum(["családi_ház", "társas_ház", "sorház", ""]),
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

  const form = useForm<QuestionnaireData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carBrand: "",
      carModel: "",
      zipCode: "",
      city: "",
      phases: "1",
      amperage: "",
      installLocation: "",
      buildingType: "",
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

  const onSubmit = (data: QuestionnaireData) => {
    setFormData(data);
    setStep("summary");
  };

  if (step === "summary" && formData) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <ClientSummary data={formData} />
        <div className="flex gap-4 mt-6">
          <Button variant="outline" onClick={() => setStep("form")}>
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
        <EmailGenerator data={formData} />
        <div className="flex gap-4 mt-6">
          <Button variant="outline" onClick={() => setStep("summary")}>
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
          <CardTitle className="text-3xl font-bold">Töltőtelepítés Kérdőív</CardTitle>
          <CardDescription className="text-base">
            Kérjük, töltse ki az alábbi kérdőívet, hogy pontos ajánlatot készíthessünk az Ön számára.
          </CardDescription>
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
