# MainForm.tsx Refaktoreringsplan

## Status
**Opprettet:** 2025-11-29
**Status:** Planlegging
**Ansvarlig:** Development Team

---

## Problemstilling

MainForm.tsx er en monolittisk komponent på **1560 linjer** som håndterer:
- Form state management (15+ state variabler)
- Event handlers (15+ handlers)
- 8 seksjoner fordelt på 2 tabs
- Validation, submission, PDF-generering
- Stepper navigation
- Kompleks conditional rendering

Dette gjør komponenten:
- ❌ Vanskelig å vedlikeholde
- ❌ Vanskelig å teste
- ❌ Vanskelig å gjenbruke deler av
- ❌ Vanskelig å onboarde nye utviklere på

---

## Mål

✅ Redusere MainForm.tsx til **~200-300 linjer**
✅ Skape gjenbrukbare komponenter
✅ Forbedre testbarhet
✅ Forbedre vedlikeholdbarhet
✅ Beholde all eksisterende funksjonalitet
✅ Ikke introdusere bugs

---

## Faser

### **Fase 1: Grunnleggende ekstraktering (Høy prioritet)**
**Estimert tid:** 3-4 timer
**Risiko:** Lav

#### Steg 1.1: Opprett mappestruktur
```
components/
├── form/
│   └── sections/
│       ├── ProjectInfoSection.tsx
│       ├── ApplicationDetailsSection.tsx
│       ├── MachineApplicationSection.tsx
│       ├── InfraApplicationSection.tsx
│       └── ConsequencesSection.tsx
├── processing/
│   ├── BOIReviewSection.tsx
│   ├── PLReviewSection.tsx
│   ├── WorkingGroupSection.tsx
│   └── ProjectOwnerSection.tsx
└── tabs/
    ├── ApplicationTab.tsx
    └── ProcessingTab.tsx
```

#### Steg 1.2: Ekstrahere Application Tab sections (i rekkefølge)
1. **ProjectInfoSection.tsx**
   - Lines: ~827-888 (Section 1)
   - Props: `{ formData, handleChange, submissionContext }`
   - State: None
   - Handlers: `handleChange`

2. **ApplicationDetailsSection.tsx**
   - Lines: ~891-955 (Section 2)
   - Props: `{ formData, handleChange, submissionContext }`
   - State: None
   - Handlers: `handleChange`

3. **MachineApplicationSection.tsx**
   - Lines: ~967-984 (Section 3A)
   - Props: `{ machines, onEdit, onDelete }`
   - State: None
   - Handlers: `handleOpenMachineModal`, `handleDeleteMachine`

4. **InfraApplicationSection.tsx**
   - Lines: ~987-1071 (Section 3B)
   - Props: `{ infrastructure, onChange }`
   - State: None
   - Handlers: `handleInfraCheckboxChange`, `handleInfraTextChange`

5. **ConsequencesSection.tsx**
   - Lines: ~1079-1108 (Section 4)
   - Props: `{ formData, handleChange }`
   - State: None
   - Handlers: `handleChange`

#### Steg 1.3: Ekstrahere Processing Tab sections
1. **BOIReviewSection.tsx**
   - Lines: ~1158-1243 (Section 5)
   - Props: `{ processing, onChange, formatTimestamp }`
   - State: None
   - Handlers: `handleProcessingChange`

2. **PLReviewSection.tsx**
   - Lines: ~1246-1331 (Section 6)
   - Props: `{ processing, onChange, formatTimestamp }`
   - State: None
   - Handlers: `handleProcessingChange`

3. **WorkingGroupSection.tsx**
   - Lines: ~1334-1390 (Section 7)
   - Props: `{ formData, processing, onChange, onMachineDecisionChange, formatTimestamp }`
   - State: None
   - Handlers: `handleProcessingChange`, `handleMachineDecisionChange`

4. **ProjectOwnerSection.tsx**
   - Lines: ~1393-1467 (Section 8)
   - Props: `{ processing, onChange, formatTimestamp }`
   - State: None
   - Handlers: `handleProcessingChange`

