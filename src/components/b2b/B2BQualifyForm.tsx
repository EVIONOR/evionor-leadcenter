import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { B2BQuestionnaireResponse } from "@/integrations/evionor/types";
import type { B2BQualificationInsert } from "@/types/b2b";
import { B2BEmailGenerator } from "./B2BEmailGenerator";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  User,
  Loader2,
  Save,
  Zap,
  Sun,
  Wifi,
  Cable,
  Thermometer,
  Ruler,
} from "lucide-react";

const FEATURE_OPTIONS = [
  "RFID azonosítás",
  "Mobilapplikáció",
  "Terhelésmenedzsment",
  "Energiamérés",
  "Időzített töltés",
  "OCPP protokoll",
  "MID-hitelesített mérés",
  "Dinamikus áramszabályozás",
];

interface B2BQualifyFormProps {
  lead: B2BQuestionnaireResponse;
  onBack: () => void;
  onSaved: () => void;
}

export function B2BQualifyForm({ lead, onBack, onSaved }: B2BQualifyFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

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

  const updateField = <K extends keyof B2BQualificationInsert>(
    key: K,
    value: B2BQualificationInsert[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFeature = (feature: string) => {
    const current = form.features_needed || [];
    const updated = current.includes(feature)
      ? current.filter((f) => f !== feature)
      : [...current, feature];
    updateField("features_needed", updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("b2b_qualifications").insert(form as any);
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
              onChange={(e) => updateField("zip_code", e.target.value)}
              className="h-9 text-sm"
              placeholder="pl. 1052"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Város</Label>
            <Input
              value={form.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
              className="h-9 text-sm"
              placeholder="pl. Budapest"
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

      {/* Section 2: Needs Assessment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            2. Igényfelmérés
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Projekt típus</Label>
            <Select value={form.project_type || ""} onValueChange={(v) => updateField("project_type", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Válassz..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="family_house">Családi ház</SelectItem>
                <SelectItem value="fleet">Flotta töltés</SelectItem>
                <SelectItem value="workplace">Munkahelyi töltés</SelectItem>
                <SelectItem value="public">Nyilvános töltő</SelectItem>
                <SelectItem value="residential_complex">Társasház</SelectItem>
                <SelectItem value="mixed">Vegyes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Helyszín típus</Label>
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
          <div className="space-y-1.5">
            <Label className="text-xs">Sürgősség</Label>
            <Select value={form.urgency || ""} onValueChange={(v) => updateField("urgency", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Válassz..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">Azonnal</SelectItem>
                <SelectItem value="1_month">1 hónapon belül</SelectItem>
                <SelectItem value="3_months">3 hónapon belül</SelectItem>
                <SelectItem value="6_months">Féléven belül</SelectItem>
                <SelectItem value="exploring">Csak tájékozódik</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs">Időzítés (lead-ből)</Label>
            <Input
              value={form.timeline || ""}
              onChange={(e) => updateField("timeline", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Branch decision */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            3. Kivitelezés döntés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Label className="text-xs">Van saját villanyszerelő?</Label>
            <div className="flex gap-2">
              {[
                { val: true, label: "Igen (→ A ág)" },
                { val: false, label: "Nem (→ B ág)" },
              ].map((opt) => (
                <Button
                  key={String(opt.val)}
                  size="sm"
                  variant={form.has_own_electrician === opt.val ? "default" : "outline"}
                  className="text-xs h-8"
                  onClick={() => {
                    updateField("has_own_electrician", opt.val);
                    updateField("qualification_branch", opt.val ? "A" : "B");
                  }}
                >
                  {opt.label}
                </Button>
              ))}
              <Button
                size="sm"
                variant={form.qualification_branch === "C" ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => {
                  updateField("has_own_electrician", null);
                  updateField("qualification_branch", "C");
                }}
              >
                Nem érdekelt (→ C)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Branch A - Technical specs */}
      {form.qualification_branch === "A" && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cable className="h-4 w-4" />
              4A. Technikai specifikáció
              <Badge variant="outline" className="text-[10px]">A ág</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Autó típusok (flotta)</Label>
                <Input
                  value={form.car_types || ""}
                  onChange={(e) => updateField("car_types", e.target.value)}
                  placeholder="pl. Tesla Model 3, VW ID.4"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">EV típus</Label>
                <Select value={form.ev_type || ""} onValueChange={(v) => updateField("ev_type", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Válassz..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bev">Tisztán elektromos (BEV)</SelectItem>
                    <SelectItem value="phev">Plug-in hybrid (PHEV)</SelectItem>
                    <SelectItem value="mixed">Vegyes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <div className="space-y-1.5">
                <Label className="text-xs">Kábeles vagy aljzatos</Label>
                <Select value={form.cable_or_socket || ""} onValueChange={(v) => updateField("cable_or_socket", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Válassz..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cable">Beépített kábel</SelectItem>
                    <SelectItem value="socket">Aljzat (Type 2)</SelectItem>
                    <SelectItem value="both">Mindkettő</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.needs_load_management || false}
                  onCheckedChange={(v) => updateField("needs_load_management", v)}
                />
                <Label className="text-xs">Terhelésmenedzsment</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.has_solar || false}
                  onCheckedChange={(v) => updateField("has_solar", v)}
                />
                <Label className="text-xs flex items-center gap-1">
                  <Sun className="h-3 w-3" /> Napelem
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.has_wifi || false}
                  onCheckedChange={(v) => updateField("has_wifi", v)}
                />
                <Label className="text-xs flex items-center gap-1">
                  <Wifi className="h-3 w-3" /> Wi-Fi a töltőpontnál
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.has_wifi_at_panel || false}
                  onCheckedChange={(v) => updateField("has_wifi_at_panel", v)}
                />
                <Label className="text-xs flex items-center gap-1">
                  <Wifi className="h-3 w-3" /> Wi-Fi a betáp elosztónál
                </Label>
              </div>
            </div>

            {/* Features checklist */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-medium">Szükséges funkciók</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {FEATURE_OPTIONS.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Checkbox
                      checked={(form.features_needed || []).includes(feature)}
                      onCheckedChange={() => toggleFeature(feature)}
                    />
                    <Label className="text-xs cursor-pointer">{feature}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.offer_sent || false}
                  onCheckedChange={(v) => updateField("offer_sent", v)}
                />
                <Label className="text-xs">Ajánlat elküldve</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.discount_applied || false}
                  onCheckedChange={(v) => updateField("discount_applied", v)}
                />
                <Label className="text-xs">Kedvezmény alkalmazva</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 4: Branch B - Installation prep */}
      {form.qualification_branch === "B" && (
        <Card className="border-amber-300/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              4B. Telepítés & Technikai felmérés
              <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">B ág</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Installation circumstances */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> Távolság a főelosztótól
                </Label>
                <Select value={form.distance_from_panel || ""} onValueChange={(v) => updateField("distance_from_panel", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Válassz..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5m">5m-en belül</SelectItem>
                    <SelectItem value="10m">5-10m</SelectItem>
                    <SelectItem value="20m">10-20m</SelectItem>
                    <SelectItem value="30m">20-30m</SelectItem>
                    <SelectItem value="30m+">30m felett</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Charger selection questions - same as Branch A */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Autó típusok (flotta)</Label>
                <Input
                  value={form.car_types || ""}
                  onChange={(e) => updateField("car_types", e.target.value)}
                  placeholder="pl. Tesla Model 3, VW ID.4"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">EV típus</Label>
                <Select value={form.ev_type || ""} onValueChange={(v) => updateField("ev_type", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Válassz..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bev">Tisztán elektromos (BEV)</SelectItem>
                    <SelectItem value="phev">Plug-in hybrid (PHEV)</SelectItem>
                    <SelectItem value="mixed">Vegyes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Kábeles vagy aljzatos</Label>
                <Select value={form.cable_or_socket || ""} onValueChange={(v) => updateField("cable_or_socket", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Válassz..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cable">Beépített kábel</SelectItem>
                    <SelectItem value="socket">Aljzat (Type 2)</SelectItem>
                    <SelectItem value="both">Mindkettő</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.needs_load_management || false}
                  onCheckedChange={(v) => updateField("needs_load_management", v)}
                />
                <Label className="text-xs">Terhelésmenedzsment</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.has_solar || false}
                  onCheckedChange={(v) => updateField("has_solar", v)}
                />
                <Label className="text-xs flex items-center gap-1">
                  <Sun className="h-3 w-3" /> Napelem
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.has_wifi || false}
                  onCheckedChange={(v) => updateField("has_wifi", v)}
                />
                <Label className="text-xs flex items-center gap-1">
                  <Wifi className="h-3 w-3" /> Wi-Fi a töltőpontnál
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.has_wifi_at_panel || false}
                  onCheckedChange={(v) => updateField("has_wifi_at_panel", v)}
                />
                <Label className="text-xs flex items-center gap-1">
                  <Wifi className="h-3 w-3" /> Wi-Fi az elosztónál
                </Label>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-medium">Szükséges funkciók</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {FEATURE_OPTIONS.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Checkbox
                      checked={(form.features_needed || []).includes(feature)}
                      onCheckedChange={() => toggleFeature(feature)}
                    />
                    <Label className="text-xs cursor-pointer">{feature}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Installation prep */}
            <div className="pt-2 border-t space-y-3">
              <Label className="text-xs font-medium">Előkészítés</Label>
              <div className="flex items-center gap-3">
                <Label className="text-xs">Van elektromos előkészítés?</Label>
                <div className="flex gap-2">
                  <Button size="sm" variant={form.has_electrical_prep === true ? "default" : "outline"} className="text-xs h-8" onClick={() => updateField("has_electrical_prep", true)}>Igen</Button>
                  <Button size="sm" variant={form.has_electrical_prep === false ? "default" : "outline"} className="text-xs h-8" onClick={() => updateField("has_electrical_prep", false)}>Nem</Button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-xs">Szeretne fotókat küldeni?</Label>
                <div className="flex gap-2">
                  <Button size="sm" variant={form.wants_photos === true ? "default" : "outline"} className="text-xs h-8" onClick={() => updateField("wants_photos", true)}>Igen</Button>
                  <Button size="sm" variant={form.wants_photos === false ? "default" : "outline"} className="text-xs h-8" onClick={() => updateField("wants_photos", false)}>Nem</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Switch checked={form.photos_received || false} onCheckedChange={(v) => updateField("photos_received", v)} />
                  <Label className="text-xs">Fotók megérkeztek</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.needs_technical_callback || false} onCheckedChange={(v) => updateField("needs_technical_callback", v)} />
                  <Label className="text-xs">Technikai visszahívás kell</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 5: Closing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            5. Lezárás
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Lead hőfok</Label>
              <Select value={form.lead_temperature || "warm"} onValueChange={(v) => updateField("lead_temperature", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">🔥 Forró</SelectItem>
                  <SelectItem value="warm">🌡️ Meleg</SelectItem>
                  <SelectItem value="cold">❄️ Hideg</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          <div className="space-y-1.5">
            <Label className="text-xs">Megjegyzések</Label>
            <Textarea
              value={form.notes || ""}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Bármilyen megjegyzés a hívásról..."
              className="min-h-[80px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Email Generator */}
      {(form.qualification_branch === "A" || form.qualification_branch === "B") && form.email && (
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
