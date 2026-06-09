from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
PREFIX_DB_PATH = DATA_DIR / "ipnetdb_prefix.mmdb"
ASN_DB_PATH = DATA_DIR / "ipnetdb_asn.mmdb"
USERS_DB_PATH = DATA_DIR / "users.json"
