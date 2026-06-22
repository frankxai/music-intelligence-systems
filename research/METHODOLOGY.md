# Research Methodology

The Music Intelligence System research framework follows a bounded loop: hypothesis → mechanism → params → artifact → eval. Every claim requires an evidence grade before it enters any agent, export, or product copy.

## Evidence Grades

| Grade | Definition | Threshold |
|---|---|---|
| **Strong** | ≥2 peer-reviewed RCTs or systematic reviews with consistent direction | Can be stated as established finding |
| **Preliminary** | 1 RCT or multiple observational studies pointing the same direction | Must include "research suggests" framing |
| **Anecdotal** | Case reports, practitioner consensus, or single small studies | Must flag as anecdotal or under-studied |

No research claim ships without an explicit grade. Agents that make music-psychology claims cite the grade in their Expertise section.

## The Loop

```
1. HYPOTHESIS
   └── State the specific claim (e.g., "60–80 BPM tracks reduce cortisol markers")
       └── Identify the mechanism (entrainment, tempo coupling, autonomic regulation)

2. LITERATURE SCAN
   └── Search: PubMed, Cochrane, PsycINFO, Google Scholar
   └── Filter: RCT > observational > case study > expert opinion
   └── Grade the evidence (Strong / Preliminary / Anecdotal)

3. PARAMETER EXTRACTION
   └── Convert findings to actionable prompt parameters:
       BPM range, key/mode, instrumentation, texture, dynamics, duration
   └── Identify confounds (genre preference, individual differences, context)

4. ARTIFACT GENERATION
   └── Generate tracks via Suno or other platforms using derived parameters
   └── Document the exact prompt and generation settings

5. EVALUATION
   └── Subjective: rate using the target state's mood scale (PANAS, DASS, custom VAS)
   └── Objective (if accessible): HRV, EDA, cortisol (research-grade only)
   └── Null result is a valid and publishable outcome
   └── Log to experiments/
```

## What Counts as a Valid Mechanism

We require a plausible, testable mechanism — not just correlation. Accepted mechanisms:

- **Tempo entrainment**: cardiovascular and neural rhythms synchronize to steady beat frequencies (supported, Strong evidence for heart rate coupling)
- **Mode/valence coupling**: major mode biases toward positive valence; minor toward negative — a tendency, not a law (Preliminary; individual and cultural variation is large)
- **ISO principle**: musical state-matching followed by gradual guidance (clinical music therapy; Preliminary for non-clinical use)
- **Binaural beat entrainment**: EEG frequency following reported for delta/theta binaural beats (Preliminary; effect sizes vary significantly across studies)
- **Lyric priming**: affirmation-style first-person lyrics activate self-referential processing (Preliminary from neuroimaging; limited RCT data)

Unaccepted mechanism claims: "raises vibration", "activates DNA", "quantum healing", "528 Hz repairs DNA" — these lack falsifiable mechanisms and must not appear in any hub output.

## Citing Sources

Use APA 7 in SOURCES.md. In agent copy, use plain-language attribution: "research suggests" (Preliminary), "studies consistently show" (Strong), "practitioners report" (Anecdotal). Never cite paper names you cannot verify — link to SOURCES.md instead.

## Experiment Logging

All experiments follow `experiments/TEMPLATE.md`. Completed experiments live in `experiments/`. Null results are logged identically to positive results — the registry is a record, not a highlight reel.
