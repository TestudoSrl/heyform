# HeyForm: creare un form e ottenere un link collaborativo

Questa guida è pensata come contesto operativo per una skill Codex/Claude. Descrive come
creare, configurare e pubblicare un form HeyForm, quindi generare un link che consente a più
persone di compilare insieme una singola risposta.

## Prerequisiti

La funzionalità `createCollaborativeSession` deve essere presente nel server HeyForm. È stata
introdotta dal branch `codex/collaborative-form` e non è disponibile in un'installazione upstream
che non include tale modifica.

Configurare questi valori come variabili o secret della skill:

```text
HEYFORM_BASE_URL     es. https://forms.example.com
HEYFORM_EMAIL        account autorizzato a creare form
HEYFORM_PASSWORD     password dell'account
HEYFORM_PROJECT_ID   progetto nel quale creare il form (opzionale se la skill lo cerca)
HEYFORM_DEVICE_ID    identificatore stabile e casuale del client
```

Endpoint GraphQL:

```text
${HEYFORM_BASE_URL}/graphql
```

L'autenticazione HeyForm usa un cookie HTTP di sessione. La skill deve conservare i cookie
ricevuti dal login e inviarli in tutte le chiamate autenticate successive. Deve inoltre inviare
lo stesso header `X-Device-Id` usato durante il login.

Non inserire email, password, cookie o token collaborativi nei log o nell'output pubblico.

Prima di iniziare, la skill deve conoscere almeno il titolo del form e le domande da creare. Se
questi dati mancano, deve chiederli all'utente. Non deve inventare domande sostanziali senza una
richiesta esplicita.

## Regole generali per le chiamate

- Usare `POST /graphql` con `Content-Type: application/json`.
- Inviare sempre `X-Device-Id: ${HEYFORM_DEVICE_ID}`.
- Conservare e riutilizzare i cookie (`curl --cookie-jar` e `--cookie`, oppure un cookie jar HTTP).
- Controllare sempre `response.errors`: GraphQL può restituire HTTP 200 anche in caso di errore.
- Interrompere il flusso se una chiamata restituisce `errors` o manca un valore richiesto.
- Generare ID univoci per i campi, preferibilmente stringhe casuali di 12 caratteri.

## Valori enum principali

```text
InteractiveModeEnum.GENERAL     = 1
InteractiveModeEnum.INTERACTIVE = 2
InteractiveModeEnum.POPUP       = 3

FormKindEnum.SURVEY  = 1
FormKindEnum.QUIZ    = 2
FormKindEnum.CONTACT = 3
```

Tipi di campo comuni:

```text
short_text, long_text, number, email, phone_number, url,
multiple_choice, yes_no, rating, opinion_scale, date,
date_range, full_name, address, country_selector,
file_upload, legal_terms, statement, welcome, thank_you
```

## Flusso completo

### 1. Login

Il login è una query GraphQL, anche se modifica la sessione:

```graphql
query Login($input: LoginInput!) {
  login(input: $input)
}
```

Variabili:

```json
{
  "input": {
    "email": "${HEYFORM_EMAIL}",
    "password": "${HEYFORM_PASSWORD}"
  }
}
```

La risposta deve contenere `data.login: true`. Salvare il cookie `HEYFORM_SESSION` senza
mostrarne il valore.

### 2. Individuare un progetto, se necessario

Se `HEYFORM_PROJECT_ID` non è configurato, recuperare workspace e progetti:

```graphql
query Workspaces {
  teams {
    id
    name
    projects {
      id
      name
    }
  }
}
```

Se esiste un solo progetto, usarlo. Se ne esistono più di uno e l'utente non ha indicato quale
usare, chiedere una scelta senza creare il form arbitrariamente.

### 3. Creare il form

```graphql
mutation CreateForm($input: CreateFormInput!) {
  createForm(input: $input)
}
```

Variabili consigliate per un questionario interattivo:

```json
{
  "input": {
    "projectId": "PROJECT_ID",
    "name": "Titolo del questionario",
    "interactiveMode": 2,
    "kind": 1
  }
}
```

`data.createForm` è il nuovo `formId`. La creazione iniziale produce una bozza non pubblicata
con `version = 0`.

### 4. Salvare le domande nella bozza

Costruire l'array `drafts`. Ogni campo deve avere almeno `id` e `kind`. `title` e `description`
sono valori JSON; per testo semplice usare un array contenente una stringa.

Esempio:

