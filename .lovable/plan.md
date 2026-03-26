

## Terv: B2B lead automatikus "Minősített" státusz email küldés után

### Jelenlegi állapot

A kód **elvileg már megcsinálja** ezt — a `B2BQualifyForm.tsx` (450. sor) az `onEmailSent` callback-ben beállítja a státuszt "qualified"-ra és elmenti. **De van egy kritikus bug**, ami megakadályozza a helyes működést:

### Bug a `B2BEmailGenerator.tsx` 754-757. sorban

```typescript
if (emailData?.success) {
  toast.success(`Email elküldve: ${email}`);
  onEmailSent?.();                    // ← meghívja
  throw new Error(emailData?.error || "Ismeretlen hiba");  // ← DE UTÁNA HIBÁT DOB!
}
```

A sikeres email küldés után azonnal `throw`-ol, ami a `catch` blokkba esik és "Email küldési hiba" toast-ot mutat. Az `onEmailSent` ugyan meghívódik, de a hibakezelés összezavarja a flow-t.

### Javítás

**1 fájl: `src/components/b2b/B2BEmailGenerator.tsx`**

A `sendEmail` függvényben (741-765. sor) javítani a logikát:

```typescript
const sendEmail = async () => {
  if (!generatedEmail || !email) return;
  setIsSending(true);
  try {
    const { data: emailData, error } = await supabase.functions.invoke("send-email", {
      body: {
        to: email,
        subject: emailSubject || `EV-töltő ajánlat vállalati ügyfeleknek – ${companyName || contactName}`,
        html: generatedEmail,
        from: `${senderName} - EVIONOR <hello@notifications.evionor.hu>`,
      },
    });
    if (error) throw error;
    if (!emailData?.success) {
      throw new Error(emailData?.error || "Ismeretlen hiba");
    }
    toast.success(`Email elküldve: ${email}`);
    onEmailSent?.();
  } catch (error) {
    console.error("Email send error:", error);
    toast.error("Email küldési hiba");
  } finally {
    setIsSending(false);
  }
};
```

A lényeg: a `throw` csak `!success` esetén hívódik, a siker ág pedig rendesen lefut az `onEmailSent()` callbackkel — ami a `B2BQualifyForm`-ban már most is "qualified"-ra állítja a státuszt és elmenti a szerverre.

### Hatás
- Az email sikeres küldése után a lead automatikusan "Minősített" kategóriába kerül
- A felhasználó nem kap téves "Email küldési hiba" üzenetet sikeres küldés után

