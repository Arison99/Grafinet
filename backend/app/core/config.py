from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"


def _first_existing(*candidates: Path) -> Path:
	for candidate in candidates:
		if candidate.exists():
			return candidate
	return candidates[0]


def _existing_or_none(path: Path) -> Path | None:
	return path if path.exists() else None


PREFIX_DB_PATH = _first_existing(
	DATA_DIR / "ipnetdb_prefix_latest.mmdb",
	DATA_DIR / "ipnetdb_prefix.mmdb",
)
ASN_DB_PATH = _first_existing(
	DATA_DIR / "ipnetdb_asn_latest.mmdb",
	DATA_DIR / "ipnetdb_asn.mmdb",
)
GEOLITE2_ASN_DB_PATH = _existing_or_none(DATA_DIR / "GeoLite2-ASN.mmdb")
GEOLITE2_COUNTRY_DB_PATH = _existing_or_none(DATA_DIR / "GeoLite2-Country.mmdb")
GEOLITE2_CITY_DB_PATH = _existing_or_none(DATA_DIR / "GeoLite2-City.mmdb")
AUTH_DB_PATH = DATA_DIR / "auth.db"
ANALYTICS_DB_PATH = DATA_DIR / "analytics.db"
