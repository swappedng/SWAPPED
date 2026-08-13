"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Loader2, Plus, Trash2, Info } from "lucide-react";

export default function EditAssessmentStepPage() {
  const router = useRouter();
  const { id } = useParams();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    internalNote: "",
    isActive: true,
    order: 0,
  });
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/assessment/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            question: data.question,
            internalNote: data.internalNote || "",
            isActive: data.isActive,
            order: data.order,
          });
          setOptions(data.options || []);
          setLoading(false);
        });
    }
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = isNew ? "/api/admin/assessment" : `/api/admin/assessment/${id}`;
    const method = isNew ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      if (isNew) {
        const data = await res.json();
        router.push(`/admin/assessment/${data.id}`);
      } else {
        router.push("/admin/assessment");
      }
    } else {
      setSaving(false);
      alert("Failed to save question.");
    }
  };

  const addOption = async () => {
    const label = prompt("Enter option label (e.g., '90% or above')");
    if (!label) return;

    const res = await fetch("/api/admin/assessment/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stepId: id,
        label,
        impactType: "MULTIPLY",
        impactValue: 1.0,
        order: options.length,
      }),
    });

    if (res.ok) {
      const newOpt = await res.json();
      setOptions([...options, newOpt]);
    }
  };

  const updateOption = async (optId: string, field: string, value: any) => {
    const updatedOptions = options.map((o) => (o.id === optId ? { ...o, [field]: value } : o));
    setOptions(updatedOptions);

    await fetch(`/api/admin/assessment/options/${optId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  };

  const deleteOption = async (optId: string) => {
    if (!confirm("Delete this option?")) return;
    const res = await fetch(`/api/admin/assessment/options/${optId}`, { method: "DELETE" });
    if (res.ok) {
      setOptions(options.filter((o) => o.id !== optId));
    }
  };

  if (loading) return <div style={{ padding: "48px", textAlign: "center" }}><Loader2 className="h-8 w-8 animate-spin" style={{ margin: "0 auto" }} /></div>;

  return (
    <div style={{ maxWidth: "800px", padding: "24px" }}>
      <Link href="/admin/assessment" style={{ display: "flex", alignItems: "center", gap: "4px", color: "#666", textDecoration: "none", fontSize: "14px", marginBottom: "24px" }}>
        <ChevronLeft className="h-4 w-4" />
        Back to Assessment Builder
      </Link>

      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111", marginBottom: "32px" }}>
        {isNew ? "Build New Question" : "Edit Question & Answers"}
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Question Details */}
        <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #eee", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Question Text (What customers see)</label>
            <input
              required
              type="text"
              placeholder='e.g., "What is the battery health?"'
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Internal Note (Optional)</label>
            <input
              type="text"
              placeholder='e.g., "Ask them to check Settings > Battery"'
              value={formData.internalNote}
              onChange={(e) => setFormData({ ...formData, internalNote: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label htmlFor="isActive" style={{ fontSize: "14px", fontWeight: 500, color: "#111", cursor: "pointer" }}>Active</label>
            </div>
            <button
              disabled={saving}
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#000",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isNew ? "Create Question" : "Save Question"}
            </button>
          </div>
        </form>

        {/* Options / Answers */}
        {!isNew && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111" }}>Answer Choices</h2>
              <button
                onClick={addOption}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#f0f0f0",
                  color: "#111",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus className="h-4 w-4" />
                Add Answer
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {options.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", background: "#f9f9f9", borderRadius: "12px", border: "1px dashed #ddd", color: "#999", fontSize: "14px" }}>
                  No answers added yet.
                </div>
              ) : (
                options.map((opt) => (
                  <div key={opt.id} style={{ background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #eee", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => updateOption(opt.id, "label", e.target.value)}
                        style={{ width: "100%", border: "none", fontSize: "15px", fontWeight: 600, color: "#111", outline: "none", padding: "4px 0" }}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <select
                        value={opt.impactType}
                        onChange={(e) => updateOption(opt.id, "impactType", e.target.value)}
                        style={{ padding: "6px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px", outline: "none" }}
                      >
                        <option value="MULTIPLY">Multiply by</option>
                        <option value="SUBTRACT">Subtract (₦)</option>
                        <option value="ADD">Add (₦)</option>
                      </select>
                      <input
                        type="number"
                        step={opt.impactType === "MULTIPLY" ? "0.01" : "100"}
                        value={opt.impactValue}
                        onChange={(e) => updateOption(opt.id, "impactValue", parseFloat(e.target.value))}
                        style={{ width: "100px", padding: "6px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px", outline: "none" }}
                      />
                    </div>
                    <button
                      onClick={() => deleteOption(opt.id)}
                      style={{ color: "#dc2626", background: "none", border: "none", padding: "4px", cursor: "pointer" }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div style={{ marginTop: "16px", padding: "12px", background: "#eef2ff", borderRadius: "8px", display: "flex", gap: "10px" }}>
              <Info className="h-5 w-5 text-indigo-600 shrink-0" />
              <p style={{ fontSize: "12px", color: "#4338ca", lineHeight: "1.5" }}>
                <strong>How it works:</strong> Multipliers are applied first (e.g., 0.8 reduces price by 20%). Fixed amounts (Add/Subtract) are applied to the final result.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
