# PulseChecks Rendering Issue Analysis

## Problem Identified

The rendering code in OpportunityDetail.jsx (lines 1011-1096 and 1100-1168) expects a **modern pulseChecks format**, but 8 out of 9 esperando opportunities use a **legacy format**.

### Rendering Code (Line 1100-1116)

```javascript
{op.pulseChecks.map((pc, idx) => {
  const pcDate = new Date(pc.date + 'T00:00:00')              // ← Expects pc.date
  const pcDateStr = pcDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  const partnerDate = pc.partnerResponse?.date ? new Date(pc.partnerResponse.date + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  return (
    <div key={idx}>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '16px'}}>
        <div style={{...}}>
          <p style={{margin: 0, fontFamily: 'DM Sans', fontSize: '14px', color: '#F5F7F7', lineHeight: 1.5}}>
            {pc.message}                                       // ← Expects pc.message
          </p>
          <p style={{margin: '4px 0 0', fontFamily: 'DM Sans', fontSize: '10px', color: '#6F7876'}}>
            Enviado ✓ · {pcDateStr}
          </p>
        </div>
      </div>
      {pc.partnerResponse && (                                 // ← Expects pc.partnerResponse
        <div style={{...}}>
          {pc.partnerResponse.type === 'quick' ? (
            <>
              <div>✓ {pc.partnerResponse.text}</div>
            </>
          ) : (
            <div>
              <p>{pc.partnerResponse.text}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
})}
```

## Data Format Mismatch

### Modern Format (ID 2 - Works ✓)
```javascript
{
  id: 'e2a',
  date: '2026-05-20',                    // ✓ Has 'date'
  type: 'auto',
  sentBy: 'Carlos',
  message: 'Hola, ¿cómo va el proceso...', // ✓ Has 'message'
  status: 'respondido',
  partnerResponse: {                     // ✓ Has 'partnerResponse'
    type: 'quick',
    text: 'En negociación',
    date: '2026-05-21'
  }
}
```

### Legacy Format (IDs 5, 6, 10, 20, 23, 24, 25, 26 - Broken ✗)
```javascript
{
  fecha: '2026-06-19',                                        // ✗ Has 'fecha', not 'date'
  destinatario: 'Daniela Restrepo (Nimbus Partners)',        // ✗ Has 'destinatario', not 'message'
  estado: 'Enviado'                                           // ✗ Has 'estado', not 'partnerResponse'
}
```

## What Happens When Legacy Format is Used

1. `pc.date` is **undefined** → `new Date(undefined + 'T00:00:00')` → Invalid Date
2. `pc.message` is **undefined** → Shows blank message
3. `pc.partnerResponse` is **undefined** → Partner response section not rendered
4. `pcDateStr` from Invalid Date → Shows "Invalid Date"

## Opportunities Affected

| ID | Format | Status | Issue |
|---|---|---|---|
| 2 | Modern | ✓ Works | Messages render correctly |
| 5 | Legacy | ✗ Broken | No message text, Invalid Date |
| 6 | Legacy | ✗ Broken | No message text, Invalid Date |
| 10 | Legacy | ✗ Broken | No message text, Invalid Date |
| 20 | Legacy | ✗ Broken | No message text, Invalid Date |
| 23 | Legacy | ✗ Broken | No message text, Invalid Date |
| 24 | Legacy | ✗ Broken | No message text, Invalid Date |
| 25 | Legacy | ✗ Broken | No message text, Invalid Date |
| 26 | Legacy | ✗ Broken | No message text, Invalid Date |

## Solution Options

### Option 1: Update Rendering Code to Handle Both Formats
Add fallback logic to handle legacy format:
```javascript
{op.pulseChecks.map((pc, idx) => {
  const dateStr = pc.date || pc.fecha
  const messageStr = pc.message || `Pulse Check enviado a ${pc.destinatario}`
  const pcDate = new Date(dateStr + 'T00:00:00')
  const hasResponse = pc.partnerResponse || (pc.estado === 'Respondido')
  
  // Continue rendering...
})}
```

### Option 2: Migrate All Legacy Data to Modern Format (Recommended)
Convert all 8 legacy format pulseChecks to modern format for consistency.

### Option 3: Use Legacy Format Rendering
Revert to original legacy format rendering logic for those opportunities.

## Recommendation
**Option 2** - Migrate all esperando opportunities to the modern format for consistency and to ensure the new rendering code works properly for all opportunities.
