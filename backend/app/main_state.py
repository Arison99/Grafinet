from app.core.config import ASN_DB_PATH, PREFIX_DB_PATH
from app.core.mmdb_loader import IPNetDBLoader
from app.services.ip_service import IPService

loader = IPNetDBLoader(prefix_path=PREFIX_DB_PATH, asn_path=ASN_DB_PATH)
ip_service = IPService(db=loader)
