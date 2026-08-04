"use client";

import React, { useState } from "react";
import {
  Store, Image as ImageIcon, Info, UtensilsCrossed, Truck, Images,
  MessageSquareText, MapPin, Clock, Phone, FileText, Plus, Trash2,
  Check, ChevronRight, Upload, X, Star,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   디자인 토큰 — "주문표(order ticket)" 컨셉
   종이 색 바탕 + 도장(스탬프) 느낌의 완료 표시로
   한국 소상공인의 실제 서류/전표 정서를 참조함
──────────────────────────────────────────────────────────── */
const T = {
  paper: "#FAF6EF",
  paperDeep: "#F1EADC",
  ink: "#262019",
  inkSoft: "#5C5346",
  accent: "#C1440E",
  accentSoft: "#F4DCC9",
  green: "#2F5233",
  muted: "#A69C8C",
  line: "#E4DACB",
  white: "#FFFFFF",
  danger: "#B3261E",
};

const genId = () => Math.random().toString(36).slice(2, 9);

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

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const initialData = {
  header: { logoImage: "", businessName: "" },
  hero: { heroImage: "", heroCatchphrase: "", heroSubtext: "", heroCtaButton: "전화하기" },
  about: { aboutTitle: "우리 가게를 소개합니다", aboutImage: "", aboutText: "", establishedYear: "" },
  menu: {
    menuSectionTitle: "메뉴판",
    menuCategories: [
      {
        id: genId(),
        categoryName: "",
        menuItems: [
          { id: genId(), menuName: "", menuImage: "", menuPrice: "", menuDescription: "", isSignature: false, isSoldOut: false },
        ],
      },
    ],
  },
  orderLinks: { baeminUrl: "", coupangEatsUrl: "", yogiyoUrl: "", takeoutAvailable: false },
  gallery: { galleryTitle: "매장 둘러보기", galleryImages: [] },
  reviews: { reviewSourceType: "직접 입력", manualReviews: [], naverPlaceUrl: "" },
  location: { address: "", addressDetail: "", mapProvider: "카카오맵", parkingInfo: "", transitInfo: "" },
  hours: {
    weeklyHours: DAYS.map((d) => ({ dayOfWeek: d, isOpen: true, openTime: "09:00", closeTime: "21:00" })),
    regularHoliday: "",
    breakTime: "",
  },
  contact: { phoneNumber: "", kakaoChannelUrl: "", instagramUrl: "", enableInquiryForm: false, inquiryFormNotifyEmail: "" },
  footer: { businessRegistrationNumber: "", representativeName: "", footerCopyrightText: "" },
};

/* ── 공통 입력 프리미티브 ─────────────────────────────────── */
function FieldShell({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
        {label}
        {required && <span style={{ color: T.accent, fontSize: 16, lineHeight: 0 }}>·</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{hint}</p>}
    </div>
  );
}

const inputBase = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${T.line}`,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  color: T.ink,
  background: T.white,
  outline: "none",
  fontFamily: "inherit",
};

function TextInput({ value, onChange, placeholder, maxLength }) {
  return (
    <input
      style={inputBase}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => (e.target.style.borderColor = T.accent)}
      onBlur={(e) => (e.target.style.borderColor = T.line)}
    />
  );
}

function TextArea({ value, onChange, placeholder, maxLength, rows = 4 }) {
  return (
    <textarea
      style={{ ...inputBase, resize: "vertical", fontFamily: "inherit" }}
      rows={rows}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => (e.target.style.borderColor = T.accent)}
      onBlur={(e) => (e.target.style.borderColor = T.line)}
    />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select style={{ ...inputBase, cursor: "pointer" }} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        display: "flex", alignItems: "center", gap: 10, border: "none",
        background: "transparent", cursor: "pointer", padding: 0,
      }}
    >
      <span style={{
        width: 38, height: 22, borderRadius: 999, position: "relative",
        background: checked ? T.accent : T.line, transition: "background .15s",
      }}>
        <span style={{
          position: "absolute", top: 2, left: checked ? 18 : 2,
          width: 18, height: 18, borderRadius: "50%", background: T.white,
          transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,.25)",
        }} />
      </span>
      {label && <span style={{ fontSize: 13, color: T.inkSoft }}>{label}</span>}
    </button>
  );
}

function ImageUpload({ value, onChange, ratioLabel = "권장 비율 4:3" }) {
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      {value ? (
        <div style={{ position: "relative", width: 160, height: 120 }}>
          <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: `1px solid ${T.line}` }} />
          <button
            onClick={() => onChange("")}
            style={{
              position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%",
              background: T.danger, color: T.white, border: `2px solid ${T.paper}`, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <label style={{
          width: 160, height: 120, borderRadius: 8, border: `1.5px dashed ${T.line}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 6, cursor: "pointer", color: T.muted, background: T.paperDeep,
        }}>
          <Upload size={18} />
          <span style={{ fontSize: 11 }}>사진 업로드</span>
          <span style={{ fontSize: 10 }}>{ratioLabel}</span>
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        </label>
      )}
    </div>
  );
}

