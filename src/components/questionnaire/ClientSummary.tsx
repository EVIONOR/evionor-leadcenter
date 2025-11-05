import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionnaireData } from "@/types/questionnaire";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ClientSummaryProps {
  data: QuestionnaireData;
}

export const ClientSummary = ({ data }: ClientSummaryProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
        <CardTitle className="text-2xl">Ügyfél összefoglaló</CardTitle>
        <CardDescription>Kitöltött kérdőív adatai</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Alapadatok */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-3">Alapadatok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Autó típus</p>
              <p className="font-medium">{data.carType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Helyszín</p>
              <p className="font-medium">{data.city} ({data.zipCode})</p>
            </div>
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
