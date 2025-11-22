# Pseudokode for Python 
# Pseudokode for Python Backend (Oppdatert for lagring og saksbehandling)

# --- HJELPEFUNKSJONER FOR LAGRING ---
def save_to_storage(id, data):
    # Dette er "Single Source of Truth"
    # I prototype: Skriver/oppdaterer en rad i en CSV-fil basert på ID
    # I prod: Skriver til Dataverse / SQL
    db.upsert(id, data) 

def get_from_storage(id):
    # Henter lagret JSON-data for saksbehandling
    return db.get(id)

# --- ENDEPUNKT 1: INNSENDING (Både søknad og vedtak) ---
def handle_submit(request):
    # 1. Parse innkommende data
    json_data = json.loads(request.form['data'])
    files = request.files
    
    # Hent ut metadata
    meta = json_data['meta']
    source = meta['source']       # 'catenda', 'invited', eller 'standalone'
    sub_id = meta['submissionId'] # Den unike ID-en generert av frontend
    
    # Sjekk status: Er dette en ny søknad eller et vedtak?
    # Vi vet det er et vedtak hvis 'processing'-feltet er fylt ut
    is_decision = (
        'processing' in json_data 
        and json_data['processing']['projectLeaderDecision'] != ""
    )

    # 2. LAGRING (Kritisk steg for robusthet)
    # Vi lagrer alltid dataene først. Da har vi historikk og backup.
    # Hvis saken finnes fra før, oppdateres den med vedtaket.
    save_to_storage(sub_id, json_data)

    # 3. GENERER DOKUMENTASJON
    # Genererer en fersk PDF som inneholder ALT (både søknad og evt. vedtak)
    pdf_file = generate_pdf(json_data)

    # 4. INTEGRASJONER (Ruting basert på kilde og status)
    
    if source == 'catenda':
        # --- CATENDA FLYT ---
        case_id = meta['externalCaseId']
        
        # Last opp PDF til saken i Catenda (dokumenterer øyeblikket)
        doc_id = catenda_api.upload_document(case_id, pdf_file)
        
        if is_decision:
            # SCENARIO: Vedtak fattet
            beslutning = json_data['processing']['projectLeaderDecision']
            catenda_api.post_comment(
                case_id, 
                f"Søknaden er behandlet. Vedtak: {beslutning}. Se vedlagt protokoll.", 
                attachments=[doc_id]
            )
            # Evt. endre status/label i Catenda
            catenda_api.set_status(case_id, "Closed" if beslutning == "approved" else "Open")
        else:
            # SCENARIO: Ny søknad
            catenda_api.post_comment(
                case_id, 
                "Ny fravikssøknad er sendt inn. Se vedlegg.", 
                attachments=[doc_id]
            )

    else: 
        # --- STANDALONE / INVITED FLYT (E-post) ---
        recipient_bh = "miljoradgiver@oslobygg.no" 
        # Finn søkers e-post (enten fra innlogging eller inntastet felt)
        recipient_user = meta.get('user', {}).get('email') or json_data.get('submitterEmail')

        if is_decision:
            # SCENARIO: Vedtak fattet -> Send svar UT til søker
            if recipient_user:
                smtp.send_email(
                    to=recipient_user,
                    subject=f"Svar på fravikssøknad: {json_data['projectName']}",
                    body=f"Din søknad er behandlet.\nVedtak: {json_data['processing']['projectLeaderDecision']}.\nSe vedlegg for detaljer.",
                    attachments=[pdf_file]
                )
        else:
            # SCENARIO: Ny søknad -> Send varsel INN til saksbehandler
            # Inkluderer "Magic Link" for å åpne saken direkte i behandlingsmodus
            process_link = f"https://skjema.oslobygg.no/?mode=process&id={sub_id}"
            
            smtp.send_email(
                to=recipient_bh, 
                subject=f"Ny fravikssøknad mottatt: {json_data['projectName']}",
                body=f"En ny søknad har kommet inn.\n\nKlikk her for å behandle saken: {process_link}",
                attachments=[pdf_file, files]
            )
            
            # Send kvittering til søker
            if recipient_user:
                smtp.send_email(
                    to=recipient_user, 
                    subject="Kvittering på innsendt søknad", 
                    body="Vi har mottatt din søknad..."
                )

    return "OK"

# --- ENDEPUNKT 2: HENTING (Kun for saksbehandling) ---
def get_submission(request):
    # Brukes når saksbehandler klikker på lenken i e-posten/Catenda
    id = request.args.get('id')
    
    # Hent JSON fra lagring (CSV/DB)
    data = get_from_storage(id)
    
    if not data:
        return 404, "Søknad ikke funnet"
        
    return json.dumps(data)
