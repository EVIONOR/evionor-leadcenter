import { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { QuestionnaireData } from "@/types/questionnaire";

interface ChargerSpecsSectionProps {
  form: UseFormReturn<QuestionnaireData>;
}

export const ChargerSpecsSection = ({ form }: ChargerSpecsSectionProps) => {
  const networkExpansion = form.watch("networkExpansion");
  const infrastructureDevelopment = form.watch("infrastructureDevelopment");

  return (
    <div className="space-y-6">
      <div className="border-b pb-2">
        <h3 className="text-xl font-semibold text-primary">Töltő specifikációk</h3>
        <p className="text-sm text-muted-foreground mt-1">Töltő funkciók és kiegészítők</p>
      </div>

      <FormField
        control={form.control}
        name="solarIntegration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Napelemes integráció *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="nem">Nem kell</SelectItem>
                <SelectItem value="1fázis">Igen - 1 fázis</SelectItem>
                <SelectItem value="3fázis">Igen - 3 fázis</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="loadManagement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terhelésmenedzsment *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  defaultValue={field.value ? "true" : "false"}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="load-yes" />
                    <label htmlFor="load-yes" className="cursor-pointer">Kell</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="load-no" />
                    <label htmlFor="load-no" className="cursor-pointer">Nem kell</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="builtInCable"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beépített kábel *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  defaultValue={field.value ? "true" : "false"}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="cable-yes" />
                    <label htmlFor="cable-yes" className="cursor-pointer">Igen</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="cable-no" />
                    <label htmlFor="cable-no" className="cursor-pointer">Nem</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="needsApp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Applikáció kontroll *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  defaultValue={field.value ? "true" : "false"}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="app-yes" />
                    <label htmlFor="app-yes" className="cursor-pointer">Igen</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="app-no" />
                    <label htmlFor="app-no" className="cursor-pointer">Nem</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="overvoltageProtection"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Túlfeszültség védelem *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  defaultValue={field.value ? "true" : "false"}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="overvoltage-yes" />
                    <label htmlFor="overvoltage-yes" className="cursor-pointer">Kell</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="overvoltage-no" />
                    <label htmlFor="overvoltage-no" className="cursor-pointer">Nem kell</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="infrastructureDevelopment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Villamos infrastruktúra fejlesztés *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "true")}
                defaultValue={field.value ? "true" : "false"}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="infra-yes" />
                  <label htmlFor="infra-yes" className="cursor-pointer">Igen</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="infra-no" />
                  <label htmlFor="infra-no" className="cursor-pointer">Nem</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {infrastructureDevelopment && (
        <FormField
          control={form.control}
          name="infrastructureDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Infrastruktúra részletek</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Milyen fejlesztések szükségesek?"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="networkExpansion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hálózat bővítés *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "true")}
                defaultValue={field.value ? "true" : "false"}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="expansion-yes" />
                  <label htmlFor="expansion-yes" className="cursor-pointer">Igen</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="expansion-no" />
                  <label htmlFor="expansion-no" className="cursor-pointer">Nem</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {networkExpansion && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="expansionPhase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bővítés - Fázis</FormLabel>
                <FormControl>
                  <Input placeholder="pl. 3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expansionAmperage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bővítés - Amper</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="pl. 63" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};
