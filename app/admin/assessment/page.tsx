"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ChevronRight, Settings2, Trash2, GripVertical, Info } from "lucide-react";

export default function AssessmentBuilderPage() {
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/assessment")
      .then((res) => res.json())
      .then((data) => {
        setSteps(data);
        setLoading(false);
      });
  }, []);

  const deleteStep = async (id: string) => {
    if (!confirm("Delete this assessment step? All associated options will also be removed.")) return;
    const res = await fetch(`/api/admin/assessment/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSteps(steps.filter((s) => s.id !== id));
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "900px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>Assessment Builder</h1>
          <p style={{ fontSize: "14px", color: "#666" }}>Build the health check questions customers answer to grade their phone.</p>
        </div>
        <Link
          href="/admin/assessment/new"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#000",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          <Plus className="h-4 w-4" />
          Add Question
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#999" }}>Loading assessment steps...</div>
        ) : steps.length === 0 ? (
          <div style={{ background: "#fff", border: "2px dashed #ddd", borderRadius: "12px", padding: "48px", textAlign: "center", color: "#666" }}>
            <Settings2 className="h-12 w-12" style={{ margin: "0 auto 16px", color: "#ccc" }} />
            <p style={{ fontWeight: 600, marginBottom: "4px" }}>No questions built yet</p>
            <p style={{ fontSize: "14px", marginBottom: "24px" }}>Start by adding your first health check question.</p>
            <Link href="/admin/assessment/new" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Add your first question →</Link>
          </div>
        ) : (
          steps.map((step, index) => (
            <div key={step.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid #f5f5f5" }}>
                <div style={{ color: "#ccc", cursor: "grab" }}><GripVertical className="h-5 w-5" /></div>
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#666"
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#111", fontSize: "15px" }}>{step.question}</div>
                  {step.internalNote && <div style={{ fontSize: "12px", color: "#999", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}><Info className="h-3 w-3" /> {step.internalNote}</div>}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link
                    href={`/admin/assessment/${step.id}`}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#444",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    Edit Question
                  </Link>
                  <button
                    onClick={() => deleteStep(step.id)}
                    style={{ padding: "6px", color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div style={{ padding: "12px 20px 16px 60px", background: "#fafafa" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#999", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>Customer Options</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {step.options?.map((opt: any) => (
                    <div key={opt.id} style={{
                      background: "#fff",
                      border: "1px solid #eee",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <span style={{ fontWeight: 500, color: "#111" }}>{opt.label}</span>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: opt.impactType === "MULTIPLY" ? "#6366f1" : opt.impactType === "SUBTRACT" ? "#dc2626" : "#059669",
                        background: opt.impactType === "MULTIPLY" ? "#eef2ff" : opt.impactType === "SUBTRACT" ? "#fef2f2" : "#ecfdf5",
                        padding: "2px 6px",
                        borderRadius: "4px"
                      }}>
                        {opt.impactType === "MULTIPLY" ? `x${opt.impactValue}` : opt.impactType === "SUBTRACT" ? `-₦${opt.impactValue.toLocaleString()}` : `+₦${opt.impactValue.toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                  <Link
                    href={`/admin/assessment/${step.id}`}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "1px dashed #ccc",
                      fontSize: "13px",
                      color: "#666",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Plus className="h-3 w-3" /> Add Option
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