function GhostButton({ children, onClick, tone = "accent" }) {
  const color = tone === "accent" ? T.accent : T.danger;
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
        border: `1px solid ${color}`, color, borderRadius: 999, padding: "6px 14px",
        fontSize: 12.5, fontWeight: 600, cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

/* ── 섹션 완료 여부 (도장 판정용) ─────────────────────────── */
function isComplete(id, data) {
  switch (id) {
    case "header": return !!data.header.businessName;
    case "hero": return !!data.hero.heroImage && !!data.hero.heroCatchphrase;
    case "about": return !!data.about.aboutText;
    case "menu": return data.menu.menuCategories.some(
      (c) => c.categoryName && c.menuItems.some((m) => m.menuName && m.menuPrice)
    );
    case "location": return !!data.location.address;
    case "contact": return !!data.contact.phoneNumber;
    default: return true;
  }
}

/* ── 메인 컴포넌트 ────────────────────────────────────────── */
export default function RestaurantInputForm() {
  const [data, setData] = useState(initialData);
  const [active, setActive] = useState("header");

  const setField = (section, field, value) =>
    setData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

  const doneCount = SECTIONS.filter((s) => isComplete(s.id, data)).length;

  return (
    <div style={{
      display: "flex", minHeight: 640, background: T.paper, fontFamily:
        "'Pretendard','Malgun Gothic',-apple-system,BlinkMacSystemFont,sans-serif",
      borderRadius: 16, overflow: "hidden", border: `1px solid ${T.line}`,
    }}>
      {/* ── 사이드바 ── */}
      <aside style={{ width: 236, background: T.paperDeep, borderRight: `1px solid ${T.line}`, padding: "22px 14px", flexShrink: 0 }}>
        <div style={{ padding: "0 10px 18px", borderBottom: `1px dashed ${T.muted}`, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: 1 }}>사장님 정보 입력</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, marginTop: 4 }}>음식점 · 카페</div>
          <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 6 }}>{doneCount} / {SECTIONS.length} 섹션 완료</div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const done = isComplete(s.id, data);
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                  padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: isActive ? T.white : "transparent",
                  boxShadow: isActive ? "0 1px 3px rgba(38,32,25,.12)" : "none",
                  color: isActive ? T.ink : T.inkSoft, fontSize: 13.5, fontWeight: isActive ? 700 : 500,
                }}
              >
                <Icon size={16} color={isActive ? T.accent : T.muted} />
                <span style={{ flex: 1 }}>{s.label}</span>
                {done && (
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%", background: T.accent,
                    color: T.white, display: "flex", alignItems: "center", justifyContent: "center",
                    transform: "rotate(-8deg)", flexShrink: 0,
                  }}>
                    <Check size={10} strokeWidth={3.5} />
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── 메인 폼 영역 ── */}
      <main style={{ flex: 1, padding: "30px 44px", overflowY: "auto" }}>
        <div style={{ maxWidth: 560 }}>
          {active === "header" && (
            <>
              <SectionTitle title="헤더 · 상호명" desc="홈페이지 맨 위에 표시될 로고와 가게 이름이에요." />
              <FieldShell label="로고 이미지">
                <ImageUpload value={data.header.logoImage} onChange={(v) => setField("header", "logoImage", v)} ratioLabel="정사각형 권장" />
              </FieldShell>
              <FieldShell label="상호명" required>
                <TextInput value={data.header.businessName} maxLength={30} placeholder="예: 가양 소반" onChange={(v) => setField("header", "businessName", v)} />
              </FieldShell>
            </>
          )}

          {active === "hero" && (
            <>
              <SectionTitle title="메인 배너" desc="방문객이 가장 먼저 보게 될 화면이에요." />
              <FieldShell label="대표 배경 이미지" required>
                <ImageUpload value={data.hero.heroImage} onChange={(v) => setField("hero", "heroImage", v)} ratioLabel="가로형 권장 16:9" />
              </FieldShell>
              <FieldShell label="캐치프레이즈" required hint="한 줄로 가게를 표현하는 문구예요.">
                <TextInput value={data.hero.heroCatchphrase} maxLength={40} placeholder="예: 매일 아침 직접 구운 빵집" onChange={(v) => setField("hero", "heroCatchphrase", v)} />
              </FieldShell>
              <FieldShell label="보조 설명 문구">
                <TextInput value={data.hero.heroSubtext} maxLength={80} placeholder="예: 20년 전통 화덕 피자" onChange={(v) => setField("hero", "heroSubtext", v)} />
              </FieldShell>
              <FieldShell label="버튼 문구" required>
                <SelectInput
                  value={data.hero.heroCtaButton}
                  onChange={(v) => setField("hero", "heroCtaButton", v)}
                  options={["전화하기", "예약하기", "카카오톡 문의", "오시는길 보기"]}
                />
              </FieldShell>
            </>
          )}

          {active === "about" && (
            <>
              <SectionTitle title="소개" desc="가게의 이야기를 들려주세요." />
              <FieldShell label="소개 섹션 제목">
                <TextInput value={data.about.aboutTitle} maxLength={20} onChange={(v) => setField("about", "aboutTitle", v)} />
              </FieldShell>
              <FieldShell label="소개용 사진">
                <ImageUpload value={data.about.aboutImage} onChange={(v) => setField("about", "aboutImage", v)} />
              </FieldShell>
              <FieldShell label="소개 본문" required>
                <TextArea value={data.about.aboutText} maxLength={500} rows={5} placeholder="가게를 시작하게 된 이야기, 자부심을 가진 부분 등을 자유롭게 적어주세요." onChange={(v) => setField("about", "aboutText", v)} />
              </FieldShell>
              <FieldShell label="설립/개업 연도">
                <TextInput value={data.about.establishedYear} placeholder="예: 2015년" onChange={(v) => setField("about", "establishedYear", v)} />
              </FieldShell>
            </>
          )}

          {active === "menu" && <MenuEditor data={data.menu} setData={(v) => setData((p) => ({ ...p, menu: v }))} />}

          {active === "orderLinks" && (
            <>
              <SectionTitle title="배달 · 포장" desc="배달앱 링크를 연결하면 버튼이 자동으로 생성돼요." />
              <FieldShell label="배달의민족 링크">
                <TextInput value={data.orderLinks.baeminUrl} placeholder="https://baemin.com/..." onChange={(v) => setField("orderLinks", "baeminUrl", v)} />
              </FieldShell>
              <FieldShell label="쿠팡이츠 링크">
                <TextInput value={data.orderLinks.coupangEatsUrl} placeholder="https://coupangeats.com/..." onChange={(v) => setField("orderLinks", "coupangEatsUrl", v)} />
              </FieldShell>
              <FieldShell label="요기요 링크">
                <TextInput value={data.orderLinks.yogiyoUrl} placeholder="https://yogiyo.co.kr/..." onChange={(v) => setField("orderLinks", "yogiyoUrl", v)} />
              </FieldShell>
              <FieldShell label="포장 가능 여부">
                <Toggle checked={data.orderLinks.takeoutAvailable} onChange={(v) => setField("orderLinks", "takeoutAvailable", v)} label={data.orderLinks.takeoutAvailable ? "포장 가능" : "포장 불가"} />
              </FieldShell>
            </>
          )}

          {active === "gallery" && (
            <>
              <SectionTitle title="갤러리" desc="매장 내부, 분위기를 보여주는 사진들이에요." />
              <FieldShell label="갤러리 섹션 제목">
                <TextInput value={data.gallery.galleryTitle} onChange={(v) => setField("gallery", "galleryTitle", v)} />
              </FieldShell>
              <FieldShell label="사진 목록 (최대 20장)">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {data.gallery.galleryImages.map((img, i) => (
                    <ImageUpload
                      key={i}
                      value={img}
                      onChange={(v) => {
                        const next = [...data.gallery.galleryImages];
                        if (v === "") next.splice(i, 1); else next[i] = v;
                        setField("gallery", "galleryImages", next);
                      }}
                    />
                  ))}
                  {data.gallery.galleryImages.length < 20 && (
                    <ImageUpload value="" onChange={(v) => v && setField("gallery", "galleryImages", [...data.gallery.galleryImages, v])} />
                  )}
                </div>
              </FieldShell>
            </>
          )}

          {active === "reviews" && (
            <>
              <SectionTitle title="후기" desc="신뢰도를 높이는 손님 후기예요." />
              <FieldShell label="리뷰 방식" required>
                <SelectInput
                  value={data.reviews.reviewSourceType}
                  onChange={(v) => setField("reviews", "reviewSourceType", v)}
                  options={["직접 입력", "네이버 리뷰 연동", "표시 안함"]}
                />
              </FieldShell>
              {data.reviews.reviewSourceType === "네이버 리뷰 연동" && (
                <FieldShell label="네이버 플레이스 링크">
                  <TextInput value={data.reviews.naverPlaceUrl} placeholder="https://naver.me/..." onChange={(v) => setField("reviews", "naverPlaceUrl", v)} />
                </FieldShell>
              )}
              {data.reviews.reviewSourceType === "직접 입력" && (
                <RepeatListEditor
                  items={data.reviews.manualReviews}
                  onChange={(v) => setField("reviews", "manualReviews", v)}
                  max={10}
                  makeEmpty={() => ({ id: genId(), reviewerName: "", reviewText: "", reviewRating: "5" })}
                  addLabel="후기 추가"
                  renderItem={(item, update) => (
                    <>
                      <FieldShell label="작성자명" required>
                        <TextInput value={item.reviewerName} maxLength={15} onChange={(v) => update("reviewerName", v)} />
                      </FieldShell>
                      <FieldShell label="후기 내용" required>
                        <TextArea value={item.reviewText} maxLength={200} rows={2} onChange={(v) => update("reviewText", v)} />
                      </FieldShell>
                      <FieldShell label="별점">
                        <SelectInput value={item.reviewRating} onChange={(v) => update("reviewRating", v)} options={["5", "4", "3", "2", "1"]} />
                      </FieldShell>
                    </>
                  )}
                />
              )}
            </>
          )}

          {active === "location" && (
            <>
              <SectionTitle title="오시는 길" desc="지도와 주소, 주차 정보예요." />
              <FieldShell label="주소" required>
                <TextInput value={data.location.address} placeholder="도로명 주소" onChange={(v) => setField("location", "address", v)} />
              </FieldShell>
              <FieldShell label="상세 주소">
                <TextInput value={data.location.addressDetail} placeholder="층 / 호수" onChange={(v) => setField("location", "addressDetail", v)} />
              </FieldShell>
              <FieldShell label="지도 제공사" required>
                <SelectInput value={data.location.mapProvider} onChange={(v) => setField("location", "mapProvider", v)} options={["카카오맵", "네이버맵"]} />
              </FieldShell>
              <FieldShell label="주차 안내">
                <TextArea value={data.location.parkingInfo} maxLength={150} rows={2} onChange={(v) => setField("location", "parkingInfo", v)} />
              </FieldShell>
              <FieldShell label="대중교통 안내">
                <TextArea value={data.location.transitInfo} maxLength={150} rows={2} onChange={(v) => setField("location", "transitInfo", v)} />
              </FieldShell>
            </>
          )}

          {active === "hours" && (
            <>
              <SectionTitle title="영업시간" desc="요일별 영업시간을 설정하세요." />
              <div style={{ border: `1px solid ${T.line}`, borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
                {data.hours.weeklyHours.map((row, i) => (
                  <div key={row.dayOfWeek} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                    borderBottom: i < 6 ? `1px solid ${T.line}` : "none",
                    background: i % 2 === 0 ? T.white : T.paperDeep,
                  }}>
                    <span style={{ width: 24, fontWeight: 700, fontSize: 13, color: T.ink }}>{row.dayOfWeek}</span>
                    <Toggle
                      checked={row.isOpen}
                      onChange={(v) => {
                        const next = [...data.hours.weeklyHours];
                        next[i] = { ...row, isOpen: v };
                        setField("hours", "weeklyHours", next);
                      }}
                    />
                    {row.isOpen ? (
                      <>
                        <input type="time" value={row.openTime} onChange={(e) => {
                          const next = [...data.hours.weeklyHours];
                          next[i] = { ...row, openTime: e.target.value };
                          setField("hours", "weeklyHours", next);
                        }} style={{ ...inputBase, width: 110, padding: "6px 8px" }} />
                        <span style={{ color: T.muted }}>~</span>
                        <input type="time" value={row.closeTime} onChange={(e) => {
                          const next = [...data.hours.weeklyHours];
                          next[i] = { ...row, closeTime: e.target.value };
                          setField("hours", "weeklyHours", next);
                        }} style={{ ...inputBase, width: 110, padding: "6px 8px" }} />
                      </>
                    ) : <span style={{ fontSize: 12.5, color: T.muted }}>휴무</span>}
                  </div>
                ))}
              </div>
              <FieldShell label="정기 휴무일">
                <TextInput value={data.hours.regularHoliday} placeholder="예: 매주 월요일" onChange={(v) => setField("hours", "regularHoliday", v)} />
              </FieldShell>
              <FieldShell label="브레이크타임">
                <TextInput value={data.hours.breakTime} placeholder="예: 15:00 ~ 17:00" onChange={(v) => setField("hours", "breakTime", v)} />
              </FieldShell>
            </>
          )}

          {active === "contact" && (
            <>
              <SectionTitle title="예약 · 문의" desc="손님이 연락할 수 있는 방법이에요." />
              <FieldShell label="전화번호" required>
                <TextInput value={data.contact.phoneNumber} placeholder="02-0000-0000" onChange={(v) => setField("contact", "phoneNumber", v)} />
              </FieldShell>
              <FieldShell label="카카오톡 채널 링크">
                <TextInput value={data.contact.kakaoChannelUrl} onChange={(v) => setField("contact", "kakaoChannelUrl", v)} />
              </FieldShell>
              <FieldShell label="인스타그램 링크">
                <TextInput value={data.contact.instagramUrl} onChange={(v) => setField("contact", "instagramUrl", v)} />
              </FieldShell>
              <FieldShell label="문의 폼 사용 여부">
                <Toggle checked={data.contact.enableInquiryForm} onChange={(v) => setField("contact", "enableInquiryForm", v)} label={data.contact.enableInquiryForm ? "사용함" : "사용 안함"} />
              </FieldShell>
              {data.contact.enableInquiryForm && (
                <FieldShell label="문의 접수 알림 받을 이메일">
                  <TextInput value={data.contact.inquiryFormNotifyEmail} onChange={(v) => setField("contact", "inquiryFormNotifyEmail", v)} />
                </FieldShell>
              )}
            </>
          )}

          {active === "footer" && (
            <>
              <SectionTitle title="사업자 정보" desc="페이지 하단에 작게 표시됩니다." />
              <FieldShell label="사업자등록번호">
                <TextInput value={data.footer.businessRegistrationNumber} onChange={(v) => setField("footer", "businessRegistrationNumber", v)} />
              </FieldShell>
              <FieldShell label="대표자명">
                <TextInput value={data.footer.representativeName} onChange={(v) => setField("footer", "representativeName", v)} />
              </FieldShell>
              <FieldShell label="저작권 표기 문구">
                <TextInput value={data.footer.footerCopyrightText} placeholder="© 2026 가게이름. All rights reserved." onChange={(v) => setField("footer", "footerCopyrightText", v)} />
              </FieldShell>
            </>
          )}

          <SaveBar sectionId={active} sections={SECTIONS} onNext={setActive} />
        </div>
      </main>
    </div>
  );
}

