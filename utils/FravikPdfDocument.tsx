import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import type { FormData, Machine } from '../types';

// --- KONFIGURASJON OG STILER ---

const COLORS = {
  primary: '#2A2859',
  ink: '#2C2C2C',
  white: '#FFFFFF',
  lightBg: '#F8F0DD',
  success: '#034B45',
  successBg: '#C7F6C9',
  warning: '#F9C66B',
  warningBg: '#F8F0DD',
  neutral: '#D0BFAE',
  neutralBg: '#F8F0DD',
  inkDim: '#4D4D4D',
  muted: '#666666',
  border: '#E6E6E6',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 100, // Plass til header
    paddingLeft: 42,
    paddingRight: 42,
    paddingBottom: 60, // Plass til footer
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: COLORS.ink,
    lineHeight: 1.4,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    padding: '12 42',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {},
  headerLogo: { height: 60 },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#FFFFFF',
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
  },
  footerText: {
    fontSize: 8,
    color: COLORS.muted,
    fontFamily: 'Helvetica',
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
  infoRow: { flexDirection: 'row', marginBottom: 6 },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.inkDim,
    width: 140,
  },
  infoValue: { fontSize: 9, color: COLORS.ink, flex: 1 },
  mainTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 18,
    marginBottom: 10,
  },
  table: { marginBottom: 10 },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
  },
  tableRowStriped: { backgroundColor: '#F5F5F5' },
  tableLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    width: '45%',
    paddingRight: 10,
    color: COLORS.inkDim,
  },
  tableValue: { fontSize: 9, width: '55%', color: COLORS.ink },
  textBlock: { marginBottom: 10 },
  textBlockTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.inkDim,
    marginBottom: 4,
  },
  textBlockContent: { fontSize: 9, lineHeight: 1.5, paddingLeft: 5 },
  urgentBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  urgentBadgeText: { fontSize: 8, fontWeight: 'bold', color: COLORS.ink },
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
  metadataFooter: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metadataText: { fontSize: 7, color: COLORS.muted },
});

// --- HJELPEKOMPONENTER ---

const Header: React.FC = () => (
  <View style={styles.header} fixed>
    <View style={styles.headerContent}>
      <Text style={styles.headerTitle}>Fraviksøknad - Utslippsfri byggeplass</Text>
      <Text style={styles.headerSubtitle}>Oslo Kommune</Text>
    </View>
    <Image
      src="/Fravik_utslippsfribyggeplass/logos/Oslo-logo-hvit-RGB.png"
      style={styles.headerLogo}
    />
  </View>
);

const Footer: React.FC<{ pageNumber: number; totalPages: number }> = ({ pageNumber, totalPages }) => {
  const generatedDate = new Date().toLocaleDateString('no-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const generatedTime = new Date().toLocaleTimeString('no-NO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{`Generert: ${generatedDate} kl. ${generatedTime}`}</Text>
      <Text style={styles.footerText}>{`Side ${pageNumber} av ${totalPages}`}</Text>
    </View>
  );
};