#### Steg 1.4: Ekstrahere tab-komponenter
1. **ApplicationTab.tsx**
   - Samler alle application sections
   - Props: `{ formData, handleChange, ... }`
   - ~150-200 linjer

2. **ProcessingTab.tsx**
   - Samler alle processing sections
   - Props: `{ formData, handleProcessingChange, ... }`
   - ~150-200 linjer

#### Steg 1.5: Refaktorere MainForm.tsx
- Importere tab-komponenter
- Fjerne ekstrahert kode
- Beholde state management og handlers
- Redusere til ~200-300 linjer

#### Testing etter Fase 1:
- [ ] Build kjører uten feil
- [ ] Application tab vises korrekt
- [ ] Processing tab vises korrekt
- [ ] Alle seksjoner rendrer som før
- [ ] Form submission fungerer
- [ ] PDF-generering fungerer
- [ ] Validation fungerer
- [ ] LocalStorage persistence fungerer

---

### **Fase 2: State management refaktorering (Middels prioritet)**
**Estimert tid:** 2-3 timer
**Risiko:** Middels

#### Steg 2.1: Opprett custom hooks
```
hooks/
├── useFormState.ts           (Form data state)
├── useProcessingState.ts     (Processing state)
├── useMachineDecisions.ts    (Machine decisions + auto-calc)
└── useFormSubmission.ts      (Submission logic)
```

#### Steg 2.2: Implementere hooks
1. **useFormState.ts**
   ```typescript
   export const useFormState = (initialData: FormData) => {
     const [formData, setFormData] = useState(initialData);

     const handleChange = useCallback(...);
     const handleInfraCheckboxChange = useCallback(...);
     const handleInfraTextChange = useCallback(...);

     return {
       formData,
       setFormData,
       handleChange,
       handleInfraCheckboxChange,
       handleInfraTextChange
     };
   };
   ```

2. **useProcessingState.ts**
   ```typescript
   export const useProcessingState = () => {
     const handleProcessingChange = useCallback(...);
     const handleMachineDecisionChange = useCallback(...);

     return {
       handleProcessingChange,
       handleMachineDecisionChange
     };
   };
   ```

3. **useMachineDecisions.ts**
   ```typescript
   export const useMachineDecisions = (formData: FormData, setFormData: ...) => {
     // Auto-calculate groupRecommendation
     useEffect(() => {
       // Logic from lines 322-369
     }, [formData.applicationType, formData.machines, ...]);
   };
   ```

4. **useFormSubmission.ts**
   ```typescript
   export const useFormSubmission = (formData: FormData, files: ...) => {
     const [submissionState, setSubmissionState] = useState(...);

     const handleSubmit = async (e: React.FormEvent) => {
       // Logic from lines 473-546
     };

     return {
       submissionState,
       handleSubmit
     };
   };
   ```

#### Steg 2.3: Integrere hooks i MainForm.tsx
- Erstatte inline state med hooks
- Redusere duplicate logic
- Forbedre separation of concerns

#### Testing etter Fase 2:
- [ ] Alle hooks fungerer korrekt
- [ ] Form state oppdateres som før
- [ ] Auto-calculation av groupRecommendation fungerer
- [ ] Submission fungerer
- [ ] Ingen regresjoner

---

### **Fase 3: Gjenbrukbare komponenter (Lav prioritet)**
**Estimert tid:** 2-3 timer
**Risiko:** Lav

#### Steg 3.1: Identifisere gjenbrukbart mønster
BOI og PL sections har nesten identisk struktur:
- Documentation sufficient? (Yes/No)
- Assessment textarea
- Recommendation (Approved/Partially/Rejected)
- Timestamp display

#### Steg 3.2: Lage ReviewSection.tsx
```typescript
interface ReviewSectionProps {
  title: string;
  processing: {
    documentationSufficient: 'yes' | 'no' | '';
    assessment: string;
    recommendation: 'approved' | 'partially_approved' | 'rejected' | '';
    reviewedAt?: string;
    reviewedBy?: string;
  };
  fieldPrefix: string; // 'boi' | 'pl'
  onChange: (e: ...) => void;
  formatTimestamp: (ts?: string) => string;
}
```

