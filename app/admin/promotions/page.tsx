"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, BadgePercent, Calendar, Tag, Trash2, Edit2 } from "lucide-react";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/promotions")
      .then((res) => res.json())
      .then((data) => {
        setPromotions(data);
        setLoading(false);
      });
  }, []);

  const deletePromotion = async (id: string) => {
    if (!confirm("Are you sure you want to remove this promotion?")) return;
    const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPromotions(promotions.filter((p) => p.id !== id));
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>Promotions</h1>
          <p style={{ fontSize: "14px", color: "#666" }}>Create temporary price boosts or fixed adjustments for specific phones.</p>
        </div>
        <Link
          href="/admin/promotions/new"
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
          Create Promotion
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {loading ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px", color: "#999" }}>Loading promotions...</div>
        ) : promotions.length === 0 ? (
          <div style={{ gridColumn: "1/-1", background: "#fff", border: "2px dashed #ddd", borderRadius: "12px", padding: "48px", textAlign: "center", color: "#666" }}>
            <BadgePercent className="h-12 w-12" style={{ margin: "0 auto 16px", color: "#ccc" }} />
            <p style={{ fontWeight: 600, marginBottom: "4px" }}>No active promotions</p>
            <p style={{ fontSize: "14px", marginBottom: "24px" }}>Boost trade-in prices for special events or specific models.</p>
            <Link href="/admin/promotions/new" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Create your first promotion →</Link>
          </div>
        ) : (
          promotions.map((promo) => (
            <div key={promo.id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: 700,
                  background: promo.isActive ? "#ecfdf5" : "#f5f5f5",
                  color: promo.isActive ? "#059669" : "#999",
                  textTransform: "uppercase"
                }}>
                  {promo.isActive ? "Active" : "Inactive"}
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <Link href={`/admin/promotions/${promo.id}`} style={{ color: "#666", padding: "4px" }}><Edit2 className="h-4 w-4" /></Link>
                  <button onClick={() => deletePromotion(promo.id)} style={{ color: "#dc2626", background: "none", border: "none", padding: "4px", cursor: "pointer" }}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>{promo.name}</h3>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#6366f1" }}>
                  {promo.type === "PERCENTAGE" ? `+${promo.amount}%` : `+₦${promo.amount.toLocaleString()}`}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid #f5f5f5", paddingTop: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#666" }}>
                  <Tag className="h-4 w-4" />
                  <span>Applies to: <strong>{promo.appliesTo === "ALL" ? "All Phones" : promo.appliesTo}</strong></span>
                </div>
                {(promo.startDate || promo.endDate) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#666" }}>
                    <Calendar className="h-4 w-4" />
                    <span>
                      {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : "Now"}
                      {" - "}
                      {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : "Forever"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