const TableRow: React.FC<{ label: string; value: string; striped?: boolean }> = ({
  label,
  value,
  striped,
}) => (
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

// --- LOGIKK-HJELPERE ---

const getApplicationTypeLabel = (type: string) =>
  ({
    'machine': 'Spesifikk maskin / kjøretøy',
    'infrastructure': 'Elektrisk infrastruktur på byggeplass',
  }[type] || type || '—');

const getMachineTypeLabel = (machine: Machine) =>
  machine.type === 'Annet' && machine.otherType ? `Annet: ${machine.otherType}` : machine.type || '—';

const getReasonLabels = (reasons: string[]) =>
  reasons && reasons.length > 0 ? reasons.join(', ') : '—';

const getFuelLabel = (fuel: string) =>
  ({
    'HVO100': 'HVO100',
    'Annet biodrivstoff': 'Annet biodrivstoff',
    'Diesel (Euro 6)': 'Diesel (Euro 6)',
  }[fuel] || fuel || '—');

const formatTimestamp = (isoTimestamp?: string): string => {
  if (!isoTimestamp) return '—';
  try {
    const date = new Date(isoTimestamp);
    const dateStr = date.toLocaleDateString('no-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('no-NO', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dateStr} kl. ${timeStr}`;
  } catch {
    return '—';
  }
};

// --- INNHOLDSSEKSJONER ---

const ProjectInfoSection: React.FC<{ data: FormData }> = ({ data }) => (
  <View>
    <View wrap={false}>
      <Text style={styles.title}>{data.projectName || 'Uten tittel'}</Text>
      {data.isUrgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentBadgeText}>HASTEBEHANDLING</Text>
        </View>
      )}
    </View>

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
        <Text style={styles.infoLabel}>Rammeavtale:</Text>
        <Text style={styles.infoValue}>{data.frameworkAgreement || '—'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Navn på innsender:</Text>
        <Text style={styles.infoValue}>{data.submitterName || '—'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Frist for svar:</Text>
        <Text style={styles.infoValue}>{data.deadline || '—'}</Text>
      </View>
      {data.submittedAt && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Innsendt:</Text>
          <Text style={styles.infoValue}>{formatTimestamp(data.submittedAt)}</Text>
        </View>
      )}
      {data.lastUpdatedAt && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sist oppdatert:</Text>
          <Text style={styles.infoValue}>{formatTimestamp(data.lastUpdatedAt)}</Text>
        </View>
      )}
    </View>

    <View>
      <Text style={styles.mainTitle}>Søknadsdetaljer</Text>
      <View style={styles.table}>
        <TableRow label="Søknadstype" value={getApplicationTypeLabel(data.applicationType)} />
      </View>
      {data.isUrgent && data.urgencyReason && (
        <TextBlock title="Begrunnelse for hastebehandling:" content={data.urgencyReason} />
      )}
    </View>
  </View>
);

