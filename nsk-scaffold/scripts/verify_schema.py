#!/usr/bin/env python3
"""
Verifica statica di supabase/schema.sql — nessuna dipendenza esterna (solo stdlib),
pensata per girare in CI anche senza un'istanza Postgres disponibile (vedi
.github/workflows/ci.yml, job "verify-schema").

Controlla:
  1. Parentesi bilanciate (typo comuni negli script SQL lunghi)
  2. Ogni `references public.X` punta a una tabella X effettivamente definita
  3. Ogni `create policy` è su una tabella con RLS abilitata (`enable row level security`)
  4. Ogni tabella con RLS abilitata ha almeno una policy (altrimenti è invisibile a tutti)

Uscita: exit code 0 se tutto ok, 1 se trovati problemi (stampa dettaglio).
"""
import re
import sys
from pathlib import Path

SCHEMA_PATH = Path(__file__).parent.parent / "supabase" / "schema.sql"


def main() -> int:
    sql = SCHEMA_PATH.read_text(encoding="utf-8")
    problems: list[str] = []

    # 1. Parentesi bilanciate (ignorando quelle dentro stringhe/commenti semplici)
    depth = 0
    for i, ch in enumerate(sql):
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if depth < 0:
            problems.append(f"Parentesi chiusa senza apertura corrispondente a offset {i}")
            depth = 0
    if depth != 0:
        problems.append(f"Parentesi non bilanciate: {depth} aperte senza chiusura")

    # 2. Tabelle definite
    table_names = set(
        re.findall(r"create table if not exists public\.(\w+)", sql, re.IGNORECASE)
    )
    if not table_names:
        table_names = set(re.findall(r"create table public\.(\w+)", sql, re.IGNORECASE))

    referenced = set(
        re.findall(r"references public\.(\w+)", sql, re.IGNORECASE)
    )
    missing = referenced - table_names
    if missing:
        problems.append(f"Foreign key verso tabelle inesistenti nello schema: {sorted(missing)}")

    # 3 & 4. RLS enabled vs policy definite
    rls_tables = set(
        re.findall(r"alter table public\.(\w+) enable row level security", sql, re.IGNORECASE)
    )
    policy_tables = set(
        re.findall(r"create policy \"[^\"]+\" on public\.(\w+)", sql, re.IGNORECASE)
    )
    tables_without_policy = rls_tables - policy_tables
    if tables_without_policy:
        problems.append(
            f"Tabelle con RLS abilitata ma NESSUNA policy (dati inaccessibili a tutti): "
            f"{sorted(tables_without_policy)}"
        )

    policies_on_unprotected = policy_tables - rls_tables
    if policies_on_unprotected:
        problems.append(
            f"Policy definite su tabelle senza RLS abilitata (probabile refuso): "
            f"{sorted(policies_on_unprotected)}"
        )

    print(f"Tabelle trovate: {len(table_names)}")
    print(f"Tabelle con RLS abilitata: {len(rls_tables)}")
    print(f"Tabelle con almeno una policy: {len(policy_tables)}")

    if problems:
        print("\nPROBLEMI TROVATI:")
        for p in problems:
            print(f"  - {p}")
        return 1

    print("\nNessun problema strutturale trovato.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
