import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionnaireData } from "@/types/questionnaire";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { saveSavedQuestionnaireResponse } from "@/integrations/evionor/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClientSummaryProps {
  data: QuestionnaireData;
  originalResponseId?: string;
  autoSave?: boolean;
}

export const ClientSummary = ({ data, originalResponseId, autoSave = false }: ClientSummaryProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const responseData = {
        original_response_id: originalResponseId || null,
        contact_name: data.contactName,
        email: data.email,
        phone_number: data.phoneNumber,
        car_brand: data.carBrand,
        car_model: data.carModel,
        custom_car: data.customCar || null,
        zip_code: data.zipCode || null,
        city: data.city || null,
        phases: data.phases,
        amperage: data.amperage,
        install_location: data.installLocation,
        building_type: data.buildingType || null,
        needs_installation: data.needsInstallation,
        needs_electrical_planning: data.needsElectricalPlanning,
        indoor_outdoor: data.indoorOutdoor,
        mounting_surface: data.mountingSurface || null,
        needs_backplate: data.needsBackplate,
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

      toast({
        title: "Sikeres mentés",
        description: "A kérdőív adatok sikeresen mentésre kerültek az EVIONOR adatbázisba.",
      });
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      toast({
        title: "Mentési hiba",
        description: "Nem sikerült menteni a kérdőív adatokat. Kérjük próbálja újra.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (autoSave && !isSaving) {
      handleSave();
    }
  }, [autoSave]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Ügyfél összefoglaló</CardTitle>
            <CardDescription>Kitöltött kérdőív adatai</CardDescription>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Mentés..." : "Mentés EVIONOR-ba"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Kapcsolattartó adatok */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-3">Ügyfél</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Név</p>
              <p className="font-medium">{data.contactName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail cím</p>
              <p className="font-medium">{data.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefonszám</p>
              <p className="font-medium">{data.phoneNumber}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Alapadatok */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-3">Alapadatok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Autó</p>
              <p className="font-medium">
                {data.customCar ? data.customCar : `${data.carBrand} ${data.carModel}`}
              </p>
            </div>
            {data.city && data.zipCode && (
              <div>
                <p className="text-sm text-muted-foreground">Helyszín</p>
                <p className="font-medium">{data.city} ({data.zipCode})</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Elektromos rendszer</p>
              <p className="font-medium">{data.phases} fázis, {data.amperage} A</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Épület típus</p>
              <p className="font-medium">{data.buildingType.replace("_", " ")}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Telepítési részletek */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-3">Telepítési részletek</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Telepítési hely</p>
              <p className="font-medium">{data.installLocation}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={data.indoorOutdoor === "kültér" ? "default" : "secondary"}>
                {data.indoorOutdoor}
              </Badge>
              <Badge variant="outline">{data.mountingSurface}</Badge>
              {data.needsElectricalPlanning && <Badge>Villamos tervezés</Badge>}
              {data.needsBackplate && <Badge>Hátlap szükséges</Badge>}
              {data.needsPole && <Badge>Oszlop szükséges</Badge>}
            </div>
            {data.distanceFromBox && (
              <div>
                <p className="text-sm text-muted-foreground">Távolság a doboztól</p>
                <p className="font-medium">{data.distanceFromBox} méter</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Hely a dobozban</p>
              <p className="font-medium">{data.spaceInBox}</p>
            </div>
            {data.groundworkWallPenetration && (
              <div>
                <p className="text-sm text-muted-foreground">Földmunka és faláttörések</p>
                <p className="font-medium">{data.groundworkWallPenetration}</p>
              </div>
            )}
            {data.otherComments && (
              <div>
                <p className="text-sm text-muted-foreground">Egyéb megjegyzések</p>
                <p className="font-medium">{data.otherComments}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Töltő specifikációk */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-3">Töltő specifikációk</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {data.solarIntegration !== "nem" && (
                <Badge className="bg-secondary">
                  Napelem integráció - {data.solarIntegration}
                </Badge>
              )}
              {data.loadManagement && <Badge>Terhelésmenedzsment</Badge>}
              {data.builtInCable && <Badge>Beépített kábel</Badge>}
              {data.needsApp && <Badge>App kontroll</Badge>}
              {data.overvoltageProtection && <Badge>Túlfeszültség védelem</Badge>}
            </div>
            {data.infrastructureDevelopment && (
              <div>
                <p className="text-sm text-muted-foreground">Infrastruktúra fejlesztés</p>
                <p className="font-medium">{data.infrastructureDetails || "Igen"}</p>
              </div>
            )}
            {data.networkExpansion && (
              <div>
                <p className="text-sm text-muted-foreground">Hálózat bővítés</p>
                <p className="font-medium">
                  {data.expansionPhase} fázis, {data.expansionAmperage} A
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