```json
[
  {
    "id": "question_01",
    "kind": "short_text",
    "title": ["Come ti chiami?"],
    "description": [],
    "validations": {
      "required": true
    }
  },
  {
    "id": "question_02",
    "kind": "multiple_choice",
    "title": ["Quale opzione preferisci?"],
    "description": [],
    "validations": {
      "required": true
    },
    "properties": {
      "allowMultiple": false,
      "choices": [
        {
          "id": "choice_a",
          "label": "Opzione A"
        },
        {
          "id": "choice_b",
          "label": "Opzione B"
        }
      ]
    }
  },
  {
    "id": "thank_you_01",
    "kind": "thank_you",
    "title": ["Grazie!"],
    "description": ["La risposta condivisa è stata inviata."]
  }
]
```

Salvare la bozza:

```graphql
mutation UpdateFormSchemas($input: UpdateFormSchemasInput!) {
  updateFormSchemas(input: $input) {
    version
    canPublish
    drafts {
      id
      kind
      title
      description
      validations
      properties
    }
  }
}
```

Variabili:

```json
{
  "input": {
    "formId": "FORM_ID",
    "version": 0,
    "drafts": "DRAFTS_ARRAY"
  }
}
```

Nel JSON reale, `drafts` deve essere l'array e non la stringa `"DRAFTS_ARRAY"`. Conservare la
`version` restituita, normalmente `1`.

### 5. Pubblicare il form

Usare esattamente la versione e lo stesso array di campi restituiti o inviati al passaggio
precedente:

```graphql
mutation PublishForm($input: UpdateFormSchemasInput!) {
  publishForm(input: $input)
}
```

Variabili:

```json
{
  "input": {
    "formId": "FORM_ID",
    "version": 1,
    "drafts": "DRAFTS_ARRAY"
  }
}
```

La risposta deve contenere `data.publishForm: true`. Se viene restituito
`invalid_draft_version`, rileggere il form e non sovrascrivere automaticamente le modifiche di
un altro utente.

Il link pubblico individuale è ora:

```text
${HEYFORM_BASE_URL}/form/FORM_ID
```

### 6. Creare la risposta collaborativa

Questa operazione richiede che il form sia già pubblicato e attivo:

```graphql
mutation CreateCollaborativeSession($input: CreateCollaborativeSessionInput!) {
  createCollaborativeSession(input: $input) {
    token
    formId
    values
    revision
    completed
    participantCount
  }
}
```

Variabili:

```json
{
  "input": {
    "formId": "FORM_ID"
  }
}
```

Costruire il link pubblico collaborativo usando il `token` restituito:

```text
${HEYFORM_BASE_URL}/form/FORM_ID/shared/SESSION_TOKEN
```

Il token concede accesso alla stessa risposta condivisa a chiunque possieda il link. Trattarlo
come un segreto. La sessione scade automaticamente dopo 30 giorni e può creare una sola
submission.

## Output richiesto alla skill

Al termine, restituire un risultato strutturato equivalente a:

```json
{
  "formId": "FORM_ID",
  "formName": "Titolo del questionario",
  "publicUrl": "https://forms.example.com/form/FORM_ID",
  "collaborativeUrl": "https://forms.example.com/form/FORM_ID/shared/SESSION_TOKEN",
  "collaborativeRevision": 0,
  "expiresInDays": 30
}
```

Mostrare all'utente almeno `formName`, `publicUrl` e `collaborativeUrl`. Non mostrare password,
cookie o altri dati di autenticazione.

## Gestione degli errori

| Condizione                    | Comportamento                                                  |
| ----------------------------- | -------------------------------------------------------------- |
| Login fallito                 | Fermarsi e chiedere di verificare le credenziali.              |
| Nessun progetto disponibile   | Fermarsi e chiedere di creare o indicare un progetto.          |
| Più progetti senza preferenza | Chiedere quale progetto usare.                                 |
| `invalid_draft_version`       | Non sovrascrivere; rileggere il form e segnalare il conflitto. |
| Pubblicazione fallita         | Non tentare di creare la sessione collaborativa.               |
| Form non pubblicato o vuoto   | Correggere e pubblicare prima di creare la sessione.           |
| Sessione scaduta/completata   | Creare una nuova sessione soltanto con conferma dell'utente.   |

## Note sulla compilazione collaborativa

- Tutti gli utenti dello stesso link modificano i valori della stessa sessione.
- Gli aggiornamenti vengono salvati per campo.
- Se due utenti aggiornano contemporaneamente lo stesso campo, prevale l'ultimo aggiornamento
  ricevuto dal server.
- Gli altri partecipanti ricevono gli aggiornamenti tramite polling circa ogni 1,5 secondi.
- La pagina mostra un badge che segnala la modalità collaborativa e il numero approssimativo di
  browser attivi negli ultimi 10 secondi. Il conteggio non espone gli identificativi dei
  partecipanti.
- Se nelle impostazioni del form è abilitata la password generale, viene richiesta anche aprendo
  il link collaborativo; non esiste una seconda password specifica della sessione.
- Il primo invio valido chiude atomicamente la sessione e crea l'unica submission del gruppo.
