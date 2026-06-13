frappe.ui.form.on("Company", {

    custom_verify_token_: function (frm) {
        frappe.call({
            method: "uae_erpgulf.uae_erpgulf.verify_token.verify_flick_token",
            args: { company: frm.doc.name },
            callback: function (r) {
                if (r.message) {
                    const res = r.message;
                    let responseData = {};
                    try {
                        responseData = typeof res.response === "string"
                            ? JSON.parse(res.response)
                            : res.response || {};
                    } catch (e) {
                        responseData = {};
                    }

                    const data = responseData.data || {};

                    const rows = [
                        ["Status", responseData.status || "-"],
                        ["Message", responseData.message || "-"],
                        ["Tenant ID", data.tenant_id || "-"],
                        ["Tenant Name", data.tenant_name || "-"],
                        ["Authenticated", data.authenticated !== undefined ? (data.authenticated ? "✔ Yes" : "✘ No") : "-"],
                    ];

                    const tableRows = rows.map(([field, value]) => `
                        <tr>
                            <td style="padding:8px 12px;border:1px solid #d1d8dd !important;font-weight:600;width:40%;">${field}</td>
                            <td style="padding:8px 12px;border:1px solid #d1d8dd !important;">${value}</td>
                        </tr>
                    `).join("");

                    const html = `
                        <style>
                            .flick-table { border-collapse: collapse; width: 100%; font-size: 13px; }
                            .flick-table th { background-color: #f0f4f7; padding: 8px 12px; border: 1px solid #d1d8dd !important; text-align: left; }
                            .flick-table td { border: 1px solid #d1d8dd !important; }
                            .flick-table tr:nth-child(even) { background-color: #f9f9f9; }
                        </style>
                        <table class="flick-table">
                            <thead>
                                <tr>
                                    <th>Field</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    `;

                    frappe.msgprint({
                        title: __("Token Verification"),
                        message: html,
                        indicator: data.authenticated ? "green" : "red",
                        wide: true
                    });

                    frm.reload_doc();
                }
            }
        });
    },

    custom_get_participant_details: function (frm) {
        if (!frm.doc.custom_participant_id) {
            frappe.msgprint(_("Please enter Participant ID"));
            return;
        }

        frappe.call({
            method: "uae_erpgulf.uae_erpgulf.verify_token.get_participant_details",
            args: { company: frm.doc.name },
            callback: function (r) {
                if (r.message) {
                    const res = r.message;
                    const apiResponse = res.response || {};   // Python returns {status, response: <full API json>}
                    const data = apiResponse.data || {};       // actual participant fields are here

                    const rows = [
                        ["Status", apiResponse.status || "-"],
                        ["Message", apiResponse.message || "-"],
                        ["Legal Name", data.legal_name || "-"],
                        ["Trade Name", data.trade_name || "-"],
                        ["Peppol ID", data.peppol_id || "-"],
                        ["Emirates Code", data.emirates_code || "-"],
                        ["Country Code", data.country_code || "-"],
                        ["Contact Email", data.contact_email || "-"],
                        ["Participant Status", data.status || "-"],
                    ];

                    const tableRows = rows.map(([field, value]) => `
                        <tr>
                            <td style="padding:8px 12px;border:1px solid #d1d8dd !important;font-weight:600;width:40%;">${field}</td>
                            <td style="padding:8px 12px;border:1px solid #d1d8dd !important;">${value}</td>
                        </tr>
                    `).join("");

                    const html = `
                        <style>
                            .flick-table { border-collapse: collapse; width: 100%; font-size: 13px; }
                            .flick-table th { background-color: #f0f4f7; padding: 8px 12px; border: 1px solid #d1d8dd !important; text-align: left; }
                            .flick-table td { border: 1px solid #d1d8dd !important; }
                            .flick-table tr:nth-child(even) { background-color: #f9f9f9; }
                        </style>
                        <table class="flick-table">
                            <thead>
                                <tr>
                                    <th>Field</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    `;

                    frappe.msgprint({
                        title: __("Participant Details"),
                        message: html,
                        indicator: data.status === "active" ? "green" : "orange",
                        wide: true
                    });

                    frm.reload_doc();
                } else {
                    frappe.msgprint(_("❌ Failed to fetch participant details"));
                }
            }
        });
    },

    // ✅ FIXED: Now inside same object
    custom_get_access_token: function (frm) {

        if (
            !frm.doc.custom_client_id?.trim() ||
            !frm.doc.custom_client_secret?.trim()
        ) {
            frappe.msgprint(__("Please set Client ID and Client Secret"));
            return;
        }

        frappe.call({
            method: "uae_erpgulf.uae_erpgulf.verify_token.get_flick_access_token",
            args: {
                company: frm.doc.name
            },
            freeze: true,
            freeze_message: "Fetching Access Token...",

            callback: function (r) {
                console.log("Access Token Response:", r);

                if (r.message) {
                    frappe.msgprint({
                        title: __("Success"),
                        message: __("✔ Access Token Generated & Saved Successfully"),
                        indicator: "green"
                    });
                } else {
                    frappe.msgprint(_("❌ Failed to fetch access token"));
                }

                frm.reload_doc();
            },

            error: function (err) {
                console.error(err);
                frappe.msgprint(_("❌ Error while fetching access token"));
            }
        });
    }

});
frappe.ui.form.on('Company', {
    custom_subscribe_webhook: function (frm) {
        frappe.call({
            method: "uae_erpgulf.uae_erpgulf.webhook.register_flick_webhook",
            args: { company: frm.doc.name },
            freeze: true,
            freeze_message: "Subscribing Webhook...",
            callback: function (r) {
                if (r.message) {
                    const res = r.message;
                    const data = res.data || {};

                    const rows = [
                        ["Status", res.status || "-"],
                        ["Message", res.message || "-"],
                        ["UUID", data.uuid || "-"],
                        ["Endpoint", data.endpoint || "-"],
                        ["Active", data.active !== undefined ? (data.active ? "✔ Yes" : "✘ No") : "-"],
                    ];

                    const tableRows = rows.map(([field, value]) => `
                        <tr>
                            <td style="padding:8px 12px;border:1px solid #d1d8dd !important;font-weight:600;width:35%;">${field}</td>
                            <td style="padding:8px 12px;border:1px solid #d1d8dd !important;word-break:break-all;">${value}</td>
                        </tr>
                    `).join("");

                    const html = `
                        <style>
                            .flick-table { border-collapse: collapse; width: 100%; font-size: 13px; }
                            .flick-table th { background-color: #f0f4f7; padding: 8px 12px; border: 1px solid #d1d8dd !important; text-align: left; }
                            .flick-table td { border: 1px solid #d1d8dd !important; }
                            .flick-table tr:nth-child(even) { background-color: #f9f9f9; }
                        </style>
                        <table class="flick-table">
                            <thead>
                                <tr><th>Field</th><th>Value</th></tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    `;

                    frappe.msgprint({
                        title: __("Webhook Subscribed"),
                        message: html,
                        indicator: data.active ? "green" : "orange",
                        wide: true
                    });

                    frm.reload_doc();
                } else {
                    frappe.msgprint(_("❌ Failed to subscribe webhook"));
                }
            },
            error: function (err) {
                console.error(err);
                frappe.msgprint(_("❌ Error while subscribing webhook"));
            }
        });
    },

    // ✅ Get Subscription
    custom_get_subscription: function (frm) {
        frappe.call({
            method: "uae_erpgulf.uae_erpgulf.webhook.custom_get_subscription",
            args: { company: frm.doc.name },
            freeze: true,
            freeze_message: "Fetching Webhook Details...",
            callback: function (r) {
                if (r.message) {
                    const res = r.message;
                    const data = res.data || {};

                    const rows = [
                        ["Status", res.status || "-"],
                        ["Message", res.message || "-"],
                        ["UUID", data.uuid || "-"],
                        ["Name", data.name || "-"],
                        ["Endpoint", data.endpoint || "-"],
                        ["Active", data.active !== undefined ? (data.active ? "✔ Yes" : "✘ No") : "-"],
                        ["Created At", data.created_at || "-"],
                        ["Updated At", data.updated_at || "-"],
                    ].map(([field, value]) => `
                        <tr>
                            <td style="padding:8px 12px;border:1px solid #d1d8dd !important;font-weight:600;width:35%;">${field}</td>
                            <td style="padding:8px 12px;border:1px solid #d1d8dd !important;word-break:break-all;">${value}</td>
                        </tr>
                    `).join("");

                    const html = `
                        <style>
                            .flick-table { border-collapse: collapse; width: 100%; font-size: 13px; }
                            .flick-table th { background-color: #f0f4f7; padding: 8px 12px; border: 1px solid #d1d8dd !important; text-align: left; }
                            .flick-table td { border: 1px solid #d1d8dd !important; }
                            .flick-table tr:nth-child(even) { background-color: #f9f9f9; }
                        </style>
                        <table class="flick-table">
                            <thead><tr><th>Field</th><th>Value</th></tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                    `;

                    frappe.msgprint({
                        title: __("Webhook Subscription Details"),
                        message: html,
                        indicator: data.active ? "green" : "orange",
                        wide: true
                    });

                    frm.reload_doc();
                } else {
                    frappe.msgprint(_("❌ Failed to fetch webhook details"));
                }
            },
            error: function (err) {
                console.error(err);
                frappe.msgprint(_("❌ Error while fetching webhook details"));
            }
        });
    },

    // ✅ NEW: Webhook Logs (Deliveries)
    custom_webhook_logs: function (frm) {
        if (!frm.doc.custom_uuid_of_webhook) {
            frappe.msgprint(_("⚠ Please create webhook first"));
            return;
        }

        frappe.call({
            method: "uae_erpgulf.uae_erpgulf.webhook.get_webhook_deliveries",
            args: { company: frm.doc.name },
            freeze: true,
            freeze_message: "Fetching Webhook Logs...",
            callback: function (r) {
                if (r.message) {
                    const res = r.message;
                    const pagination = res.pagination || {};
                    const deliveries = res.data || [];

                    const summaryRows = [
                        ["Status", res.status || "-"],
                        ["Message", res.message || "-"],
                        ["Total Logs", pagination.total !== undefined ? pagination.total : "-"],
                        ["Pages", pagination.pages !== undefined ? pagination.pages : "-"],
                    ].map(([field, value]) => `
                        <tr>
                            <td style="padding:8px 12px;border:1px solid #d1d8dd !important;font-weight:600;width:40%;">${field}</td>
                            <td style="padding:8px 12px;border:1px solid #d1d8dd !important;">${value}</td>
                        </tr>
                    `).join("");

                    // delivery rows if data is not empty
                    let deliverySection = "";
                    if (deliveries.length > 0) {
                        const deliveryRows = deliveries.map(d => `
                            <tr>
                                <td style="padding:8px 12px;border:1px solid #d1d8dd !important;">${d.id || "-"}</td>
                                <td style="padding:8px 12px;border:1px solid #d1d8dd !important;">${d.status || "-"}</td>
                                <td style="padding:8px 12px;border:1px solid #d1d8dd !important;">${d.event_type || "-"}</td>
                                <td style="padding:8px 12px;border:1px solid #d1d8dd !important;">${d.created_at || "-"}</td>
                            </tr>
                        `).join("");

                        deliverySection = `
                            <br>
                            <b>Delivery Records</b>
                            <table class="flick-table" style="margin-top:8px;">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Status</th>
                                        <th>Event Type</th>
                                        <th>Created At</th>
                                    </tr>
                                </thead>
                                <tbody>${deliveryRows}</tbody>
                            </table>
                        `;
                    } else {
                        deliverySection = `<br><i style="color:#888;">No delivery records found.</i>`;
                    }

                    const html = `
                        <style>
                            .flick-table { border-collapse: collapse; width: 100%; font-size: 13px; }
                            .flick-table th { background-color: #f0f4f7; padding: 8px 12px; border: 1px solid #d1d8dd !important; text-align: left; }
                            .flick-table td { border: 1px solid #d1d8dd !important; }
                            .flick-table tr:nth-child(even) { background-color: #f9f9f9; }
                        </style>
                        <table class="flick-table">
                            <thead><tr><th>Field</th><th>Value</th></tr></thead>
                            <tbody>${summaryRows}</tbody>
                        </table>
                        ${deliverySection}
                    `;

                    frappe.msgprint({
                        title: __("Webhook Delivery Logs"),
                        message: html,
                        indicator: pagination.total > 0 ? "green" : "orange",
                        wide: true
                    });

                } else {
                    frappe.msgprint(_("❌ Failed to fetch webhook logs"));
                }
            },
            error: function (err) {
                console.error(err);
                frappe.msgprint(_("❌ Error while fetching webhook logs"));
            }
        });
    }

});