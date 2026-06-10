from app.core.config import (
	ANALYTICS_DB_PATH,
	ASN_DB_PATH,
	AUTH_DB_PATH,
	GEOLITE2_ASN_DB_PATH,
	GEOLITE2_CITY_DB_PATH,
	GEOLITE2_COUNTRY_DB_PATH,
	PREFIX_DB_PATH,
)
from app.core.mmdb_loader import IPNetDBLoader
from app.services.auth_service import AuthService
from app.services.ip_service import IPService
from app.services.observability_service import ObservabilityService

loader = IPNetDBLoader(
	prefix_path=PREFIX_DB_PATH,
	asn_path=ASN_DB_PATH,
	geolite2_asn_path=GEOLITE2_ASN_DB_PATH,
	geolite2_city_path=GEOLITE2_CITY_DB_PATH,
	geolite2_country_path=GEOLITE2_COUNTRY_DB_PATH,
)
ip_service = IPService(db=loader)
auth_service = AuthService(db_path=AUTH_DB_PATH)
observability_service = ObservabilityService(db_path=ANALYTICS_DB_PATH)
