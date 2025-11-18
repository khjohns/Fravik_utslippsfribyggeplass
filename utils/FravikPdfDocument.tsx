import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { FormData, Machine } from '../types';

// Oslo Kommune design system colors
const COLORS = {
  primary: '#2A2859',      // Oslo mørk blå
  ink: '#2C2C2C',          // Oslo sort
  white: '#FFFFFF',
  lightBg: '#F8F0DD',      // Oslo lys beige
  success: '#034B45',      // Oslo mørk grønn
  successBg: '#C7F6C9',    // Oslo lys grønn
  warning: '#F9C66B',      // Oslo gul
  warningBg: '#F8F0DD',    // Oslo lys beige
  neutral: '#D0BFAE',      // Oslo mørk beige
  neutralBg: '#F8F0DD',    // Oslo lys beige
  inkDim: '#4D4D4D',
  muted: '#666666',
  border: '#E6E6E6',
};

// Stylesheet
const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingLeft: 42,
    paddingRight: 42,
    paddingBottom: 60,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: COLORS.ink,
    lineHeight: 1.4,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 42,
    paddingRight: 42,
    marginBottom: 25,
    marginLeft: -42,
    marginRight: -42,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.primary,
  },
  infoBox: {
    backgroundColor: COLORS.lightBg,
    padding: 12,
    borderRadius: 3,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.inkDim,
    width: 140,
  },
  infoValue: {
    fontSize: 9,
    color: COLORS.ink,
    flex: 1,
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 18,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.inkDim,
    marginTop: 12,
    marginBottom: 8,
  },
  table: {
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
  },
  tableRowStriped: {
    backgroundColor: '#F5F5F5',
  },
  tableLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    width: '45%',
    paddingRight: 10,
    color: COLORS.inkDim,
  },
  tableValue: {
    fontSize: 9,
    width: '55%',
    color: COLORS.ink,
  },
  textBlock: {
    marginBottom: 10,
  },
  textBlockTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.inkDim,
    marginBottom: 4,
  },
  textBlockContent: {
    fontSize: 9,
    lineHeight: 1.5,
    paddingLeft: 5,
  },
  urgentBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  urgentBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.ink,
  },
  machineCard: {
    backgroundColor: COLORS.lightBg,
    padding: 12,
    borderRadius: 3,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  machineHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 42,
    right: 42,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: COLORS.muted,
  },
  metadataFooter: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metadataText: {
    fontSize: 7,
    color: COLORS.muted,
  },
});

// Helper components
const Header: React.FC = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Fraviksøknad - Utslippsfri byggeplass</Text>
    <Text style={styles.headerSubtitle}>Oslo Kommune</Text>
  </View>
);

const Footer: React.FC<{ pageNumber: number; totalPages: number }> = ({ pageNumber, totalPages }) => (
  <View style={styles.footer} fixed>
    <Text>
      Generert: {new Date().toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' })} kl.{' '}
      {new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}
    </Text>
    <Text>
      Side {pageNumber} av {totalPages}
    </Text>
  </View>
);

const TableRow: React.FC<{ label: string; value: string; striped?: boolean }> = ({ label, value, striped }) => (
  <View style={[styles.tableRow, striped && styles.tableRowStriped]}>
    <Text style={styles.tableLabel}>{label}</Text>
    <Text style={styles.tableValue}>{value}</Text>
  </View>
);

const TextBlock: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  if (!content?.trim()) return null;
  return (
    <View style={styles.textBlock}>
      <Text style={styles.textBlockTitle}>{title}</Text>
      <Text style={styles.textBlockContent}>{content}</Text>
    </View>
  );
};

// Label helpers
const getPrimaryDriverLabel = (driver: string): string => {
  switch (driver) {
    case 'Teknisk/Markedsmessig hindring':
      return 'Teknisk/Markedsmessig hindring';
    case 'Kostnad':
      return 'Kostnad';
    case 'Fremdrift':
      return 'Fremdrift';
    default:
      return driver || '—';
  }
};

const getApplicationTypeLabel = (type: string): string => {
  switch (type) {
    case 'machine':
      return 'Maskiner';
    case 'infrastructure':
      return 'Anleggsstrøm';
    default:
      return type || '—';
  }
};

const getMachineTypeLabel = (machine: Machine): string => {
  if (machine.type === 'Annet' && machine.otherType) {
    return `Annet: ${machine.otherType}`;
  }
  return machine.type || '—';
};

const getReasonLabels = (reasons: string[]): string => {
  if (!reasons || reasons.length === 0) return '—';
  return reasons.join(', ');
};

const getFuelLabel = (fuel: string): string => {
  switch (fuel) {
    case 'HVO100':
      return 'HVO100';
    case 'Annet biodrivstoff':
      return 'Annet biodrivstoff';
    case 'Diesel (Euro 6)':
      return 'Diesel (Euro 6)';
    default:
      return fuel || '—';
  }
};

