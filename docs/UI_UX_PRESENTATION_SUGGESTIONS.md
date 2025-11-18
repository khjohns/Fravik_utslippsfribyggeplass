# UI/UX Forbedringsforslag og Handlingsplan

**Opprettet:** 2025-11-18
**Status:** Under vurdering

---

## Innholdsfortegnelse

1. [Kritiske forbedringer](#1-kritiske-forbedringer)
2. [Skjemastruktur og felter](#2-skjemastruktur-og-felter)
3. [Visuell layout](#3-visuell-layout)
4. [Mobile og tilgjengelighet](#4-mobile-og-tilgjengelighet)
5. [Feilhåndtering](#5-feilhåndtering)
6. [Handlingsplan](#handlingsplan)

---

## 1. Kritiske forbedringer

### 1.1 Flytt viktig informasjon fra placeholder til hjelpetekst (HØY prioritet)

**Problem:** Flere felt har kritisk veiledning skjult i placeholder som forsvinner når bruker begynner å skrive.

| Felt | Nåværende placeholder | Anbefaling |
|------|----------------------|------------|
| `powerAccessDescription` | "Hvor er nærmeste tilkoblingspunkt? Hva er tilgjengelig elektrisk effekt (kW/kVA)?" | Flytt til synlig hjelpetekst under label |
| `costAssessment` | "Er merkostnaden for utslippsfri drift >10% av prosjektkostnaden?" | Flytt til synlig hjelpetekst under label |
| `consequencesOfRejection` | "Beskriv konsekvenser for fremdrift, kostnader, og teknisk gjennomførbarhet" | Flytt til synlig hjelpetekst under label |

**Løsning:** Bruk PDS `helper-text` attributt eller tilsvarende for permanent synlig veiledning. Behold kun enkle eksempler i placeholder.

---

## 2. Skjemastruktur og felter

### 2.1 Fjern overflødige felter

Følgende felter kan fjernes for å forenkle skjemaet:

| Felt | Begrunnelse |
|------|-------------|
| "Søknad sendes inn av" | Kan utledes automatisk fra innlogget bruker |
| "Hovedårsak for søknad" | Redundant informasjon |

### 2.2 Reorganisering av maskinmodal

**Endring:** Flytt "Vurdering av alternative løsninger" opp til seksjonen "Begrunnelse for fravik"

**Begrunnelse:** Logisk gruppering - alternative løsninger hører naturlig sammen med begrunnelsen for hvorfor fravik er nødvendig.

### 2.3 Konverter nedtrekksmenyer til checkboxer

**Regel:** Nedtrekksmenyer med færre enn 4 elementer bør konverteres til checkbox/radio buttons.

**Fordeler:**
- Bedre oversikt over alle alternativer
- Raskere valg for brukeren
- Reduserer antall klikk

**Kandidater for konvertering:**
- Gjennomgå alle `<select>` og `PktSelect` komponenter
- Identifiser de med <= 3 alternativer
- Konverter til checkbox (flervalg) eller radio (enkeltvalg)

---

## 3. Visuell layout

### 3.1 Vertikal stabling av checkboxer og knapper

**Anbefaling:** Checkboxer og knapper bør stables vertikalt for bedre lesbarhet og touch-vennlighet.

```html
<!-- Anbefalt layout -->
<div class="vertical-stack">
  <pkt-checkbox>Alternativ 1</pkt-checkbox>
  <pkt-checkbox>Alternativ 2</pkt-checkbox>
  <pkt-checkbox>Alternativ 3</pkt-checkbox>
</div>

<div class="button-stack">
  <pkt-button variant="primary">Hovedhandling</pkt-button>
  <pkt-button variant="secondary">Sekundær handling</pkt-button>
</div>
```

### 3.2 Feltbredder tilpasset innhold

Flere felt bruker full bredde selv om forventet lengde er kort:

| Felt | Forventet lengde | Anbefalt bredde |
|------|-----------------|-----------------|
| `projectNumber` | ~10-20 tegn | 50% på desktop |
| `submitterName` | Navn (variabel) | 100% (beholder) |
| Datovelgere | Fast format | 50% på desktop |

**Implementering:**
```css
.field-narrow {
  max-width: 50%;
}

@media (max-width: 768px) {
  .field-narrow {
    max-width: 100%;
  }
}
```

### 3.3 Forbedre labels

**Problem:** Noen labels er for lange og uklare.

| Nåværende label | Foreslått endring |
|-----------------|-------------------|
| "Akutt behov / Søknad sendes etter oppstart eller nært oppstart" | "Akutt behov" + hjelpetekst: "Gjelder søknader som sendes etter eller nært oppstart" |

---

## 4. Mobile og tilgjengelighet

### 4.1 Input-typer for mobile tastaturer

Legg til `inputMode` attributter for bedre mobil-UX:

```typescript
// Prosjektnummer
<input inputMode="text" pattern="[A-Z0-9-]+" />

// Telefonnummer
<input inputMode="tel" />

// E-post
<input inputMode="email" />
```

---

## 5. Feilhåndtering

### 5.1 Oversett feilmeldinger til norsk

**Nåværende (api.service.ts):**
- "Project name is required"
- "Invalid email format"

**Foreslått:**
- "Prosjektnavn er påkrevd"
- "Ugyldig e-postformat"

### 5.2 Implementer felt-nivå feilvisning

**Problem:** Kun global feilmelding vises - individuelle felt markeres ikke med feil.

**Løsning:**
```typescript
// Eksempel med react-hook-form
const { errors } = formState;

<PktInputWrapper
  label="Prosjektnavn"
  error={errors.projectName?.message}
  hasError={!!errors.projectName}
>
  <input {...register('projectName')} />
</PktInputWrapper>
```

---

## Handlingsplan

### Fase 1: Kritiske forbedringer (Uke 1)

| # | Oppgave | Prioritet | Estimat |
|---|---------|-----------|---------|
| 1.1 | Flytt placeholder-tekst til hjelpetekst | HØY | 2t |
| 1.2 | Oversett feilmeldinger til norsk | HØY | 1t |
| 1.3 | Implementer felt-nivå feilvisning | HØY | 3t |

### Fase 2: Skjemastruktur (Uke 2)

| # | Oppgave | Prioritet | Estimat |
|---|---------|-----------|---------|
| 2.1 | Fjern "Søknad sendes inn av" og "Hovedårsak for søknad" | MIDDELS | 1t |
| 2.2 | Flytt "Vurdering av alternative løsninger" i maskinmodal | MIDDELS | 1t |
| 2.3 | Identifiser og konverter nedtrekksmenyer (<4 elementer) | MIDDELS | 2t |

### Fase 3: Visuell layout (Uke 3)

| # | Oppgave | Prioritet | Estimat |
|---|---------|-----------|---------|
| 3.1 | Implementer vertikal stabling for checkboxer/knapper | LAV | 2t |
| 3.2 | Juster feltbredder basert på innhold | LAV | 2t |
| 3.3 | Forkorte labels og legge til hjelpetekst | LAV | 1t |

### Fase 4: Mobile forbedringer (Uke 4)

| # | Oppgave | Prioritet | Estimat |
|---|---------|-----------|---------|
| 4.1 | Legg til inputMode attributter | LAV | 1t |
| 4.2 | Testing på mobile enheter | LAV | 2t |

---

## Sjekkliste for implementering

- [ ] **1.1** Placeholder til hjelpetekst - powerAccessDescription
- [ ] **1.1** Placeholder til hjelpetekst - costAssessment
- [ ] **1.1** Placeholder til hjelpetekst - consequencesOfRejection
- [ ] **1.2** Oversett alle feilmeldinger i api.service.ts
- [ ] **1.3** Implementer felt-nivå feilvisning i skjema
- [ ] **2.1** Fjern "Søknad sendes inn av" felt
- [ ] **2.1** Fjern "Hovedårsak for søknad" felt
- [ ] **2.2** Flytt "Vurdering av alternative løsninger" i maskinmodal
- [ ] **2.3** Identifiser nedtrekksmenyer med <4 elementer
- [ ] **2.3** Konverter identifiserte nedtrekksmenyer til checkboxer
- [ ] **3.1** Implementer CSS for vertikal stabling
- [ ] **3.2** Juster feltbredder (projectNumber, datovelgere)
- [ ] **3.3** Forkorte lange labels
- [ ] **4.1** Legg til inputMode for relevante felter
- [ ] **4.2** Test på iOS og Android

---

## Notater

- Alle endringer bør testes med skjermleser for tilgjengelighet
- Vurder A/B-testing for større layout-endringer
- Dokumenter endringer i komponentbiblioteket
