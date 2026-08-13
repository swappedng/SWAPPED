"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Loader2 } from "lucide-react";

export default function EditInventoryItemPage() {
  const router = useRouter();
  const { id } = useParams();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    brand: "Apple",
    modelName: "",
    storage: "",
    baseValue: "",
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/inventory/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            ...data,
            baseValue: data.baseValue.toString(),
          });
          setLoading(false);
        });
    }
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      baseValue: parseFloat(formData.baseValue),
      order: parseInt(formData.order.toString()),
    };

    const url = isNew ? "/api/admin/inventory" : `/api/admin/inventory/${id}`;
    const method = isNew ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/inventory");
    } else {
      setSaving(false);
      alert("Failed to save item.");
    }
  };

  if (loading) return <div style={{ padding: "48px", textAlign: "center" }}><Loader2 className="h-8 w-8 animate-spin" style={{ margin: "0 auto" }} /></div>;

  return (
    <div style={{ maxWidth: "600px", padding: "24px" }}>
      <Link href="/admin/inventory" style={{ display: "flex", alignItems: "center", gap: "4px", color: "#666", textDecoration: "none", fontSize: "14px", marginBottom: "24px" }}>
        <ChevronLeft className="h-4 w-4" />
        Back to Inventory
      </Link>

      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111", marginBottom: "32px" }}>
        {isNew ? "Add New Phone" : "Edit Phone Details"}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #eee", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Display Name (What customers see)</label>
            <input
              required
              type="text"
              placeholder='e.g., "iPhone 15 Pro (256GB)"'
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Model Name</label>
              <input
                required
                type="text"
                placeholder='e.g., "iPhone 15 Pro"'
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Storage</label>
              <input
                required
                type="text"
                placeholder='e.g., "256GB"'
                value={formData.storage}
                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Base Trade-in Value (₦)</label>
            <input
              required
              type="number"
              placeholder="0.00"
              value={formData.baseValue}
              onChange={(e) => setFormData({ ...formData, baseValue: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
            />
            <p style={{ fontSize: "12px", color: "#999", marginTop: "6px" }}>The price we pay for this phone in "Perfect" condition.</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "8px" }}>
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label htmlFor="isActive" style={{ fontSize: "14px", fontWeight: 500, color: "#111", cursor: "pointer" }}>Show this phone to customers</label>
          </div>
        </div>

        <button
          disabled={saving}
          type="submit"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            background: "#000",
            color: "#fff",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isNew ? "Create Phone" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
