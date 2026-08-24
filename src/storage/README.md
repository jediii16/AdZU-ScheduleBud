# Storage boundary

Dexie version 1 stores validated project JSON, binary assets, and application metadata in separate tables. State uses typed repositories rather than raw tables. Photos are exportable assets; screen guides are preview-only. See `docs/state-and-persistence.md` for the exact contracts.
