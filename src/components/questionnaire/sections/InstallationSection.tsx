import { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionnaireData } from "@/types/questionnaire";

interface InstallationSectionProps {
  form: UseFormReturn<QuestionnaireData>;
}

export const InstallationSection = ({ form }: InstallationSectionProps) => {
  const networkExpansion = form.watch("networkExpansion");

  return (
    <div className="space-y-6">
      <div className="border-b pb-2">
        <h3 className="text-xl font-semibold text-primary">Telepítési részletek</h3>
        <p className="text-sm text-muted-foreground mt-1">Technikai információk a szerelésről</p>
      </div>

      <FormField
        control={form.control}
        name="needsElectricalPlanning"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Szükség van-e villamos tervezésre? *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "true")}
                defaultValue={field.value ? "true" : "false"}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="planning-yes" />
                  <label htmlFor="planning-yes" className="cursor-pointer">Igen</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="planning-no" />
                  <label htmlFor="planning-no" className="cursor-pointer">Nem</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="indoorOutdoor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kültéri vagy beltéri? *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="kültér">Kültér</SelectItem>
                <SelectItem value="beltér">Beltér</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="mountingSurface"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mire kell rögzíteni? *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Válasszon felületet" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="beton">Beton</SelectItem>
                <SelectItem value="fa">Fa</SelectItem>
                <SelectItem value="tégla">Tégla</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="needsBackplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kell-e hátlap? *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  defaultValue={field.value ? "true" : "false"}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="backplate-yes" />
                    <label htmlFor="backplate-yes" className="cursor-pointer">Igen</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="backplate-no" />
                    <label htmlFor="backplate-no" className="cursor-pointer">Nem</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="needsPole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kell-e oszlop? *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  defaultValue={field.value ? "true" : "false"}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="pole-yes" />
                    <label htmlFor="pole-yes" className="cursor-pointer">Igen</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="pole-no" />
                    <label htmlFor="pole-no" className="cursor-pointer">Nem</label>
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
        name="distanceFromBox"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Távolság a doboztól (méter)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="pl. 5" {...field} />
            </FormControl>
            <FormDescription>Adja meg a távolságot méterben</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="spaceInBox"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Van-e hely a dobozban? *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="igen">Igen</SelectItem>
                <SelectItem value="nem">Nem</SelectItem>
                <SelectItem value="nemtudom">Nem tudom</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="groundworkWallPenetration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Földmunka és faláttörések</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Írja le a szükséges földmunkákat és faláttöréseket..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>Részletezze a szükséges munkálatokat</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="otherComments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Egyéb megjegyzések</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="További információk, speciális igények..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
