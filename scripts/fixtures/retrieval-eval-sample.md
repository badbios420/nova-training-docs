# Retrieval Eval Sample (fixture)

Tiny table for unit tests. Not used by live runner unless `--eval-set` points here.

| ID | Query | Gold fact | Accept paths (any) | Category |
|----|-------|-----------|-------------------|----------|
| F01 | sample query one | gold one | MEMORY.md, WORLD_STATE.md | durable_facts |
| F02 | sample query two | gold two | memory/procedural-memory-v1.md | procedures |
| F99 | not a real eval id style still ok | gold | memory/2026-07-28.md | recent_events |
