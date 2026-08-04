"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";
import {
  Store, Image as ImageIcon, Info, UtensilsCrossed, Truck, Images,
  MessageSquareText, MapPin, Clock, Phone, FileText, Plus, Trash2,
  Check, ChevronRight, ChevronLeft, Upload, X, Star, Instagram,
  MessageCircle, Car, Bus, ShoppingBag, Monitor, Smartphone, PenLine, Eye,
  Loader2, Cloud, CloudUpload, Rocket,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════
   토큰 — 입력폼(FT: 주문표/도장) / 미리보기(ST: 손글씨 메뉴판·간판)
════════════════════════════════════════════════════════════ */
const FT = {
  paper: "#FAF6EF", paperDeep: "#F1EADC", ink: "#262019", inkSoft: "#5C5346",
  accent: "#C1440E", green: "#2F5233", muted: "#A69C8C", line: "#E4DACB",
  white: "#FFFFFF", danger: "#B3261E",
};
const ST = {
  paper: "#FBF3E7", paperDeep: "#F3E6D2", ink: "#1F1B16", inkSoft: "#5C5346",
  accent: "#A6321D", gold: "#C98A2C", line: "#E3D5BE", muted: "#8B7E6A", white: "#FFFFFF",
};

const genId = () => Math.random().toString(36).slice(2, 9);
const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const SECTIONS = [
  { id: "header", label: "헤더 · 상호명", icon: Store },
  { id: "hero", label: "메인 배너", icon: ImageIcon },
  { id: "about", label: "소개", icon: Info },
  { id: "menu", label: "메뉴", icon: UtensilsCrossed },
  { id: "orderLinks", label: "배달 · 포장", icon: Truck },
  { id: "gallery", label: "갤러리", icon: Images },
  { id: "reviews", label: "후기", icon: MessageSquareText },
  { id: "location", label: "오시는 길", icon: MapPin },
  { id: "hours", label: "영업시간", icon: Clock },
  { id: "contact", label: "예약 · 문의", icon: Phone },
  { id: "footer", label: "사업자 정보", icon: FileText },
];

const initialData = {
  header: { logoImage: "", businessName: "" },
  hero: { heroImage: "", heroCatchphrase: "", heroSubtext: "", heroCtaButton: "전화하기" },
  about: { aboutTitle: "우리 가게를 소개합니다", aboutImage: "", aboutText: "", establishedYear: "" },
  menu: {
    menuSectionTitle: "메뉴판",
    menuCategories: [{ id: genId(), categoryName: "", menuItems: [
      { id: genId(), menuName: "", menuImage: "", menuPrice: "", menuDescription: "", isSignature: false, isSoldOut: false },
    ] }],
  },
  orderLinks: { baeminUrl: "", coupangEatsUrl: "", yogiyoUrl: "", takeoutAvailable: false },
  gallery: { galleryTitle: "매장 둘러보기", galleryImages: [] },
  reviews: { reviewSourceType: "직접 입력", manualReviews: [], naverPlaceUrl: "" },
  location: { address: "", addressDetail: "", mapProvider: "카카오맵", parkingInfo: "", transitInfo: "" },
  hours: { weeklyHours: DAYS.map((d) => ({ dayOfWeek: d, isOpen: true, openTime: "09:00", closeTime: "21:00" })), regularHoliday: "", breakTime: "" },
  contact: { phoneNumber: "", kakaoChannelUrl: "", instagramUrl: "", enableInquiryForm: false, inquiryFormNotifyEmail: "" },
  footer: { businessRegistrationNumber: "", representativeName: "", footerCopyrightText: "" },
};

/* ════════════════ 입력 프리미티브 (FT 톤) ════════════════ */
function FieldShell({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: FT.ink, marginBottom: 8 }}>
        {label}{required && <span style={{ color: FT.accent, fontSize: 16, lineHeight: 0 }}>·</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 12, color: FT.muted, marginTop: 6 }}>{hint}</p>}
    </div>
  );
}
const inputBase = { width: "100%", boxSizing: "border-box", border: `1px solid ${FT.line}`, borderRadius: 8, padding: "9px 11px", fontSize: 13.5, color: FT.ink, background: FT.white, outline: "none", fontFamily: "inherit" };

function TextInput({ value, onChange, placeholder, maxLength }) {
  return <input style={inputBase} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}
function TextArea({ value, onChange, placeholder, maxLength, rows = 4 }) {
  return <textarea style={{ ...inputBase, resize: "vertical" }} rows={rows} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}
