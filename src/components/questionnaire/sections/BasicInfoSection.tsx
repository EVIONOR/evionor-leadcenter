import { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionnaireData } from "@/types/questionnaire";
import { getCityByZip } from "@/data/hungarianCitiesComplete";
import { carBrands, getModelsByBrand } from "@/data/carBrands";

interface BasicInfoSectionProps {
  form: UseFormReturn<QuestionnaireData>;
}

export const BasicInfoSection = ({ form }: BasicInfoSectionProps) => {
  const selectedBrand = form.watch("carBrand");
  const selectedModel = form.watch("carModel");
  const availableModels = selectedBrand ? getModelsByBrand(selectedBrand) : [];
  const showCustomField = selectedBrand === "Egyéb" || selectedModel === "Egyéb modell";
  return (
    <div className="space-y-6">
      <div className="border-b pb-2">
        <h3 className="text-xl font-semibold text-primary">Alapadatok</h3>
        <p className="text-sm text-muted-foreground mt-1">Általános információk a telepítésről</p>
      </div>

      <FormField
        control={form.control}
        name="contactName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ügyfél neve *</FormLabel>
            <FormControl>
              <Input placeholder="pl. Kovács János" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail cím *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="pl. kovacs.janos@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefonszám *</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="pl. +36 20 123 4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="carBrand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Autó márka *</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("carModel", "");
                }} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Válasszon márkát" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  {carBrands.map((brand) => (
                    <SelectItem key={brand.brand} value={brand.brand}>
                      {brand.brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="carModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Autó típus *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedBrand}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedBrand ? "Válasszon típust" : "Először válasszon márkát"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {!selectedBrand && "Először válasszon autó márkát"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {showCustomField && (
        <FormField
          control={form.control}
          name="customCar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Egyéni autó megadása *</FormLabel>
              <FormControl>
                <Input placeholder="pl. Tesla Roadster 2024" {...field} />
              </FormControl>
              <FormDescription>Adja meg az autó pontos márka és típus megnevezését</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

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
                    } else if (e.target.value.length === 4) {
                      // Ha 4 jegyű az irányítószám, de nincs találat, töröljük a város mezőt
                      form.setValue("city", "");
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
          render={({ field }) => {
            const zipCode = form.watch("zipCode");
            const cityFound = zipCode && getCityByZip(zipCode);
            const isDisabled = !!cityFound;
            
            return (
              <FormItem>
                <FormLabel>Város *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    disabled={isDisabled} 
                    className={isDisabled ? "bg-muted" : ""}
                    placeholder={isDisabled ? "" : "pl. Pázmánd"}
                  />
                </FormControl>
                <FormDescription>
                  {isDisabled ? "Automatikusan kitöltődik" : "Adja meg kézzel a település nevét"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
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
