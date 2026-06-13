frappe.ui.form.on("Purchase Invoice", {
    refresh(frm) {

        frm.clear_custom_buttons();

        // Show button if:
        // 1. Submitted
        // 2. UAE status is Not Submitted OR Failed

        if (
            frm.doc.docstatus === 1 &&
            (
                frm.doc.custom_uae_einvoice_status === "Not Submitted" ||
                frm.doc.custom_reporting_status === "failed"
            )
        ) {

            frm.add_custom_button(
                __("Send Invoice"),
                () => {

                    frm.call({
                        method: "uae_erpgulf.uae_erpgulf.send_purchase.generate_and_send_einvoice",
                        args: {
                            doc: frm.doc
                        },
                        freeze: true,
                        freeze_message: __("Generating and sending UAE E-Invoice..."),
                        callback(r) {
                            if (!r.exc) {
                                frappe.msgprint(__("UAE E-Invoice processed successfully"));
                                frm.reload_doc();
                            }
                        }
                    });

                },
                __("UAE E-Invoice")
            );
        }
    }
});
frappe.ui.form.on("Purchase Invoice", {
    refresh: function (frm) {
        if (!frm.doc.__islocal && frm.doc.custom_uae_einvoice_status !== "Not Submitted") {
            frm.add_custom_button(__('Get Document Status'), function () {
                frappe.call({
                    method: "uae_erpgulf.uae_erpgulf.send_purchase.get_document_status",
                    args: {
                        invoice_name: frm.doc.name
                    },
                    freeze: true,
                    freeze_message: __("Checking Flick Document Status..."),
                    callback: function (r) {
                        if (r.message) {
                            const res = r.message;
                            const data = res.data || {};

                            const rows = [
                                ["Status", res.status || "-"],
                                ["Message", res.message || "-"],
                                ["Document ID", data.id || "-"],
                                ["Exchange Status", data.exchange_status || "-"],
                                ["Reporting Status", data.reporting_status || "-"],
                                ["Reporting Reference", data.reporting_reference || "-"],
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
                                title: __("Flick Document Status"),
                                message: html,
                                indicator: data.reporting_status === "reported" ? "green" : "orange",
                                wide: true
                            });

                            frm.reload_doc();
                        }
                    }
                });
            });
        }
    }
});