
import frappe
from frappe import _

def validate_accredited_service_provider(doc, method=None):
    company_doc = frappe.get_doc("Company", doc.company)

    if (
        company_doc.custom_base_url
        and "flick.network" in company_doc.custom_base_url.lower()
        and company_doc.custom_accredited_service_providers != "Flick Network L.L.C"
    ):
        frappe.throw(_(
            "Selected Accredited Service Provider must be Flick Network L.L.C for flick api integration."
        ))