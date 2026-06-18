frappe.ui.form.on('Sales Invoice', {

    refresh(frm) {
        console.log("Form refreshed!");
        frm.set_df_property('custom_uae_einvoice_status_notification', 'options', ' ');

        const eInvoiceStatus = frm.doc.custom_uae_einvoice_status || '';
        const reportingStatus = frm.doc.custom_reporting_status || '';

        console.log("UAE eInvoice Status:", eInvoiceStatus);
        console.log("Reporting Status:", reportingStatus);

        let badgeHtml = '';

        // 🔴 FAILED — either submission failed or reporting failed
        if (
            eInvoiceStatus.toUpperCase() === 'FAILED' ||
            reportingStatus.toUpperCase() === 'FAILED'
        ) {
            console.log('Status: FAILED');
            badgeHtml = '<div class="uae-badge-container"><img src="/assets/uae_erpgulf/js/badges/FTA-failed.png" alt="Failed" class="uae-badge" width="170" height="110" style="margin-top: -5px; margin-left: 230px;"></div>';
        }

        // ⏳ NOT SUBMITTED — initial state
        else if (eInvoiceStatus.toUpperCase() === 'NOT SUBMITTED') {
            console.log('Status: Not Submitted');
            badgeHtml = '';
        }

        // ✅ SUCCESS — check reporting status
        else if (eInvoiceStatus.toUpperCase() === 'SUCCESS') {

            if (reportingStatus.toUpperCase() === 'REPORTED') {
                console.log('SUCCESS - Reported');
                badgeHtml = '<div class="uae-badge-container"><img src="/assets/uae_erpgulf/js/badges/FATA-reported.png" alt="Reported" class="uae-badge" width="150" height="150" style="margin-top: -5px; margin-left: 230px;"></div>';

            } else if (reportingStatus.toUpperCase() === 'NOT REPORTED') {
                console.log('SUCCESS - Not Reported');
                badgeHtml = '<div class="uae-badge-container"><img src="/assets/uae_erpgulf/js/badges/FTA-not-reported.png" alt="Not Reported" class="uae-badge" width="170" height="170" style="margin-top: -5px; margin-left: 230px;"></div>';

            } else if (reportingStatus.toUpperCase() === 'PENDING') {
                console.log('SUCCESS - Pending');
                badgeHtml = '<div class="uae-badge-container"><img src="/assets/uae_erpgulf/js/badges/FTA-pending.png" alt="Pending" class="uae-badge" width="170" height="170" style="margin-top: -5px; margin-left: 230px;"></div>';
            }
        }

        // Set or clear badge
        if (badgeHtml) {
            frm.set_df_property('custom_uae_einvoice_status_notification', 'options', badgeHtml);
        } else {
            console.log('No matching condition or Not Submitted. Clearing badge.');
            frm.set_df_property('custom_uae_einvoice_status_notification', 'options', ' ');
        }

        frm.refresh_field('custom_uae_einvoice_status_notification');
    }
});