"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, MoreVertical, Edit2, Trash2 } from "lucide-react";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/inventory")
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load inventory:', error);
        setItems([]);
        setLoading(false);
      });
  }, []);

  const filteredItems = items.filter((item) =>
    item.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to remove this item from the catalog?")) return;
    const res = await fetch(`/api/admin/inventory/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(items.filter((i) => i.id !== id));
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>Inventory</h1>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>Manage the phones you buy and their base trade-in values.</p>
        </div>
        <Link
          href="/admin/inventory/new"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#6366f1",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          <Plus className="h-4 w-4" />
          Add Phone
        </Link>
      </div>

      <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: "12px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search className="h-4 w-4" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Search by name..."
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
              <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Phone Name</th>
              <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Storage</th>
              <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Base Value</th>
              <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>Loading inventory...</td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>No phones found.</td></tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: 500, color: "#111827" }}>{item.displayName}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>{item.brand} {item.modelName}</div>
                  </td>
                  <td style={{ padding: "16px", fontSize: "14px", color: "#4b5563" }}>{item.storage}</td>
                  <td style={{ padding: "16px", fontSize: "14px", fontWeight: 500, color: "#111827" }}>₦{item.baseValue.toLocaleString()}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 500,
                      background: item.isActive ? "#ecfdf5" : "#fef2f2",
                      color: item.isActive ? "#059669" : "#dc2626"
                    }}>
                      {item.isActive ? "ACTIVE" : "HIDDEN"}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <Link href={`/admin/inventory/${item.id}`} style={{ color: "#6b7280", padding: "4px" }}><Edit2 className="h-4 w-4" /></Link>
                      <button onClick={() => deleteItem(item.id)} style={{ color: "#dc2626", background: "none", border: "none", padding: "4px", cursor: "pointer" }}><Trash2 className="h-4 w-4" /></button>
                    </div>
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
