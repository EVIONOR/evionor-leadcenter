import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { evionorAuth } from "@/integrations/evionor/auth-client";
import type { B2BQuestionnaireResponse } from "@/integrations/evionor/types";
import type { B2BQualificationInsert } from "@/types/b2b";
import { B2BEmailGenerator } from "./B2BEmailGenerator";
import { getCityByZip } from "@/data/hungarianCitiesComplete";
import { useEVData } from "@/hooks/useEVData";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
  ArrowLeft,
  Building2,
  User,
  Loader2,
  Save,
  Zap,
  Car,
} from "lucide-react";

interface B2BQualifyFormProps {
  lead: B2BQuestionnaireResponse;
  onBack: () => void;
  onSaved: () => void;
}

export function B2BQualifyForm({ lead, onBack, onSaved }: B2BQualifyFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const { brands, getModelsByBrand, isLoading: evLoading } = useEVData();

  const [form, setForm] = useState<B2BQualificationInsert>({
    source_b2b_id: lead.id,
    company_name: lead.company_name || "",
    contact_name: lead.name || "",
    phone: lead.phone || "",
    zip_code: "",
    city: "",
    address: "",
    email: lead.email || "",
    project_type: "",
    location_type: "",
    charger_count: lead.charging_stations || 0,
    urgency: "",
    has_own_electrician: null,
    qualification_branch: null,
    car_types: "",
    ev_type: "",
    phases: lead.phases || "",
    main_fuse: "",
    needs_load_management: false,
    has_solar: false,
    has_wifi: false,
    has_wifi_at_panel: false,
    cable_or_socket: "",
    features_needed: [],
    offer_sent: false,
    discount_applied: false,
    has_electrical_prep: null,
    wants_photos: null,
    photos_received: false,
    needs_technical_callback: false,
    distance_from_panel: "",
    lead_temperature: "warm",
    next_step: "",
    notes: "",
    status: "new",
    timeline: lead.timeline || "",
  });

  // Car brand/model state
  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const availableModels = carBrand ? getModelsByBrand(carBrand) : [];

  const updateField = <K extends keyof B2BQualificationInsert>(
    key: K,
    value: B2BQualificationInsert[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleZipChange = (value: string) => {
    updateField("zip_code", value);
    const city = getCityByZip(value);
    if (city) {
      updateField("city", city);
    } else if (value.length === 4) {
      updateField("city", "");
    }
  };

  const handleCarBrandChange = (brand: string) => {
    setCarBrand(brand);
    setCarModel("");
    // Update car_types field with selection
    updateField("car_types", brand === "Egyéb" ? form.car_types || "" : brand);
  };

  const handleCarModelChange = (model: string) => {
    setCarModel(model);
    const fullCar = `${carBrand} ${model}`;
    updateField("car_types", model === "Egyéb modell" ? form.car_types || "" : fullCar);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await evionorAuth.auth.getSession();
      const { data, error } = await supabase.functions.invoke("manage-qualifications", {
        body: { action: "upsert", access_token: session?.access_token, data: form }
      });
      if (error) throw error;

      toast({ title: "Mentve", description: "Kvalifikáció sikeresen mentve" });
      onSaved();
    } catch (error) {
      console.error("Error saving qualification:", error);
      toast({
        title: "Hiba",
        description: "Nem sikerült menteni a kvalifikációt",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const zipCity = form.zip_code ? getCityByZip(form.zip_code) : null;
  const isCityDisabled = !!zipCity;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">B2B Kvalifikáció</h2>
          <p className="text-xs text-muted-foreground">
            {lead.company_name || lead.name} — {lead.email}
          </p>
        </div>
      </div>

      {/* Section 1: Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            1. Kapcsolatfelvétel
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Cégnév</Label>
            <Input
              value={form.company_name || ""}
              onChange={(e) => updateField("company_name", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Kapcsolattartó</Label>
            <Input
              value={form.contact_name || ""}
              onChange={(e) => updateField("contact_name", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Telefon</Label>
            <Input
              value={form.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input
              value={form.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Irányítószám</Label>
            <Input
              value={form.zip_code || ""}
              onChange={(e) => handleZipChange(e.target.value)}
              className="h-9 text-sm"
              placeholder="pl. 1052"
              maxLength={4}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Város</Label>
            <Input
              value={form.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
              className={`h-9 text-sm ${isCityDisabled ? "bg-muted" : ""}`}
              disabled={isCityDisabled}
              placeholder={isCityDisabled ? "" : "pl. Budapest"}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs">Cím</Label>
            <Input
              value={form.address || ""}
              onChange={(e) => updateField("address", e.target.value)}
              className="h-9 text-sm"
              placeholder="pl. Kossuth Lajos utca 1."
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Project details - simplified */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            2. Projekt adatok
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Helyszín típusa</Label>
              <Select value={form.location_type || ""} onValueChange={(v) => updateField("location_type", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Válassz..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="family_house">Családi ház</SelectItem>
                  <SelectItem value="parking_garage">Parkolóház</SelectItem>
                  <SelectItem value="outdoor_parking">Kültéri parkoló</SelectItem>
                  <SelectItem value="office">Iroda</SelectItem>
                  <SelectItem value="factory">Gyár/Üzem</SelectItem>
                  <SelectItem value="hotel">Hotel/Szállás</SelectItem>
                  <SelectItem value="other">Egyéb</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Töltők száma</Label>
              <Input
                type="number"
                value={form.charger_count ?? ""}
                onChange={(e) => updateField("charger_count", parseInt(e.target.value) || 0)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Electrician */}
          <div className="flex items-center gap-3">
            <Label className="text-xs">Van saját villanyszerelő?</Label>
            <div className="flex gap-2">
              {[
                { val: true, label: "Igen" },
                { val: false, label: "Nem" },
              ].map((opt) => (
                <Button
                  key={String(opt.val)}
                  size="sm"
                  variant={form.has_own_electrician === opt.val ? "default" : "outline"}
                  className="text-xs h-8"
                  onClick={() => updateField("has_own_electrician", opt.val)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Electrical capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Fázisok</Label>
              <Select value={form.phases || ""} onValueChange={(v) => updateField("phases", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Válassz..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 fázis</SelectItem>
                  <SelectItem value="3">3 fázis</SelectItem>
                  <SelectItem value="unknown">Nem tudja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Főbiztosíték</Label>
              <Select value={form.main_fuse || ""} onValueChange={(v) => updateField("main_fuse", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Válassz..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="16A">16A</SelectItem>
                  <SelectItem value="20A">20A</SelectItem>
                  <SelectItem value="25A">25A</SelectItem>
                  <SelectItem value="32A">32A</SelectItem>
                  <SelectItem value="40A">40A</SelectItem>
                  <SelectItem value="63A">63A</SelectItem>
                  <SelectItem value="80A">80A</SelectItem>
                  <SelectItem value="100A+">100A+</SelectItem>
                  <SelectItem value="unknown">Nem tudja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Car selection with EV database */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><Car className="h-3 w-3" /> Autó márka</Label>
              <SearchableSelect
                value={carBrand}
                onValueChange={handleCarBrandChange}
                options={[
                  ...brands.map(b => ({ value: b, label: b })),
                  { value: "Egyéb", label: "Egyéb" }
                ]}
                placeholder="Válasszon márkát"
                searchPlaceholder="Márka keresése..."
                emptyMessage="Nem található márka"
                disabled={evLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Autó típus</Label>
              <SearchableSelect
                value={carModel}
                onValueChange={handleCarModelChange}
                options={[
                  ...availableModels.map(m => ({
                    value: m.model,
                    label: `${m.model} (${m.consumption} kWh/100km)`
                  })),
                  ...(carBrand ? [{ value: "Egyéb modell", label: "Egyéb modell" }] : [])
                ]}
                placeholder={carBrand ? "Válasszon típust" : "Először válasszon márkát"}
                searchPlaceholder="Típus keresése..."
                emptyMessage="Nem található típus"
                disabled={!carBrand || evLoading}
              />
            </div>
          </div>

          {(carBrand === "Egyéb" || carModel === "Egyéb modell") && (
            <div className="space-y-1.5">
              <Label className="text-xs">Egyéni autó megadása</Label>
              <Input
                value={form.car_types || ""}
                onChange={(e) => updateField("car_types", e.target.value)}
                placeholder="pl. Tesla Model 3, VW ID.4"
                className="h-9 text-sm"
              />
            </div>
          )}

          {/* Key toggles */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.needs_load_management || false}
                onCheckedChange={(v) => updateField("needs_load_management", v)}
              />
              <Label className="text-xs">Terhelésmenedzsment kell</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={(form.features_needed || []).includes("MID-hitelesített mérés")}
                onCheckedChange={(v) => {
                  const current = form.features_needed || [];
                  if (v) {
                    updateField("features_needed", [...current, "MID-hitelesített mérés"]);
                  } else {
                    updateField("features_needed", current.filter(f => f !== "MID-hitelesített mérés"));
                  }
                }}
              />
              <Label className="text-xs">MID mérés kell</Label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Megjegyzések</Label>
            <Textarea
              value={form.notes || ""}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Bármilyen megjegyzés..."
              className="min-h-[80px] text-sm"
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Státusz</Label>
              <Select value={form.status || "new"} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Új</SelectItem>
                  <SelectItem value="contacted">Kontaktált</SelectItem>
                  <SelectItem value="qualified">Minősített</SelectItem>
                  <SelectItem value="offer_sent">Ajánlat kiküldve</SelectItem>
                  <SelectItem value="converted">Konvertált</SelectItem>
                  <SelectItem value="rejected">Elutasított</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Következő lépés</Label>
              <Input
                value={form.next_step || ""}
                onChange={(e) => updateField("next_step", e.target.value)}
                placeholder="pl. Ajánlat küldés csütörtökön"
                className="h-9 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Email Generator */}
      {form.email && (
        <B2BEmailGenerator
          companyName={form.company_name || ""}
          contactName={form.contact_name || ""}
          email={form.email || ""}
          phone={form.phone || ""}
          city={form.city || undefined}
          zipCode={form.zip_code || undefined}
          address={form.address || undefined}
          phases={form.phases || undefined}
          mainFuse={form.main_fuse || undefined}
          distanceFromPanel={form.distance_from_panel || undefined}
          chargerCount={form.charger_count || undefined}
          onEmailSent={async () => {
            updateField("status", "qualified");
            try {
              const { data: { session } } = await evionorAuth.auth.getSession();
              await supabase.functions.invoke("manage-qualifications", {
                body: { action: "upsert", access_token: session?.access_token, data: { ...form, status: "qualified" } }
              });
            } catch (err) {
              console.error("Auto-qualify save error:", err);
            }
          }}
        />
      )}

      {/* Save button */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={onBack}>
          Mégse
        </Button>
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              Mentés
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