function SectionTitle({ title, desc }) {
  return (
    <div style={{ marginBottom: 26, paddingBottom: 16, borderBottom: `1px dashed ${T.line}` }}>
      <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: T.ink }}>{title}</h2>
      <p style={{ margin: "6px 0 0", fontSize: 13, color: T.muted }}>{desc}</p>
    </div>
  );
}

function SaveBar({ sectionId, sections, onNext }) {
  const idx = sections.findIndex((s) => s.id === sectionId);
  const next = sections[idx + 1];
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, paddingTop: 18, borderTop: `1px solid ${T.line}` }}>
      {next && (
        <button
          onClick={() => onNext(next.id)}
          style={{
            display: "flex", alignItems: "center", gap: 6, background: T.accent, color: T.white,
            border: "none", borderRadius: 999, padding: "10px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
          }}
        >
          다음: {next.label} <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}

/* ── 재사용 가능한 반복목록 에디터 (후기 등 단순 1단 반복용) ── */
function RepeatListEditor({ items, onChange, makeEmpty, renderItem, max = 10, addLabel = "항목 추가" }) {
  const update = (i, field, value) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => items.length < max && onChange([...items, makeEmpty()]);

  return (
    <div>
      {items.map((item, i) => (
        <div key={item.id} style={{ border: `1px solid ${T.line}`, borderRadius: 10, padding: 16, marginBottom: 12, background: T.white, position: "relative" }}>
          <button onClick={() => remove(i)} style={{ position: "absolute", top: 12, right: 12, background: "transparent", border: "none", color: T.muted, cursor: "pointer" }}>
            <Trash2 size={15} />
          </button>
          {renderItem(item, (field, value) => update(i, field, value))}
        </div>
      ))}
      {items.length < max && <GhostButton onClick={add}><Plus size={14} />{addLabel}</GhostButton>}
    </div>
  );
}

/* ── 메뉴 전용 에디터: 카테고리 → 메뉴 2단 반복구조 ─────────── */
function MenuEditor({ data, setData }) {
  const updateTitle = (v) => setData({ ...data, menuSectionTitle: v });

  const updateCategory = (ci, field, value) => {
    const next = [...data.menuCategories];
    next[ci] = { ...next[ci], [field]: value };
    setData({ ...data, menuCategories: next });
  };
  const addCategory = () => setData({
    ...data,
    menuCategories: [...data.menuCategories, { id: genId(), categoryName: "", menuItems: [] }],
  });
  const removeCategory = (ci) => setData({ ...data, menuCategories: data.menuCategories.filter((_, i) => i !== ci) });

  const updateItem = (ci, ii, field, value) => {
    const next = [...data.menuCategories];
    const items = [...next[ci].menuItems];
    items[ii] = { ...items[ii], [field]: value };
    next[ci] = { ...next[ci], menuItems: items };
    setData({ ...data, menuCategories: next });
  };
  const addItem = (ci) => {
    const next = [...data.menuCategories];
    next[ci] = { ...next[ci], menuItems: [...next[ci].menuItems, { id: genId(), menuName: "", menuImage: "", menuPrice: "", menuDescription: "", isSignature: false, isSoldOut: false }] };
    setData({ ...data, menuCategories: next });
  };
  const removeItem = (ci, ii) => {
    const next = [...data.menuCategories];
    next[ci] = { ...next[ci], menuItems: next[ci].menuItems.filter((_, i) => i !== ii) };
    setData({ ...data, menuCategories: next });
  };

  return (
    <>
      <SectionTitle title="메뉴" desc="카테고리별로 메뉴를 등록하세요. (예: 커피 / 디저트 / 식사류)" />
      <FieldShell label="메뉴 섹션 제목">
        <TextInput value={data.menuSectionTitle} onChange={updateTitle} />
      </FieldShell>

      {data.menuCategories.map((cat, ci) => (
        <div key={cat.id} style={{ border: `1.5px solid ${T.line}`, borderRadius: 12, padding: 18, marginBottom: 16, background: T.white }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <TextInput value={cat.categoryName} placeholder="카테고리명 (예: 커피)" onChange={(v) => updateCategory(ci, "categoryName", v)} />
            </div>
            {data.menuCategories.length > 1 && (
              <button onClick={() => removeCategory(ci)} style={{ background: "transparent", border: "none", color: T.danger, cursor: "pointer" }}>
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cat.menuItems.map((item, ii) => (
              <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: T.paperDeep, borderRadius: 10, padding: 12 }}>
                <ImageUpload value={item.menuImage} onChange={(v) => updateItem(ci, ii, "menuImage", v)} ratioLabel="1:1" />
                <div style={{ flex: 1, display: "grid", gap: 8 }}>
                  <input style={inputBase} placeholder="메뉴명" value={item.menuName} maxLength={30} onChange={(e) => updateItem(ci, ii, "menuName", e.target.value)} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <input style={{ ...inputBase, width: 130 }} placeholder="가격 (예: 4,500원)" value={item.menuPrice} onChange={(e) => updateItem(ci, ii, "menuPrice", e.target.value)} />
                    <input style={inputBase} placeholder="메뉴 설명 (선택)" value={item.menuDescription} maxLength={60} onChange={(e) => updateItem(ci, ii, "menuDescription", e.target.value)} />
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: T.inkSoft, cursor: "pointer" }}>
                      <Toggle checked={item.isSignature} onChange={(v) => updateItem(ci, ii, "isSignature", v)} />
                      <Star size={13} color={T.accent} /> 대표메뉴
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: T.inkSoft, cursor: "pointer" }}>
                      <Toggle checked={item.isSoldOut} onChange={(v) => updateItem(ci, ii, "isSoldOut", v)} />
                      품절
                    </label>
                  </div>
                </div>
                <button onClick={() => removeItem(ci, ii)} style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <GhostButton onClick={() => addItem(ci)}><Plus size={13} />메뉴 추가</GhostButton>
          </div>
        </div>
      ))}

      <GhostButton onClick={addCategory} tone="accent"><Plus size={14} />카테고리 추가</GhostButton>
    </>
  );
}