#### Steg 3.3: Refaktorere BOI og PL sections
- Bruke ReviewSection som wrapper
- Fjerne duplicate kode
- Redusere fra ~85 linjer til ~20 linjer hver

#### Testing etter Fase 3:
- [ ] BOI section fungerer som før
- [ ] PL section fungerer som før
- [ ] Timestamp vises korrekt
- [ ] Validation fungerer

---

### **Fase 4: Form Context (Valgfri)**
**Estimert tid:** 3-4 timer
**Risiko:** Middels-høy

#### Steg 4.1: Opprett FormContext
```typescript
// contexts/FormContext.tsx
interface FormContextValue {
  formData: FormData;
  setFormData: (data: FormData) => void;
  handleChange: (e: ...) => void;
  handleProcessingChange: (e: ...) => void;
  handleMachineDecisionChange: (id: string, field: ..., value: string) => void;
  // ... all handlers
}

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // All state and handlers here

  return (
    <FormContext.Provider value={...}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => useContext(FormContext);
```

#### Steg 4.2: Wrapping og migrering
- Wrap MainForm content i FormProvider
- Migrere sections til å bruke useFormContext()
- Fjerne prop drilling

#### Fordeler:
✅ Eliminerer prop drilling
✅ Lettere å legge til nye felter
✅ Lettere å teste isolerte komponenter

#### Ulemper:
❌ Mer kompleks arkitektur
❌ Vanskeligere å debugge
❌ Potensielt unødvendige re-renders

#### Testing etter Fase 4:
- [ ] Context provider fungerer
- [ ] Alle komponenter får data fra context
- [ ] Ingen unødvendige re-renders
- [ ] Performance er akseptabel

---

## Suksesskriterier

### Funksjonelle krav:
- [ ] Alle eksisterende features fungerer som før
- [ ] Ingen bugs introdusert
- [ ] Form submission fungerer
- [ ] PDF-generering fungerer
- [ ] Validation fungerer
- [ ] LocalStorage persistence fungerer
- [ ] Stepper navigation fungerer

### Ikke-funksjonelle krav:
- [ ] MainForm.tsx er redusert til <300 linjer
- [ ] Ingen komponent er over 200 linjer
- [ ] Alle komponenter har én klar ansvarssone
- [ ] Kode er lett å forstå for nye utviklere
- [ ] Build tid er ikke økt betydelig
- [ ] Bundle size er ikke økt betydelig

---

## Risikovurdering

### Høy risiko:
- **Å bryte eksisterende funksjonalitet**
  - Mitigering: Grundig testing etter hver fase
  - Mitigering: Små, inkrementelle endringer
  - Mitigering: Git branches for hver fase

### Middels risiko:
- **Performance degradation**
  - Mitigering: Performance testing før/etter
  - Mitigering: Bruke React DevTools Profiler
  - Mitigering: Memoization hvor nødvendig

### Lav risiko:
- **Merge conflicts**
  - Mitigering: Koordinere med team
  - Mitigering: Gjøre refaktorering i egen branch
  - Mitigering: Merge tidlig og ofte

---

## Rollback-plan

Hvis kritiske problemer oppstår:
1. ✅ Git revert til siste stabile commit
2. ✅ Dokumentere problemet i issue tracker
3. ✅ Analysere hva som gikk galt
4. ✅ Justere plan og prøv igjen

---

## Neste steg

1. ✅ Godkjenn refaktoreringsplan
2. ⏳ Opprett feature branch: `refactor/mainform-component-extraction`
3. ⏳ Start med Fase 1, Steg 1.1
4. ⏳ Commit etter hvert steg
5. ⏳ Test grundig etter hver fase
6. ⏳ Oppdater denne dokumentasjonen underveis

---

## Logg

| Dato | Fase | Status | Kommentar |
|------|------|--------|-----------|
| 2025-11-29 | Planlegging | ✅ Fullført | Plan opprettet |
| 2025-11-29 | Fase 1 | ✅ Fullført | Alle sections ekstrahert, tabs opprettet, MainForm refaktorert |
| 2025-11-29 | Testing | 🔄 Pågår | Build OK, manuell testing gjenstår |
