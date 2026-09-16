# Nugget vs smell — Max Jev on ambiguous units

- **As-of:** 2026-09-16T01:47:42.803Z (box → report CT in companion)
- **Pack:** `nugget-vs-smell-pack.json` n=38 (sessions=28, prs=10)
- **Scored:** n_ok=37 n_err=1
- **Mean is_happy_nugget:** 0.247
- **Mean is_smell:** 0.801

## Primary label counts
- mixed: **35**
- smell: **2**

## Dominant category counts
- thrash: **18**
- verify: **8**
- governance: **4**
- ship_shape: **3**
- handoff: **1**
- trust: **1**
- plate_quality: **1**
- corpus_bloat: **1**

## Mixed / both-high (excerpt)
- `b06e3da7-48bc-402e-b015-5632e0be88da` label=mixed happy=0.25 smell=0.82 cat=handoff
- `b23609bb-0c9c-42ad-9894-7847b1aae21b` label=mixed happy=0.14 smell=0.88 cat=thrash
- `29896b44-5914-47fd-931d-0e13e9987b45` label=mixed happy=0.20 smell=0.83 cat=thrash
- `c585e8d6-1893-4da5-bba8-1a0295583d57` label=mixed happy=0.23 smell=0.82 cat=thrash
- `df80810e-a238-4e67-9b3e-9d60874e00fb` label=mixed happy=0.15 smell=0.86 cat=thrash
- `45147840-9cc3-425a-af77-653c89328305` label=mixed happy=0.33 smell=0.77 cat=thrash
- `a09316e9-6e8b-4e04-a7c9-30b266ec40e2` label=mixed happy=0.15 smell=0.87 cat=thrash
- `c2a77998-653b-4b18-89ae-fb1936c19a94` label=mixed happy=0.26 smell=0.67 cat=verify
- `f5892573-a6d2-4be0-97c8-f7d6f2fea820` label=mixed happy=0.26 smell=0.88 cat=thrash
- `3f9a6631-c42e-4f0a-8b5d-93b501ee09af` label=mixed happy=0.10 smell=0.90 cat=thrash
- `fae4006d-f921-462f-98be-6bc47129dd4d` label=mixed happy=0.16 smell=0.87 cat=thrash
- `64cfb0da-d449-44e6-bf35-dfe506cdbd20` label=mixed happy=0.18 smell=0.84 cat=thrash
- `202b533e-a671-491f-94f0-13a3035be0c1` label=mixed happy=0.17 smell=0.88 cat=thrash
- `87d7b686-473a-41a3-b7ab-5ac51586cda6` label=mixed happy=0.28 smell=0.70 cat=governance
- `64fde956-4c99-476a-9265-0bedb8845667` label=mixed happy=0.22 smell=0.88 cat=thrash
- `f500f5ea-ca12-454a-ac76-b093e1f8b020` label=mixed happy=0.24 smell=0.82 cat=thrash
- `b2f082d5-23b0-485a-95f1-e3dbb2a0dcc3` label=mixed happy=0.20 smell=0.87 cat=verify
- `15debbe7-70f8-44cb-a051-40a1e47dc0c4` label=mixed happy=0.25 smell=0.76 cat=verify
- `7fe3a487-279b-487f-83dd-0c637a34da0b` label=mixed happy=0.31 smell=0.67 cat=trust
- `743a6c8b-4050-48f2-8ad7-ef0adf6f16cc` label=mixed happy=0.26 smell=0.70 cat=governance

## Method
- TypeSafe SystemOne; questions: is_happy_nugget (noul), is_smell (noul), primary_label {happy,smell,mixed,unclear}, dominant_category choice.
- Units selected for prior ambiguity (mid happy_path_fit, happy+thrash, good_band+gap, PR mid/CONCERN/incident pairs).
- API key from box-secrets `card.TYPESAFE_API_KEY` (never echoed).