const MachineSection: React.FC<{ machine: Machine; index: number }> = ({ machine, index }) => (
  <View style={styles.machineCard}>
    <Text style={styles.machineHeader}>Maskin {index + 1}: {getMachineTypeLabel(machine)}</Text>
    <View style={styles.table}>
      <TableRow label="Periode" value={`${machine.startDate || '—'} til ${machine.endDate || '—'}`} />
      <TableRow label="Årsak" value={getReasonLabels(machine.reasons)} striped />
      <TableRow
        label="Markedsundersøkelse bekreftet"
        value={machine.marketSurveyConfirmed ? 'Ja' : 'Nei'}
      />
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

const InfrastructureSection: React.FC<{ infrastructure: FormData['infrastructure'] }> = ({
  infrastructure,
}) => (
  <View>
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

const ConsequencesAndAdvisorSection: React.FC<{ data: FormData }> = ({ data }) => (
  <View>
    <Text style={styles.mainTitle}>Konsekvenser og avbøtende tiltak</Text>
    <TextBlock title="Avbøtende tiltak:" content={data.mitigatingMeasures} />
    <TextBlock title="Konsekvenser ved avslag:" content={data.consequencesOfRejection} />

    {data.advisorAssessment && (
      <View style={{ marginTop: 20 }}>
        <Text style={styles.mainTitle}>Rådgivervurdering</Text>
        <TextBlock title="Vurdering fra rådgiver:" content={data.advisorAssessment} />
      </View>
    )}

    <View style={styles.metadataFooter}>
      <Text style={styles.metadataText}>
        Generert av: {data.submitterName || 'Ukjent'} | System: Fraviksøknad - Utslippsfri byggeplass | Oslo Kommune
      </Text>
    </View>
  </View>
);

const ProcessingSection: React.FC<{ data: FormData }> = ({ data }) => {
  const getRecommendationLabel = (rec: string) => {
    if (rec === 'approved') return 'Godkjent ✅';
    if (rec === 'partially_approved') return 'Delvis godkjent ⚠️';
    if (rec === 'rejected') return 'Avslått ❌';
    return '—';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'submitted': 'Innsendt',
      'awaiting_boi_review': 'Venter på BOI-vurdering',
      'awaiting_ent_revision': 'Venter på oppdatering fra ENT',
      'awaiting_pl_review': 'Venter på prosjektleder-vurdering',
      'awaiting_group_review': 'Venter på arbeidsgruppens vurdering',
      'awaiting_owner_decision': 'Venter på prosjekteiers beslutning',
      'approved': 'Godkjent ✅',
      'partially_approved': 'Delvis godkjent ⚠️',
      'rejected': 'Avslått ❌',
    };
    return labels[status] || '—';
  };

  const hasProcessingData = data.processing.boiAssessment || data.processing.plAssessment || data.processing.groupAssessment || data.processing.ownerAgreesWithGroup;

  if (!hasProcessingData) return null;

  return (
    <View>
      <Text style={styles.mainTitle}>Saksbehandling (Intern)</Text>

      {data.processing.status && (
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>{getStatusLabel(data.processing.status)}</Text>
          </View>
        </View>
      )}

      {/* BOI Vurdering */}
      {data.processing.boiAssessment && (
        <View style={{ marginTop: 15 }}>
          <Text style={styles.textBlockTitle}>Rådgiver (BOI) vurdering:</Text>
          <View style={styles.table}>
            <TableRow
              label="Dokumentasjon tilstrekkelig?"
              value={data.processing.boiDocumentationSufficient === 'yes' ? 'Ja' : data.processing.boiDocumentationSufficient === 'no' ? 'Nei' : '—'}
            />
            {data.processing.boiRecommendation && (
              <TableRow
                label="Anbefaling"
                value={getRecommendationLabel(data.processing.boiRecommendation)}
                striped
              />
            )}
            {data.processing.boiReviewedAt && (
              <TableRow
                label="Vurdert"
                value={formatTimestamp(data.processing.boiReviewedAt) + (data.processing.boiReviewedBy ? ` av ${data.processing.boiReviewedBy}` : '')}
              />
            )}
          </View>
          <TextBlock title="Vurdering:" content={data.processing.boiAssessment} />
        </View>
      )}

      {/* PL Vurdering */}
      {data.processing.plAssessment && (
        <View style={{ marginTop: 15 }}>
          <Text style={styles.textBlockTitle}>Prosjektleder vurdering:</Text>
          <View style={styles.table}>
            <TableRow
              label="Dokumentasjon tilstrekkelig?"
              value={data.processing.plDocumentationSufficient === 'yes' ? 'Ja' : data.processing.plDocumentationSufficient === 'no' ? 'Nei' : '—'}
            />
            {data.processing.plRecommendation && (
              <TableRow
                label="Anbefaling"
                value={getRecommendationLabel(data.processing.plRecommendation)}
                striped
              />
            )}
            {data.processing.plReviewedAt && (
              <TableRow
                label="Vurdert"
                value={formatTimestamp(data.processing.plReviewedAt) + (data.processing.plReviewedBy ? ` av ${data.processing.plReviewedBy}` : '')}
              />
            )}
          </View>
          <TextBlock title="Vurdering:" content={data.processing.plAssessment} />
        </View>
      )}

      {/* Arbeidsgruppen */}
      {data.processing.groupAssessment && (
        <View style={{ marginTop: 15 }}>
          <Text style={styles.textBlockTitle}>Arbeidsgruppens vurdering:</Text>
          <View style={styles.table}>
            <TableRow
              label="Innstilling"
              value={getRecommendationLabel(data.processing.groupRecommendation)}
            />
            {data.processing.groupReviewedAt && (
              <TableRow
                label="Vurdert"
                value={formatTimestamp(data.processing.groupReviewedAt) + (data.processing.groupReviewedBy ? ` av ${data.processing.groupReviewedBy}` : '')}
                striped
              />
            )}
          </View>
          <TextBlock title="Begrunnelse:" content={data.processing.groupAssessment} />
        </View>
      )}

      {/* Prosjekteier */}
      {data.processing.ownerAgreesWithGroup && (
        <View style={{ marginTop: 15 }}>
          <Text style={styles.textBlockTitle}>Prosjekteiers beslutning:</Text>
          <View style={styles.table}>
            <TableRow
              label="Enig med arbeidsgruppen?"
              value={data.processing.ownerAgreesWithGroup === 'yes' ? 'Ja' : 'Nei'}
            />
            {data.processing.ownerDecidedAt && (
              <TableRow
                label="Besluttet"
                value={formatTimestamp(data.processing.ownerDecidedAt) + (data.processing.ownerDecidedBy ? ` av ${data.processing.ownerDecidedBy}` : '')}
                striped
              />
            )}
          </View>
          {data.processing.ownerJustification && (
            <TextBlock title="Begrunnelse:" content={data.processing.ownerJustification} />
          )}
          {data.processing.ownerAgreesWithGroup === 'yes' && data.processing.groupRecommendation && (
            <View style={[styles.infoBox, { marginTop: 10 }]}>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                Endelig beslutning: {getRecommendationLabel(data.processing.groupRecommendation)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// --- HOVEDDOKUMENT ---

const FravikPdfDocument: React.FC<{ data: FormData }> = ({ data }) => {
  const hasMachines = data.applicationType === 'machine' && data.machines.length > 0;
  const hasInfrastructure = data.applicationType === 'infrastructure';
  const hasProcessingData = data.processing.boiAssessment || data.processing.plAssessment || data.processing.groupAssessment || data.processing.ownerAgreesWithGroup;

  // BEREGN ANTALL SIDER MANUELT
  // Side 1: Alltid Prosjektinfo
  // Side 2..N: Innhold (Maskiner eller Infrastruktur)
  // Side N+1: Konsekvenser og Rådgiver (Konklusjon)
  // Side N+2: Saksbehandling (hvis data finnes)

  let contentPages = 0;
  if (hasMachines) {
    // 1 side per maskin for oversiktens skyld
    contentPages = data.machines.length;
  } else if (hasInfrastructure) {
    // Infrastruktur tar typisk 1 side
    contentPages = 1;
  }

  // Total: Startside + Innholdssider + Sluttside + (Processing hvis den finnes)
  const totalPages = 1 + contentPages + 1 + (hasProcessingData ? 1 : 0);

  return (
    <Document
      title={`Fraviksøknad - ${data.projectName || 'Uten tittel'}`}
      author="Oslo Kommune"
    >
      {/* SIDE 1: PROSJEKTINFORMASJON */}
      <Page size="A4" style={styles.page}>
        <Header />
        <ProjectInfoSection data={data} />
        <Footer pageNumber={1} totalPages={totalPages} />
      </Page>

      {/* SIDER FOR MASKINER (EN PER SIDE) */}
      {hasMachines &&
        data.machines.map((machine, index) => (
          <Page key={machine.id} size="A4" style={styles.page}>
            <Header />
            <Text style={styles.mainTitle}>
              Maskiner det søkes fravik for ({index + 1} av {data.machines.length})
            </Text>
            <MachineSection machine={machine} index={index} />
            {/* pageNumber starter på 2 (etter info-siden) */}
            <Footer pageNumber={2 + index} totalPages={totalPages} />
          </Page>
        ))}

      {/* SIDE FOR INFRASTRUKTUR */}
      {hasInfrastructure && (
        <Page size="A4" style={styles.page}>
          <Header />
          <InfrastructureSection infrastructure={data.infrastructure} />
          <Footer pageNumber={2} totalPages={totalPages} />
        </Page>
      )}

      {/* SIDE: KONSEKVENSER OG RÅDGIVER */}
      <Page size="A4" style={styles.page}>
        <Header />
        <ConsequencesAndAdvisorSection data={data} />
        <Footer pageNumber={hasProcessingData ? totalPages - 1 : totalPages} totalPages={totalPages} />
      </Page>

      {/* SISTE SIDE: SAKSBEHANDLING (hvis data finnes) */}
      {hasProcessingData && (
        <Page size="A4" style={styles.page}>
          <Header />
          <ProcessingSection data={data} />
          <Footer pageNumber={totalPages} totalPages={totalPages} />
        </Page>
      )}
    </Document>
  );
};

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

/**
 * Generate PDF blob for preview (returns blob directly for react-pdf)
 */
export const generateFravikPdfBlob = async (data: FormData): Promise<Blob> => {
  const blob = await pdf(<FravikPdfDocument data={data} />).toBlob();
  return blob;
};

export default FravikPdfDocument;