function SelectInput({ value, onChange, options }) {
  return (
    <select style={{ ...inputBase, cursor: "pointer" }} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} style={{ display: "flex", alignItems: "center", gap: 10, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
      <span style={{ width: 36, height: 21, borderRadius: 999, position: "relative", background: checked ? FT.accent : FT.line, transition: "background .15s" }}>
        <span style={{ position: "absolute", top: 2, left: checked ? 17 : 2, width: 17, height: 17, borderRadius: "50%", background: FT.white, transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,.25)" }} />
      </span>
      {label && <span style={{ fontSize: 12.5, color: FT.inkSoft }}>{label}</span>}
    </button>
  );
}
function ImageUpload({ value, onChange, ratioLabel = "권장 4:3" }) {
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };
  return value ? (
    <div style={{ position: "relative", width: 140, height: 105 }}>
      <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: `1px solid ${FT.line}` }} />
      <button onClick={() => onChange("")} style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: FT.danger, color: FT.white, border: `2px solid ${FT.paper}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button>
    </div>
  ) : (
    <label style={{ width: 140, height: 105, borderRadius: 8, border: `1.5px dashed ${FT.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer", color: FT.muted, background: FT.paperDeep }}>
      <Upload size={16} /><span style={{ fontSize: 10.5 }}>사진 업로드</span><span style={{ fontSize: 9.5 }}>{ratioLabel}</span>
      <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    </label>
  );
}
function GhostButton({ children, onClick, tone = "accent" }) {
  const color = tone === "accent" ? FT.accent : FT.danger;
  return <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${color}`, color, borderRadius: 999, padding: "6px 13px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{children}</button>;
}
function SectionTitle({ title, desc }) {
  return (
    <div style={{ marginBottom: 22, paddingBottom: 14, borderBottom: `1px dashed ${FT.line}` }}>
      <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: FT.ink }}>{title}</h2>
      <p style={{ margin: "5px 0 0", fontSize: 12.5, color: FT.muted }}>{desc}</p>
    </div>
  );
}
function isComplete(id, data) {
  switch (id) {
    case "header": return !!data.header.businessName;
    case "hero": return !!data.hero.heroImage && !!data.hero.heroCatchphrase;
    case "about": return !!data.about.aboutText;
    case "menu": return data.menu.menuCategories.some((c) => c.categoryName && c.menuItems.some((m) => m.menuName && m.menuPrice));
    case "location": return !!data.location.address;
    case "contact": return !!data.contact.phoneNumber;
    default: return true;
  }
}
function RepeatListEditor({ items, onChange, makeEmpty, renderItem, max = 10, addLabel = "항목 추가" }) {
  const update = (i, field, value) => { const next = [...items]; next[i] = { ...next[i], [field]: value }; onChange(next); };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => items.length < max && onChange([...items, makeEmpty()]);
  return (
    <div>
      {items.map((item, i) => (
        <div key={item.id} style={{ border: `1px solid ${FT.line}`, borderRadius: 10, padding: 14, marginBottom: 10, background: FT.white, position: "relative" }}>
          <button onClick={() => remove(i)} style={{ position: "absolute", top: 10, right: 10, background: "transparent", border: "none", color: FT.muted, cursor: "pointer" }}><Trash2 size={14} /></button>
          {renderItem(item, (field, value) => update(i, field, value))}
        </div>
      ))}
      {items.length < max && <GhostButton onClick={add}><Plus size={13} />{addLabel}</GhostButton>}
    </div>
  );
}
function MenuEditor({ data, setData }) {
  const updateTitle = (v) => setData({ ...data, menuSectionTitle: v });
  const updateCategory = (ci, field, value) => { const next = [...data.menuCategories]; next[ci] = { ...next[ci], [field]: value }; setData({ ...data, menuCategories: next }); };
  const addCategory = () => setData({ ...data, menuCategories: [...data.menuCategories, { id: genId(), categoryName: "", menuItems: [] }] });
  const removeCategory = (ci) => setData({ ...data, menuCategories: data.menuCategories.filter((_, i) => i !== ci) });
  const updateItem = (ci, ii, field, value) => { const next = [...data.menuCategories]; const items = [...next[ci].menuItems]; items[ii] = { ...items[ii], [field]: value }; next[ci] = { ...next[ci], menuItems: items }; setData({ ...data, menuCategories: next }); };
  const addItem = (ci) => { const next = [...data.menuCategories]; next[ci] = { ...next[ci], menuItems: [...next[ci].menuItems, { id: genId(), menuName: "", menuImage: "", menuPrice: "", menuDescription: "", isSignature: false, isSoldOut: false }] }; setData({ ...data, menuCategories: next }); };
  const removeItem = (ci, ii) => { const next = [...data.menuCategories]; next[ci] = { ...next[ci], menuItems: next[ci].menuItems.filter((_, i) => i !== ii) }; setData({ ...data, menuCategories: next }); };

  return (
    <>
      <SectionTitle title="메뉴" desc="카테고리별로 메뉴를 등록하세요." />
      <FieldShell label="메뉴 섹션 제목"><TextInput value={data.menuSectionTitle} onChange={updateTitle} /></FieldShell>
      {data.menuCategories.map((cat, ci) => (
        <div key={cat.id} style={{ border: `1.5px solid ${FT.line}`, borderRadius: 12, padding: 16, marginBottom: 14, background: FT.white }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <div style={{ flex: 1 }}><TextInput value={cat.categoryName} placeholder="카테고리명 (예: 커피)" onChange={(v) => updateCategory(ci, "categoryName", v)} /></div>
            {data.menuCategories.length > 1 && <button onClick={() => removeCategory(ci)} style={{ background: "transparent", border: "none", color: FT.danger, cursor: "pointer" }}><Trash2 size={15} /></button>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {cat.menuItems.map((item, ii) => (
              <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: FT.paperDeep, borderRadius: 10, padding: 10 }}>
                <ImageUpload value={item.menuImage} onChange={(v) => updateItem(ci, ii, "menuImage", v)} ratioLabel="1:1" />
                <div style={{ flex: 1, display: "grid", gap: 7 }}>
                  <input style={inputBase} placeholder="메뉴명" value={item.menuName} maxLength={30} onChange={(e) => updateItem(ci, ii, "menuName", e.target.value)} />
                  <div style={{ display: "flex", gap: 7 }}>
                    <input style={{ ...inputBase, width: 120 }} placeholder="가격" value={item.menuPrice} onChange={(e) => updateItem(ci, ii, "menuPrice", e.target.value)} />
                    <input style={inputBase} placeholder="설명(선택)" value={item.menuDescription} maxLength={60} onChange={(e) => updateItem(ci, ii, "menuDescription", e.target.value)} />
                  </div>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: FT.inkSoft, cursor: "pointer" }}><Toggle checked={item.isSignature} onChange={(v) => updateItem(ci, ii, "isSignature", v)} /><Star size={12} color={FT.accent} />대표</label>
                    <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: FT.inkSoft, cursor: "pointer" }}><Toggle checked={item.isSoldOut} onChange={(v) => updateItem(ci, ii, "isSoldOut", v)} />품절</label>
                  </div>
                </div>
                <button onClick={() => removeItem(ci, ii)} style={{ background: "transparent", border: "none", color: FT.muted, cursor: "pointer" }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 9 }}><GhostButton onClick={() => addItem(ci)}><Plus size={12} />메뉴 추가</GhostButton></div>
        </div>
      ))}
      <GhostButton onClick={addCategory}><Plus size={13} />카테고리 추가</GhostButton>
    </>
  );
}

/* ════════════════ 미리보기 프리미티브 (ST 톤) ════════════════ */
const CTA_ACTION = {
  "전화하기": (d) => `tel:${d.contact.phoneNumber}`,
  "예약하기": () => "#contact",
  "카카오톡 문의": (d) => d.contact.kakaoChannelUrl || "#contact",
  "오시는길 보기": () => "#location",
};
const TODAY_KR = ["일", "월", "화", "수", "목", "금", "토"][new Date().getDay()];

function Eyebrow({ text, center, light }) {
  return <p style={{ fontSize: 11, letterSpacing: 3, fontWeight: 800, margin: 0, color: light ? "rgba(255,255,255,.55)" : ST.accent, textAlign: center ? "center" : "left" }}>{text}</p>;
}
function InfoLine({ icon: Icon, text }) {
  return <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 8 }}><Icon size={13} color={ST.muted} style={{ marginTop: 2, flexShrink: 0 }} /><span style={{ fontSize: 12.5, color: ST.inkSoft, lineHeight: 1.6 }}>{text}</span></div>;
}
function OrderBtn({ href, label, icon: Icon, staticTag }) {
  const Comp = staticTag ? "span" : "a";
  return <Comp href={href} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: ST.white, border: `1px solid ${ST.line}`, color: ST.ink, padding: "8px 15px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, textDecoration: "none" }}><Icon size={13} />{label}</Comp>;
}
function IconLink({ href, icon: Icon }) {
  return <a href={href} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: ST.white }}><Icon size={16} /></a>;
}

function SitePreview({ data: d }) {
  const [lightbox, setLightbox] = useState(null);
  const hasOrderLinks = d.orderLinks && (d.orderLinks.baeminUrl || d.orderLinks.coupangEatsUrl || d.orderLinks.yogiyoUrl || d.orderLinks.takeoutAvailable);
  const heroHref = (CTA_ACTION[d.hero.heroCtaButton] || CTA_ACTION["전화하기"])(d);

  return (
    <div style={{ background: ST.paper, color: ST.ink, fontFamily: "'Pretendard','Malgun Gothic',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <style>{`
        .prev-menu-grid{display:grid;grid-template-columns:1fr;gap:12px;}
        .prev-gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
        .prev-about-grid{display:grid;grid-template-columns:1fr;gap:18px;}
        .prev-review-grid{display:grid;grid-template-columns:1fr;gap:12px;}
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 5, background: `${ST.paper}F2`, backdropFilter: "blur(6px)", borderBottom: `1px solid ${ST.line}`, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {d.header.logoImage && <img src={d.header.logoImage} alt="" style={{ width: 26, height: 26, borderRadius: 6, objectFit: "cover" }} />}
          <span style={{ fontSize: 15, fontWeight: 800 }}>{d.header.businessName || "가게 이름을 입력해주세요"}</span>
        </div>
        <nav style={{ display: "flex", gap: 12, fontSize: 11.5, fontWeight: 600, color: ST.inkSoft }}>
          <a href="#menu" style={{ color: "inherit", textDecoration: "none" }}>메뉴</a>
          <a href="#location" style={{ color: "inherit", textDecoration: "none" }}>오시는길</a>
          <a href="#contact" style={{ color: "inherit", textDecoration: "none" }}>문의</a>
        </nav>
      </header>

      <section style={{ position: "relative", minHeight: 300, display: "flex", alignItems: "flex-end", background: !d.hero.heroImage ? ST.paperDeep : "transparent" }}>
        {d.hero.heroImage && <img src={d.hero.heroImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
        {d.hero.heroImage && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(31,27,22,.15) 0%, rgba(31,27,22,.75) 100%)" }} />}
        <div style={{ position: "relative", padding: "28px 20px 24px", color: d.hero.heroImage ? ST.white : ST.muted, width: "100%" }}>
          <p style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: ST.gold, fontWeight: 700, margin: "0 0 8px" }}>Since {d.about.establishedYear || "____"}</p>
          <h1 style={{ fontSize: "clamp(20px,4vw,30px)", fontWeight: 800, lineHeight: 1.3, margin: 0 }}>{d.hero.heroCatchphrase || "캐치프레이즈를 입력해주세요"}</h1>
          {d.hero.heroSubtext && <p style={{ fontSize: 13, margin: "8px 0 18px", color: d.hero.heroImage ? "rgba(255,255,255,.85)" : ST.muted }}>{d.hero.heroSubtext}</p>}
          <a href={heroHref} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: ST.accent, color: ST.white, padding: "10px 20px", borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: "none", marginTop: d.hero.heroSubtext ? 0 : 14 }}>{d.hero.heroCtaButton}</a>
        </div>
      </section>

      {d.about.aboutText && (
        <section style={{ padding: "34px 20px", maxWidth: 720, margin: "0 auto" }}>
          <div className="prev-about-grid">
            {d.about.aboutImage && <img src={d.about.aboutImage} alt="" style={{ width: "100%", borderRadius: 12, objectFit: "cover", aspectRatio: "4/3" }} />}
            <div>
              <Eyebrow text="ABOUT" />
              <h2 style={{ fontSize: 19, fontWeight: 800, margin: "6px 0 10px" }}>{d.about.aboutTitle}</h2>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: ST.inkSoft, whiteSpace: "pre-line" }}>{d.about.aboutText}</p>
            </div>
          </div>
        </section>
      )}

      <section id="menu" style={{ padding: "34px 20px", background: ST.paperDeep }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <Eyebrow text="MENU" center />
          <h2 style={{ fontSize: 21, fontWeight: 800, textAlign: "center", margin: "6px 0 26px" }}>{d.menu.menuSectionTitle}</h2>
          {d.menu.menuCategories.filter((c) => c.categoryName || c.menuItems.some((m) => m.menuName)).map((cat) => (
            <div key={cat.id} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 14.5, fontWeight: 800, color: ST.accent }}>{cat.categoryName || "카테고리"}</span>
                <span style={{ flex: 1, borderBottom: `1px dashed ${ST.muted}` }} />
              </div>
              <div className="prev-menu-grid">
                {cat.menuItems.filter((m) => m.menuName).map((item) => (
                  <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", background: ST.white, borderRadius: 10, padding: 10, border: `1px solid ${ST.line}`, opacity: item.isSoldOut ? 0.5 : 1 }}>
                    {item.menuImage && <img src={item.menuImage} alt="" style={{ width: 54, height: 54, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                        {item.isSignature && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: ST.gold, color: ST.white, fontSize: 9.5, fontWeight: 800, padding: "2px 6px", borderRadius: 999 }}><Star size={8} fill={ST.white} />대표메뉴</span>}
                        <span style={{ fontSize: 13.5, fontWeight: 700 }}>{item.menuName}</span>
                        {item.isSoldOut && <span style={{ fontSize: 10.5, color: ST.accent, fontWeight: 700 }}>품절</span>}
                      </div>
                      {item.menuDescription && <p style={{ fontSize: 11.5, color: ST.muted, margin: "3px 0 0" }}>{item.menuDescription}</p>}
                    </div>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{item.menuPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {hasOrderLinks && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 16 }}>
              {d.orderLinks.baeminUrl && <OrderBtn href={d.orderLinks.baeminUrl} label="배달의민족" icon={Truck} />}
              {d.orderLinks.coupangEatsUrl && <OrderBtn href={d.orderLinks.coupangEatsUrl} label="쿠팡이츠" icon={Truck} />}
              {d.orderLinks.yogiyoUrl && <OrderBtn href={d.orderLinks.yogiyoUrl} label="요기요" icon={Truck} />}
              {d.orderLinks.takeoutAvailable && <OrderBtn label="포장 가능" icon={ShoppingBag} staticTag />}
            </div>
          )}
        </div>
      </section>

      {d.gallery.galleryImages?.length > 0 && (
        <section style={{ padding: "34px 20px", maxWidth: 720, margin: "0 auto" }}>
          <Eyebrow text="GALLERY" />
          <h2 style={{ fontSize: 19, fontWeight: 800, margin: "6px 0 16px" }}>{d.gallery.galleryTitle}</h2>
          <div className="prev-gallery-grid">
            {d.gallery.galleryImages.map((img, i) => <img key={i} src={img} alt="" onClick={() => setLightbox(i)} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 8, cursor: "pointer" }} />)}
          </div>
        </section>
      )}

      {lightbox !== null && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(31,27,22,.9)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(null); }} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: ST.white, cursor: "pointer" }}><X size={24} /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + d.gallery.galleryImages.length) % d.gallery.galleryImages.length); }} style={{ position: "absolute", left: 12, background: "transparent", border: "none", color: ST.white, cursor: "pointer" }}><ChevronLeft size={28} /></button>
          <img src={d.gallery.galleryImages[lightbox]} alt="" style={{ maxWidth: "85%", maxHeight: "80%", borderRadius: 10 }} />
          <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % d.gallery.galleryImages.length); }} style={{ position: "absolute", right: 12, background: "transparent", border: "none", color: ST.white, cursor: "pointer" }}><ChevronRight size={28} /></button>
        </div>
      )}

      {d.reviews.reviewSourceType === "직접 입력" && d.reviews.manualReviews?.length > 0 && (
        <section style={{ padding: "34px 20px", background: ST.paperDeep }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <Eyebrow text="REVIEW" center />
            <h2 style={{ fontSize: 19, fontWeight: 800, textAlign: "center", margin: "6px 0 18px" }}>손님들의 후기</h2>
            <div className="prev-review-grid">
              {d.reviews.manualReviews.map((r) => (
                <div key={r.id} style={{ background: ST.white, borderRadius: 10, padding: 15, border: `1px solid ${ST.line}` }}>
                  <div style={{ display: "flex", gap: 2, marginBottom: 7 }}>{Array.from({ length: Number(r.reviewRating) || 0 }).map((_, i) => <Star key={i} size={12} fill={ST.gold} color={ST.gold} />)}</div>
                  <p style={{ fontSize: 12.5, lineHeight: 1.7, color: ST.inkSoft, margin: "0 0 8px" }}>{r.reviewText}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, color: ST.muted }}>{r.reviewerName}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="location" style={{ padding: "34px 20px", maxWidth: 640, margin: "0 auto" }}>
        <Eyebrow text="LOCATION" />
        <h2 style={{ fontSize: 19, fontWeight: 800, margin: "6px 0 16px" }}>오시는 길</h2>
        <div style={{ height: 140, borderRadius: 12, background: `repeating-linear-gradient(45deg, ${ST.paperDeep}, ${ST.paperDeep} 10px, ${ST.line} 10px, ${ST.line} 20px)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ background: ST.white, borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(31,27,22,.15)" }}>
            <MapPin size={14} color={ST.accent} /><span style={{ fontSize: 11.5, color: ST.inkSoft }}>{d.location.mapProvider} 연동 영역</span>
          </div>
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>{d.location.address || "주소를 입력해주세요"} {d.location.addressDetail}</p>
        {d.location.parkingInfo && <InfoLine icon={Car} text={d.location.parkingInfo} />}
        {d.location.transitInfo && <InfoLine icon={Bus} text={d.location.transitInfo} />}
      </section>

      <section style={{ padding: "0 20px 34px", maxWidth: 420, margin: "0 auto" }}>
        <Eyebrow text="HOURS" />
        <h2 style={{ fontSize: 19, fontWeight: 800, margin: "6px 0 14px" }}>영업시간</h2>
        <div style={{ border: `1px solid ${ST.line}`, borderRadius: 10, overflow: "hidden", background: ST.white }}>
          {d.hours.weeklyHours.map((row, i) => {
            const isToday = row.dayOfWeek === TODAY_KR;
            return (
              <div key={row.dayOfWeek} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: i < 6 ? `1px solid ${ST.line}` : "none", background: isToday ? ST.paperDeep : "transparent" }}>
                <span style={{ fontWeight: isToday ? 800 : 500, fontSize: 12.5, color: isToday ? ST.accent : ST.ink }}>{row.dayOfWeek}{isToday && " · 오늘"}</span>
                <span style={{ fontSize: 12.5, color: row.isOpen ? ST.inkSoft : ST.muted, fontFamily: "monospace" }}>{row.isOpen ? `${row.openTime}–${row.closeTime}` : "휴무"}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
          {d.hours.regularHoliday && <span style={{ fontSize: 11.5, color: ST.muted }}>정기휴무: {d.hours.regularHoliday}</span>}
          {d.hours.breakTime && <span style={{ fontSize: 11.5, color: ST.muted }}>브레이크타임: {d.hours.breakTime}</span>}
        </div>
      </section>

      <section id="contact" style={{ padding: "34px 20px", background: ST.ink, color: ST.white }}>
        <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow text="CONTACT" center light />
          <h2 style={{ fontSize: 19, fontWeight: 800, margin: "6px 0 18px" }}>예약 · 문의</h2>
          <a href={`tel:${d.contact.phoneNumber}`} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: ST.accent, color: ST.white, padding: "11px 24px", borderRadius: 999, fontSize: 13.5, fontWeight: 700, textDecoration: "none", marginBottom: 14 }}><Phone size={14} />{d.contact.phoneNumber || "전화번호 입력"}</a>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 4 }}>
            {d.contact.kakaoChannelUrl && <IconLink href={d.contact.kakaoChannelUrl} icon={MessageCircle} />}
            {d.contact.instagramUrl && <IconLink href={d.contact.instagramUrl} icon={Camera} />}
          </div>
        </div>
      </section>

      <footer style={{ padding: "20px", textAlign: "center", fontSize: 10.5, color: ST.muted, borderTop: `1px solid ${ST.line}` }}>
        {d.footer.representativeName && <span>대표 {d.footer.representativeName} · </span>}
        {d.footer.businessRegistrationNumber && <span>사업자등록번호 {d.footer.businessRegistrationNumber}</span>}
        <div style={{ marginTop: 3 }}>{d.footer.footerCopyrightText}</div>
      </footer>
    </div>
  );
}

/* ════════════════════ 저장 상태 표시 ════════════════════ */
function SaveStatusBadge({ status }) {
  const map = {
    idle: { icon: Cloud, text: "자동저장 대기", color: FT.muted },
    saving: { icon: Loader2, text: "저장 중...", color: FT.accent, spin: true },
    saved: { icon: Check, text: "저장됨", color: FT.green },
    error: { icon: CloudUpload, text: "저장 실패 (재시도됨)", color: FT.danger },
  };
  const s = map[status] || map.idle;
  const Icon = s.icon;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: s.color, fontWeight: 600 }}>
      <Icon size={13} className={s.spin ? "spin" : ""} /> {s.text}
    </span>
  );
}

/* ════════════════════ 메인: 좌우 분할 빌더 ════════════════════ */
export default function BuilderSplitView({ siteId, subdomain }) {
  const [data, setData] = useState(initialData);
  const [active, setActive] = useState("header");
  const [viewport, setViewport] = useState("desktop");
  const [mobileTab, setMobileTab] = useState("form");
  const [isNarrow, setIsNarrow] = useState(false);
  const [loading, setLoading] = useState(!!siteId);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState(null);

  const saveTimer = useRef(null);
  const skipNextSave = useRef(true); // 최초 로딩 시에는 저장하지 않도록

  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── 최초 로딩: Supabase에서 draft_data 불러오기 ── */
  useEffect(() => {
    if (!siteId) { setLoading(false); return; }
    (async () => {
      const { data: row, error } = await supabase
        .from("site_content")
        .select("draft_data")
        .eq("site_id", siteId)
        .single();
      if (!error && row?.draft_data && Object.keys(row.draft_data).length > 0) {
        setData(row.draft_data);
      }
      skipNextSave.current = true;
      setLoading(false);
    })();
  }, [siteId]);

  /* ── 자동저장 (0.9초 디바운스) ── */
  useEffect(() => {
    if (!siteId || loading) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }

    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase
        .from("site_content")
        .update({ draft_data: data })
        .eq("site_id", siteId);
      setSaveStatus(error ? "error" : "saved");
      if (!error) setTimeout(() => setSaveStatus("idle"), 2000);
    }, 900);

    return () => clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handlePublish = async () => {
    if (!siteId) return;
    setPublishing(true);
    const { error } = await supabase
      .from("site_content")
      .update({ draft_data: data, published_data: data, published_at: new Date().toISOString() })
      .eq("site_id", siteId);
    if (!error) {
      await supabase.from("sites").update({ status: "published" }).eq("id", siteId);
      setPublishedUrl(`${subdomain}.mysite.com`);
    }
    setPublishing(false);
  };

  const setField = (section, field, value) => setData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  const doneCount = SECTIONS.filter((s) => isComplete(s.id, data)).length;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 10, color: FT.muted, fontFamily: "'Pretendard','Malgun Gothic',sans-serif" }}>
        <Loader2 size={18} className="spin" /> 불러오는 중...
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${FT.line}` }}>
      <style>{`.spin{animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── 최상단 바: 사이트 정보 + 발행 ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px",
        background: FT.ink, color: FT.white, fontFamily: "'Pretendard','Malgun Gothic',sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{subdomain ? `${subdomain}.mysite.com` : "미리보기 모드"}</span>
          {siteId && <SaveStatusBadge status={saveStatus} />}
        </div>
        {siteId && (
          <button onClick={handlePublish} disabled={publishing} style={{
            display: "flex", alignItems: "center", gap: 6, background: FT.accent, color: FT.white, border: "none",
            borderRadius: 999, padding: "7px 16px", fontSize: 12.5, fontWeight: 700, cursor: publishing ? "default" : "pointer",
          }}>
            {publishing ? <Loader2 size={13} className="spin" /> : <Rocket size={13} />}
            {publishing ? "발행 중..." : "발행하기"}
          </button>
        )}
      </div>

      {publishedUrl && (
        <div style={{ padding: "8px 18px", background: "#EAF4EC", color: FT.green, fontSize: 12.5, fontWeight: 600, fontFamily: "'Pretendard','Malgun Gothic',sans-serif" }}>
          ✓ 발행 완료! ({publishedUrl})
        </div>
      )}

      {isNarrow && (
        <div style={{ display: "flex", background: FT.paperDeep, borderBottom: `1px solid ${FT.line}` }}>
          {[{ id: "form", label: "입력하기", icon: PenLine }, { id: "preview", label: "미리보기", icon: Eye }].map((t) => (
            <button key={t.id} onClick={() => setMobileTab(t.id)} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 0",
              border: "none", background: mobileTab === t.id ? FT.paper : "transparent",
              borderBottom: mobileTab === t.id ? `2px solid ${FT.accent}` : "2px solid transparent",
              fontSize: 13, fontWeight: 700, color: mobileTab === t.id ? FT.ink : FT.muted, cursor: "pointer",
            }}><t.icon size={14} />{t.label}</button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", minHeight: 640, maxHeight: 780 }}>
        {/* ── 좌측: 입력폼 ── */}
        {(!isNarrow || mobileTab === "form") && (
          <div style={{ display: "flex", flex: isNarrow ? "1 1 100%" : "0 0 46%", background: FT.paper, minWidth: 0 }}>
            <aside style={{ width: 200, background: FT.paperDeep, borderRight: `1px solid ${FT.line}`, padding: "18px 10px", flexShrink: 0, overflowY: "auto" }}>
              <div style={{ padding: "0 8px 14px", borderBottom: `1px dashed ${FT.muted}`, marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: FT.muted, fontWeight: 700, letterSpacing: 1 }}>사장님 정보 입력</div>
                <div style={{ fontSize: 12, color: FT.inkSoft, marginTop: 4 }}>{doneCount} / {SECTIONS.length} 완료</div>
              </div>
              <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {SECTIONS.map((s) => {
                  const Icon = s.icon, done = isComplete(s.id, data), isActive = active === s.id;
                  return (
                    <button key={s.id} onClick={() => setActive(s.id)} style={{
                      display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "8px 10px",
                      borderRadius: 8, border: "none", cursor: "pointer", background: isActive ? FT.white : "transparent",
                      boxShadow: isActive ? "0 1px 3px rgba(38,32,25,.12)" : "none", color: isActive ? FT.ink : FT.inkSoft,
                      fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                    }}>
                      <Icon size={14} color={isActive ? FT.accent : FT.muted} />
                      <span style={{ flex: 1 }}>{s.label}</span>
                      {done && <span style={{ width: 14, height: 14, borderRadius: "50%", background: FT.accent, color: FT.white, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-8deg)", flexShrink: 0 }}><Check size={9} strokeWidth={3.5} /></span>}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <main style={{ flex: 1, padding: "24px 26px", overflowY: "auto", minWidth: 0, fontFamily: "'Pretendard','Malgun Gothic',-apple-system,BlinkMacSystemFont,sans-serif" }}>
              {active === "header" && (<>
                <SectionTitle title="헤더 · 상호명" desc="로고와 가게 이름이에요." />
                <FieldShell label="로고 이미지"><ImageUpload value={data.header.logoImage} onChange={(v) => setField("header", "logoImage", v)} ratioLabel="정사각형" /></FieldShell>
                <FieldShell label="상호명" required><TextInput value={data.header.businessName} maxLength={30} placeholder="예: 가양 소반" onChange={(v) => setField("header", "businessName", v)} /></FieldShell>
              </>)}
              {active === "hero" && (<>
                <SectionTitle title="메인 배너" desc="가장 먼저 보이는 화면이에요." />
                <FieldShell label="대표 배경 이미지" required><ImageUpload value={data.hero.heroImage} onChange={(v) => setField("hero", "heroImage", v)} ratioLabel="16:9" /></FieldShell>
                <FieldShell label="캐치프레이즈" required><TextInput value={data.hero.heroCatchphrase} maxLength={40} placeholder="예: 매일 아침 직접 구운 빵집" onChange={(v) => setField("hero", "heroCatchphrase", v)} /></FieldShell>
                <FieldShell label="보조 설명"><TextInput value={data.hero.heroSubtext} maxLength={80} onChange={(v) => setField("hero", "heroSubtext", v)} /></FieldShell>
                <FieldShell label="버튼 문구" required><SelectInput value={data.hero.heroCtaButton} onChange={(v) => setField("hero", "heroCtaButton", v)} options={["전화하기", "예약하기", "카카오톡 문의", "오시는길 보기"]} /></FieldShell>
              </>)}
              {active === "about" && (<>
                <SectionTitle title="소개" desc="가게의 이야기를 들려주세요." />
                <FieldShell label="소개 제목"><TextInput value={data.about.aboutTitle} maxLength={20} onChange={(v) => setField("about", "aboutTitle", v)} /></FieldShell>
                <FieldShell label="소개용 사진"><ImageUpload value={data.about.aboutImage} onChange={(v) => setField("about", "aboutImage", v)} /></FieldShell>
                <FieldShell label="소개 본문" required><TextArea value={data.about.aboutText} maxLength={500} rows={5} onChange={(v) => setField("about", "aboutText", v)} /></FieldShell>
                <FieldShell label="설립/개업 연도"><TextInput value={data.about.establishedYear} placeholder="예: 2015년" onChange={(v) => setField("about", "establishedYear", v)} /></FieldShell>
              </>)}
              {active === "menu" && <MenuEditor data={data.menu} setData={(v) => setData((p) => ({ ...p, menu: v }))} />}
              {active === "orderLinks" && (<>
                <SectionTitle title="배달 · 포장" desc="링크를 넣으면 버튼이 자동 생성돼요." />
                <FieldShell label="배달의민족 링크"><TextInput value={data.orderLinks.baeminUrl} onChange={(v) => setField("orderLinks", "baeminUrl", v)} /></FieldShell>
                <FieldShell label="쿠팡이츠 링크"><TextInput value={data.orderLinks.coupangEatsUrl} onChange={(v) => setField("orderLinks", "coupangEatsUrl", v)} /></FieldShell>
                <FieldShell label="요기요 링크"><TextInput value={data.orderLinks.yogiyoUrl} onChange={(v) => setField("orderLinks", "yogiyoUrl", v)} /></FieldShell>
                <FieldShell label="포장 가능 여부"><Toggle checked={data.orderLinks.takeoutAvailable} onChange={(v) => setField("orderLinks", "takeoutAvailable", v)} label={data.orderLinks.takeoutAvailable ? "가능" : "불가"} /></FieldShell>
              </>)}
              {active === "gallery" && (<>
                <SectionTitle title="갤러리" desc="매장 분위기를 보여주는 사진들이에요." />
                <FieldShell label="갤러리 제목"><TextInput value={data.gallery.galleryTitle} onChange={(v) => setField("gallery", "galleryTitle", v)} /></FieldShell>
                <FieldShell label="사진 목록">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {data.gallery.galleryImages.map((img, i) => (
                      <ImageUpload key={i} value={img} onChange={(v) => { const next = [...data.gallery.galleryImages]; if (v === "") next.splice(i, 1); else next[i] = v; setField("gallery", "galleryImages", next); }} />
                    ))}
                    {data.gallery.galleryImages.length < 20 && <ImageUpload value="" onChange={(v) => v && setField("gallery", "galleryImages", [...data.gallery.galleryImages, v])} />}
                  </div>
                </FieldShell>
              </>)}
              {active === "reviews" && (<>
                <SectionTitle title="후기" desc="신뢰도를 높이는 손님 후기예요." />
                <FieldShell label="리뷰 방식" required><SelectInput value={data.reviews.reviewSourceType} onChange={(v) => setField("reviews", "reviewSourceType", v)} options={["직접 입력", "네이버 리뷰 연동", "표시 안함"]} /></FieldShell>
                {data.reviews.reviewSourceType === "네이버 리뷰 연동" && <FieldShell label="네이버 플레이스 링크"><TextInput value={data.reviews.naverPlaceUrl} onChange={(v) => setField("reviews", "naverPlaceUrl", v)} /></FieldShell>}
                {data.reviews.reviewSourceType === "직접 입력" && (
                  <RepeatListEditor items={data.reviews.manualReviews} onChange={(v) => setField("reviews", "manualReviews", v)} max={10}
                    makeEmpty={() => ({ id: genId(), reviewerName: "", reviewText: "", reviewRating: "5" })} addLabel="후기 추가"
                    renderItem={(item, update) => (<>
                      <FieldShell label="작성자명" required><TextInput value={item.reviewerName} maxLength={15} onChange={(v) => update("reviewerName", v)} /></FieldShell>
                      <FieldShell label="후기 내용" required><TextArea value={item.reviewText} maxLength={200} rows={2} onChange={(v) => update("reviewText", v)} /></FieldShell>
                      <FieldShell label="별점"><SelectInput value={item.reviewRating} onChange={(v) => update("reviewRating", v)} options={["5", "4", "3", "2", "1"]} /></FieldShell>
                    </>)} />
                )}
              </>)}
              {active === "location" && (<>
                <SectionTitle title="오시는 길" desc="지도와 주소, 주차 정보예요." />
                <FieldShell label="주소" required><TextInput value={data.location.address} onChange={(v) => setField("location", "address", v)} /></FieldShell>
                <FieldShell label="상세 주소"><TextInput value={data.location.addressDetail} onChange={(v) => setField("location", "addressDetail", v)} /></FieldShell>
                <FieldShell label="지도 제공사" required><SelectInput value={data.location.mapProvider} onChange={(v) => setField("location", "mapProvider", v)} options={["카카오맵", "네이버맵"]} /></FieldShell>
                <FieldShell label="주차 안내"><TextArea value={data.location.parkingInfo} maxLength={150} rows={2} onChange={(v) => setField("location", "parkingInfo", v)} /></FieldShell>
                <FieldShell label="대중교통 안내"><TextArea value={data.location.transitInfo} maxLength={150} rows={2} onChange={(v) => setField("location", "transitInfo", v)} /></FieldShell>
              </>)}
              {active === "hours" && (<>
                <SectionTitle title="영업시간" desc="요일별 영업시간을 설정하세요." />
                <div style={{ border: `1px solid ${FT.line}`, borderRadius: 10, overflow: "hidden", marginBottom: 18 }}>
                  {data.hours.weeklyHours.map((row, i) => (
                    <div key={row.dayOfWeek} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: i < 6 ? `1px solid ${FT.line}` : "none", background: i % 2 === 0 ? FT.white : FT.paperDeep }}>
                      <span style={{ width: 20, fontWeight: 700, fontSize: 12.5 }}>{row.dayOfWeek}</span>
                      <Toggle checked={row.isOpen} onChange={(v) => { const next = [...data.hours.weeklyHours]; next[i] = { ...row, isOpen: v }; setField("hours", "weeklyHours", next); }} />
                      {row.isOpen ? (<>
                        <input type="time" value={row.openTime} onChange={(e) => { const next = [...data.hours.weeklyHours]; next[i] = { ...row, openTime: e.target.value }; setField("hours", "weeklyHours", next); }} style={{ ...inputBase, width: 100, padding: "5px 7px" }} />
                        <span style={{ color: FT.muted }}>~</span>
                        <input type="time" value={row.closeTime} onChange={(e) => { const next = [...data.hours.weeklyHours]; next[i] = { ...row, closeTime: e.target.value }; setField("hours", "weeklyHours", next); }} style={{ ...inputBase, width: 100, padding: "5px 7px" }} />
                      </>) : <span style={{ fontSize: 12, color: FT.muted }}>휴무</span>}
                    </div>
                  ))}
                </div>
                <FieldShell label="정기 휴무일"><TextInput value={data.hours.regularHoliday} onChange={(v) => setField("hours", "regularHoliday", v)} /></FieldShell>
                <FieldShell label="브레이크타임"><TextInput value={data.hours.breakTime} onChange={(v) => setField("hours", "breakTime", v)} /></FieldShell>
              </>)}
              {active === "contact" && (<>
                <SectionTitle title="예약 · 문의" desc="손님이 연락할 수 있는 방법이에요." />
                <FieldShell label="전화번호" required><TextInput value={data.contact.phoneNumber} placeholder="02-0000-0000" onChange={(v) => setField("contact", "phoneNumber", v)} /></FieldShell>
                <FieldShell label="카카오톡 채널 링크"><TextInput value={data.contact.kakaoChannelUrl} onChange={(v) => setField("contact", "kakaoChannelUrl", v)} /></FieldShell>
                <FieldShell label="인스타그램 링크"><TextInput value={data.contact.instagramUrl} onChange={(v) => setField("contact", "instagramUrl", v)} /></FieldShell>
                <FieldShell label="문의 폼 사용 여부"><Toggle checked={data.contact.enableInquiryForm} onChange={(v) => setField("contact", "enableInquiryForm", v)} label={data.contact.enableInquiryForm ? "사용함" : "사용 안함"} /></FieldShell>
              </>)}
              {active === "footer" && (<>
                <SectionTitle title="사업자 정보" desc="페이지 하단에 작게 표시됩니다." />
                <FieldShell label="사업자등록번호"><TextInput value={data.footer.businessRegistrationNumber} onChange={(v) => setField("footer", "businessRegistrationNumber", v)} /></FieldShell>
                <FieldShell label="대표자명"><TextInput value={data.footer.representativeName} onChange={(v) => setField("footer", "representativeName", v)} /></FieldShell>
                <FieldShell label="저작권 표기 문구"><TextInput value={data.footer.footerCopyrightText} placeholder="© 2026 가게이름" onChange={(v) => setField("footer", "footerCopyrightText", v)} /></FieldShell>
              </>)}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, paddingTop: 16, borderTop: `1px solid ${FT.line}` }}>
                {(() => {
                  const idx = SECTIONS.findIndex((s) => s.id === active);
                  const next = SECTIONS[idx + 1];
                  return next ? (
                    <button onClick={() => setActive(next.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: FT.accent, color: FT.white, border: "none", borderRadius: 999, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      다음: {next.label} <ChevronRight size={14} />
                    </button>
                  ) : null;
                })()}
              </div>
            </main>
          </div>
        )}

        {/* ── 우측: 실시간 미리보기 ── */}
        {(!isNarrow || mobileTab === "preview") && (
          <div style={{ flex: isNarrow ? "1 1 100%" : "1 1 54%", background: "#E8E1D3", display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${FT.line}`, background: "#DED5C2" }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: FT.inkSoft, display: "flex", alignItems: "center", gap: 6 }}><Eye size={13} />실시간 미리보기</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setViewport("desktop")} style={{ width: 28, height: 26, display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderRadius: 6, background: viewport === "desktop" ? FT.white : "transparent", cursor: "pointer", color: FT.inkSoft }}><Monitor size={14} /></button>
                <button onClick={() => setViewport("mobile")} style={{ width: 28, height: 26, display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderRadius: 6, background: viewport === "mobile" ? FT.white : "transparent", cursor: "pointer", color: FT.inkSoft }}><Smartphone size={14} /></button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: viewport === "mobile" ? "20px 0" : 0, display: "flex", justifyContent: "center" }}>
              <div style={{
                width: viewport === "mobile" ? 375 : "100%", maxWidth: "100%", background: ST.paper,
                boxShadow: viewport === "mobile" ? "0 0 0 10px #2A2620, 0 8px 30px rgba(0,0,0,.3)" : "none",
                borderRadius: viewport === "mobile" ? 22 : 0, overflow: "hidden", height: viewport === "mobile" ? "fit-content" : "auto",
              }}>
                <SitePreview data={data} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}