# Changelog

Tutte le modifiche significative al progetto sono documentate qui.
Formato: `[versione] — data — descrizione`

---

## [1.12.0] — 2026-06-09

### Aggiunto
- **PRList**: incremento PR (`^ +Xkg`) visibile sotto il nome esercizio in ogni card
- **Changelog**: questo file, con storia completa delle versioni

### Modificato
- **ExerciseLogging**: numero PR attuale ora in verde accento (`var(--lime)`)
- **Dashboard**: blocco "Ultimo PR" spostato dopo il calendario streak (non più in cima)
- **ExerciseList (da Profilo)**: rimosso il valore PR, rimossa la banda colorata a sinistra; aggiunta label tag colorata (es. `#spalle`) sotto il nome esercizio
- **PRList**: valore kg molto più prominente (font 22px bold), layout card aggiornato
- **package.json**: versione allineata a `1.12.0`

---

## [1.11.0] — 2026-06-08

### Aggiunto
- **ExerciseLogging**: card "PR attuale" con trofeo, numero grande e card PR dell'altro utente
- **Dashboard**: calendario streak stile Duolingo con contatore, navigazione mesi, card slancio/riposo e griglia giorni evidenziati in verde
- **ExerciseList**: pulsante back aggiunto alla lista esercizi accessibile dal profilo
- **Tutte le schermate con back**: layout sticky unificato (freccia + titolo inline)

### Modificato
- **ExerciseDetail**: convertito a layout `screen` con header sticky; CTA "Aggiungi PR" verde
- **ExerciseCreate**: convertito a layout `screen` con header sticky
- **PRList**: bottone "Aggiungi PR" verde (`var(--lime)`)
- **page.tsx**: propagazione props `workoutStreak`, `otherEntries`, `otherName`, `onBack`

---

## [1.10.0] — precedente

### Aggiunto
- Sync realtime per tutte le tabelle workout (sessions, exercises, day_assignments)
- Icona luna/stelle per giorni di riposo nelle schede
- Bottone "+" nelle schede allenamento
- Link esercizi dal profilo
- Fix eliminazione esercizi

---

## [1.9.0] — precedente

### Aggiunto
- Tab "Overview" / Dashboard
- Rimozione label "Diario" dal tab bar
- UI polish generale, gestione esercizi dal profilo
- Sostituzione emoji con icone Phosphor

---

## [1.8.0] — precedente

### Aggiunto
- Redesign completo da "PR Tracker" a "Workout Tracker"
- Struttura a tab: Dashboard, Lista PR, Diario, Profilo
- Integrazione Supabase per workout sessions e day assignments
- Calendario allenamenti

---

## [1.0.0] — precedente

### Aggiunto
- Commit iniziale: PR Tracker v1 — Next.js 15 + TypeScript + Supabase
- Tracciamento PR per esercizi
- Due utenti: Base e Dawg
- Icone Phosphor, layout responsive mobile