// Machine section component
const MachineSection: React.FC<{ machine: Machine; index: number }> = ({ machine, index }) => (
  <View style={styles.machineCard} wrap={false}>
    <Text style={styles.machineHeader}>Maskin {index + 1}: {getMachineTypeLabel(machine)}</Text>
    <View style={styles.table}>
      <TableRow label="Periode" value={`${machine.startDate || '—'} til ${machine.endDate || '—'}`} />
      <TableRow label="Årsak" value={getReasonLabels(machine.reasons)} striped />
      <TableRow label="Markedsundersøkelse bekreftet" value={machine.marketSurveyConfirmed ? 'Ja' : 'Nei'} />
      {machine.surveyedCompanies && (
        <TableRow label="Undersøkte leverandører" value={machine.surveyedCompanies} striped />
      )}
      <TableRow label="Erstatningsmaskin" value={machine.replacementMachine || '—'} />
      <TableRow label="Drivstoff" value={getFuelLabel(machine.replacementFuel)} striped />
    </View>
    <TextBlock title="Detaljert begrunnelse:" content={machine.detailedReasoning} />
    <TextBlock title="Arbeidsbeskrivelse:" content={machine.workDescription} />
    <TextBlock title="Alternative løsninger vurdert:" content={machine.alternativeSolutions} />
  </View>
);

// Infrastructure section component
const InfrastructureSection: React.FC<{ infrastructure: FormData['infrastructure'] }> = ({ infrastructure }) => (
  <View wrap={false}>
    <Text style={styles.mainTitle}>Anleggsstrøm</Text>
    <View style={styles.table}>
      <TableRow
        label="Mobilbatteri vurdert"
        value={infrastructure.mobileBatteryConsidered ? 'Ja' : 'Nei'}
      />
      <TableRow
        label="Midlertidig nettilkobling vurdert"
        value={infrastructure.temporaryGridConsidered ? 'Ja' : 'Nei'}
        striped
      />
    </View>
    <TextBlock title="Beskrivelse av strømtilgang:" content={infrastructure.powerAccessDescription} />
    <TextBlock title="Prosjektspesifikke forhold:" content={infrastructure.projectSpecificConditions} />
    <TextBlock title="Kostnadsvurdering:" content={infrastructure.costAssessment} />
    <TextBlock title="Erstatningsløsning:" content={infrastructure.infrastructureReplacement} />
    <TextBlock title="Alternative metoder:" content={infrastructure.alternativeMethods} />
  </View>
);

// Main document component
const FravikPdfDocument: React.FC<{ data: FormData }> = ({ data }) => {
  const hasMachines = data.applicationType === 'machine' && data.machines.length > 0;
  const hasInfrastructure = data.applicationType === 'infrastructure';

  // Calculate total pages: 1 main + machine pages if needed
  const totalPages = 1 + (hasMachines && data.machines.length > 3 ? 1 : 0);

  return (
    <Document
      title={`Fraviksøknad - ${data.projectName || 'Uten tittel'}`}
      author="Oslo Kommune"
    >
      <Page size="A4" style={styles.page}>
        <Header />

        {/* Title and urgent badge */}
        <Text style={styles.title}>{data.projectName || 'Uten tittel'}</Text>

        {data.isUrgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentBadgeText}>HASTEBEHANDLING</Text>
          </View>
        )}

        {/* Project info box */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Prosjektnummer:</Text>
            <Text style={styles.infoValue}>{data.projectNumber || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hovedentreprenør:</Text>
            <Text style={styles.infoValue}>{data.mainContractor || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kontraktsgrunnlag:</Text>
            <Text style={styles.infoValue}>{data.contractBasis || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Innsendt av:</Text>
            <Text style={styles.infoValue}>{data.submittedBy || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Navn på innsender:</Text>
            <Text style={styles.infoValue}>{data.submitterName || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Frist for svar:</Text>
            <Text style={styles.infoValue}>{data.deadline || '—'}</Text>
          </View>
        </View>

        {/* Application details */}
        <Text style={styles.mainTitle}>Søknadsdetaljer</Text>
        <View style={styles.table}>
          <TableRow label="Søknadstype" value={getApplicationTypeLabel(data.applicationType)} />
          <TableRow label="Primær driver" value={getPrimaryDriverLabel(data.primaryDriver)} striped />
        </View>

        {data.isUrgent && data.urgencyReason && (
          <TextBlock title="Begrunnelse for hastebehandling:" content={data.urgencyReason} />
        )}

        {/* Machines section */}
        {hasMachines && (
          <View>
            <Text style={styles.mainTitle}>Maskiner ({data.machines.length})</Text>
            {data.machines.map((machine, index) => (
              <MachineSection key={machine.id} machine={machine} index={index} />
            ))}
          </View>
        )}

        {/* Infrastructure section */}
        {hasInfrastructure && (
          <InfrastructureSection infrastructure={data.infrastructure} />
        )}

        {/* Consequences section */}
        <Text style={styles.mainTitle}>Konsekvenser og avbøtende tiltak</Text>
        <TextBlock title="Avbøtende tiltak:" content={data.mitigatingMeasures} />
        <TextBlock title="Konsekvenser ved avslag:" content={data.consequencesOfRejection} />

        {/* Advisor assessment */}
        {data.advisorAssessment && (
          <View>
            <Text style={styles.mainTitle}>Rådgivervurdering</Text>
            <TextBlock title="Vurdering fra rådgiver:" content={data.advisorAssessment} />
          </View>
        )}

        {/* Metadata footer */}
        <View style={styles.metadataFooter}>
          <Text style={styles.metadataText}>
            Generert av: {data.submitterName || 'Ukjent'} | System: Fraviksøknad - Utslippsfri byggeplass | Oslo Kommune
          </Text>
        </View>

        <Footer pageNumber={1} totalPages={totalPages} />
      </Page>
    </Document>
  );
};

// Export function to generate and download PDF
export const generateFravikPdf = async (data: FormData): Promise<void> => {
  const blob = await pdf(<FravikPdfDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filename = `Fraviksoknad_${data.projectNumber || 'soknad'}_${new Date().toISOString().split('T')[0]}.pdf`;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default FravikPdfDocument;
