# Pseudokode for Python Backend

def handle_submit(request):
    data = json.loads(request.form['data'])
    files = request.files
    
    source = data['meta']['source'] # 'catenda', 'invited', eller 'standalone'

    # Generer PDF av dataene (felles for alle)
    pdf_file = generate_pdf(data)

    if source == 'catenda':
        # Brukeren kom fra Catenda -> Last opp PDF tilbake til Catenda
        case_id = data['meta']['externalCaseId']
        catenda_api.upload_document(case_id, pdf_file)
        catenda_api.post_comment(case_id, "Ny fravikssøknad mottatt.")
    
    else:
        # Brukeren er Standalone eller Invitert -> Send E-post
        # (Her bruker vi e-posten som ligger i dataene, enten pre-utfylt eller inntastet)
        recipient = "miljoradgiver@oslobygg.no" # Eller hentet fra prosjekt-config
        smtp.send_email(
            to=recipient, 
            subject=f"Fravikssøknad: {data['projectName']}",
            attachments=[pdf_file, files]
        )

    return "OK"
