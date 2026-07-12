"use client";

import { useState, useEffect } from "react";
import { Search, Calendar, Phone, Mail, ArrowRight } from "lucide-react";

export default function SwapsPage() {
  const [swaps, setSwaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/swaps")
      .then((res) => res.json())
      .then((data) => {
        setSwaps(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching swaps:', error);
        setSwaps([]);
        setLoading(false);
      });
  }, []);

  const filteredSwaps = swaps.filter((swap) => {
    const email = swap.tradeInPhone?.contactEmail || "";
    const searchLower = search.toLowerCase();
    return email.toLowerCase().includes(searchLower);
  });

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>Swap Deals</h1>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>View all current trade-in swap deals.</p>
      </div>

      <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: "12px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search className="h-4 w-4" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", textAlign: "left" }}>
              <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Customer</th>
              <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Trade-In Value</th>
              <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>New Phone Price</th>
              <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Amount to Pay</th>
              <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Appointment</th>
              <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>Loading swaps...</td></tr>
            ) : filteredSwaps.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>No swaps found.</td></tr>
            ) : (
              filteredSwaps.map((swap) => (
                <tr key={swap.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail className="h-4 w-4" style={{ color: "#9ca3af" }} />
                      <div>
                        <div style={{ fontWeight: 500, color: "#111827" }}>{swap.tradeInPhone?.contactEmail || 'No email'}</div>
                        <div style={{ fontSize: "12px", color: "#9ca3af" }}>ID: {swap.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px", fontSize: "14px", fontWeight: 500, color: "#059669" }}>₦{swap.tradeInValue?.toLocaleString() || 0}</td>
                  <td style={{ padding: "16px", fontSize: "14px", fontWeight: 500, color: "#111827" }}>₦{swap.newPhonePrice?.toLocaleString() || 0}</td>
                  <td style={{ padding: "16px", fontSize: "14px", fontWeight: 600, color: "#6366f1" }}>₦{swap.amountToPay?.toLocaleString() || 0}</td>
                  <td style={{ padding: "16px" }}>
                    {swap.appointment ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#059669" }}>
                        <Calendar className="h-3 w-3" />
                        {new Date(swap.appointment.date).toLocaleDateString()} at {swap.appointment.time}
                      </div>
                    ) : (
                      <span style={{ fontSize: "13px", color: "#9ca3af" }}>Not scheduled</span>
                    )}
                  </td>
                  <td style={{ padding: "16px", fontSize: "13px", color: "#6b7280" }}>
                    {new Date(swap.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
