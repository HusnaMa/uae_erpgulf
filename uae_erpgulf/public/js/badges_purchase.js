frappe.ui.form.on('Purchase Invoice', {

    refresh(frm) {
        frm.set_df_property('custom_uae_einvoice_status_notification', 'options', ' ');

        const eInvoiceStatus = frm.doc.custom_uae_einvoice_status || '';
        const reportingStatus = frm.doc.custom_reporting_status || '';

        let badgeHtml = '';

        // 🔴 FAILED — either submission failed or reporting failed
        if (
            eInvoiceStatus.toUpperCase() === 'FAILED' ||
            reportingStatus.toUpperCase() === 'FAILED'
        ) {
            badgeHtml = '<div class="uae-badge-container"><img src="/assets/uae_erpgulf/js/badges/FTA-failed.png" alt="Failed" class="uae-badge" width="170" height="110" style="margin-top: -5px; margin-left: 230px;"></div>';
        }

        // ⏳ NOT SUBMITTED — initial state
        else if (eInvoiceStatus.toUpperCase() === 'NOT SUBMITTED') {
            badgeHtml = '';
        }

        // ✅ SUCCESS — check reporting status
        else if (eInvoiceStatus.toUpperCase() === 'SUCCESS') {

            if (reportingStatus.toUpperCase() === 'REPORTED') {
                badgeHtml = '<div class="uae-badge-container"><img src="/assets/uae_erpgulf/js/badges/FATA-reported.png" alt="Reported" class="uae-badge" width="110" height="110" style="margin-top: -5px; margin-left: 230px;"></div>';

            } else if (reportingStatus.toUpperCase() === 'NOT REPORTED') {
                badgeHtml = '<div class="uae-badge-container"><img src="/assets/uae_erpgulf/js/badges/FTA-not-reported.png" alt="Not Reported" class="uae-badge" width="110" height="110" style="margin-top: -5px; margin-left: 230px;"></div>';

            } else if (reportingStatus.toUpperCase() === 'PENDING') {
                badgeHtml = '<div class="uae-badge-container"><img src="/assets/uae_erpgulf/js/badges/FTA-pending.png" alt="Pending" class="uae-badge" width="110" height="110" style="margin-top: -5px; margin-left: 230px;"></div>';
            }
        }

        // Set or clear badge
        if (badgeHtml) {
            frm.set_df_property('custom_uae_einvoice_status_notification', 'options', badgeHtml);
        } else {
            frm.set_df_property('custom_uae_einvoice_status_notification', 'options', ' ');
        }

        frm.refresh_field('custom_uae_einvoice_status_notification');
    }
});