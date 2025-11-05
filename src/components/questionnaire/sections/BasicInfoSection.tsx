import { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionnaireData } from "@/types/questionnaire";
import { getCityByZip } from "@/data/hungarianCities";

interface BasicInfoSectionProps {
  form: UseFormReturn<QuestionnaireData>;
}

const carBrands = [
  "Tesla Model 3", "Tesla Model Y", "Tesla Model S", "Tesla Model X",
  "Volkswagen ID.3", "Volkswagen ID.4", "Volkswagen ID.5",
  "BMW i4", "BMW iX", "BMW i3",
  "Mercedes EQA", "Mercedes EQB", "Mercedes EQC", "Mercedes EQS",
  "Audi e-tron", "Audi Q4 e-tron", "Audi e-tron GT",
  "Hyundai IONIQ 5", "Hyundai IONIQ 6", "Hyundai Kona Electric",
  "Kia EV6", "Kia Niro EV", "Kia e-Soul",
  "Nissan Leaf", "Nissan Ariya",
  "Renault Zoe", "Renault Megane E-Tech",
  "Peugeot e-208", "Peugeot e-2008",
  "Fiat 500e", "MG4 Electric", "MG ZS EV",
  "Egyéb"
];

export const BasicInfoSection = ({ form }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="border-b pb-2">
        <h3 className="text-xl font-semibold text-primary">Alapadatok</h3>
        <p className="text-sm text-muted-foreground mt-1">Általános információk a telepítésről</p>
      </div>

      <FormField
        control={form.control}
        name="carType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Milyen autója van? *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Válasszon autót" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[300px]">
                {carBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Irányítószám *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="pl. 1051" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    const city = getCityByZip(e.target.value);
                    if (city) {
                      form.setValue("city", city);
                    }
                  }}
                  maxLength={4}
                />
              </FormControl>
              <FormDescription>Adja meg a 4 jegyű irányítószámot</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Város</FormLabel>
              <FormControl>
                <Input {...field} disabled className="bg-muted" />
              </FormControl>
              <FormDescription>Automatikusan kitöltődik</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="phases"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hány fázis áll rendelkezésre? *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 fázis</SelectItem>
                  <SelectItem value="3">3 fázis</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amperage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hány amper? *</FormLabel>
              <FormControl>
                <Input type="number" placeholder="pl. 32" {...field} />
              </FormControl>
              <FormDescription>Adja meg az amperage értékét</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="installLocation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hova kell szerelni a töltőt? *</FormLabel>
            <FormControl>
              <Input placeholder="pl. Garázs, kocsibeálló, kert" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="buildingType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Milyen típusú épület? *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Válasszon típust" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="családi_ház">Családi ház</SelectItem>
                <SelectItem value="társas_ház">Társas ház</SelectItem>
                <SelectItem value="sorház">Sorház</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
