from typing import Any


class AnomalyService:
    def detect(self, data: dict[str, Any]) -> dict[str, Any]:
        score = 0
        reasons: list[str] = []

        asn = data.get("asn")
        if not asn or not asn.get("number"):
            score += 1
            reasons.append("ASN missing")

        if data.get("prefix_bogon"):
            score += 1
            reasons.append("Bogon prefix detected")

        if data.get("rpki_status") == "invalid":
            score += 1
            reasons.append("Invalid RPKI route")

        return {
            "anomaly": score >= 2,
            "score": score,
            "reasons": reasons,
        }
