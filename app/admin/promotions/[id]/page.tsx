"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Loader2, Calendar } from "lucide-react";

export default function EditPromotionPage() {
  const router = useRouter();
  const { id } = useParams();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "FIXED",
    appliesTo: "ALL",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    fetch("/api/admin/inventory")
      .then((res) => res.json())
      .then((data) => setInventory(data));

    if (!isNew) {
      fetch(`/api/admin/promotions/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            ...data,
            amount: data.amount.toString(),
            startDate: data.startDate ? data.startDate.split("T")[0] : "",
            endDate: data.endDate ? data.endDate.split("T")[0] : "",
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
      amount: parseFloat(formData.amount),
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
    };

    const url = isNew ? "/api/admin/promotions" : `/api/admin/promotions/${id}`;
    const method = isNew ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/promotions");
    } else {
      setSaving(false);
      alert("Failed to save promotion.");
    }
  };

  const uniqueModels = Array.from(new Set(inventory.map((i) => i.modelName)));

  if (loading) return <div style={{ padding: "48px", textAlign: "center" }}><Loader2 className="h-8 w-8 animate-spin" style={{ margin: "0 auto" }} /></div>;

  return (
    <div style={{ maxWidth: "600px", padding: "24px" }}>
      <Link href="/admin/promotions" style={{ display: "flex", alignItems: "center", gap: "4px", color: "#666", textDecoration: "none", fontSize: "14px", marginBottom: "24px" }}>
        <ChevronLeft className="h-4 w-4" />
        Back to Promotions
      </Link>

      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111", marginBottom: "32px" }}>
        {isNew ? "Create New Promotion" : "Edit Promotion"}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #eee", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Promotion Name</label>
            <input
              required
              type="text"
              placeholder='e.g., "Easter Upgrade Bonus"'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Boost Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
              >
                <option value="FIXED">Fixed Amount (₦)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Amount</label>
              <input
                required
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Applies To</label>
            <select
              value={formData.appliesTo}
              onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
            >
              <option value="ALL">All Phones</option>
              <optgroup label="Specific Models">
                {uniqueModels.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Start Date (Optional)</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "8px" }}>
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label htmlFor="isActive" style={{ fontSize: "14px", fontWeight: 500, color: "#111", cursor: "pointer" }}>Promotion is active</label>
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
          {isNew ? "Create Promotion" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
