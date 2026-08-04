"use client";

import React, { useState, useMemo } from "react";
import {
  Phone, MapPin, Clock, Camera, MessageCircle, Star, ChevronLeft,
  ChevronRight, X, Navigation, Car, Bus, Truck, ShoppingBag,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   디자인 토큰 — "손글씨 메뉴판 + 영수증" 컨셉
   입력폼(주문표 모티프)과 짝을 이루도록, 완성된 실제 사이트는
   "간판/메뉴판" 정서로 설계함: 아이보리 한지 배경, 브릭레드 간판색,
   가격표는 영수증처럼 표(tabular) 정렬.
──────────────────────────────────────────────────────────── */
const T = {
  paper: "#FBF3E7",
  paperDeep: "#F3E6D2",
  ink: "#1F1B16",
  inkSoft: "#5C5346",
  accent: "#A6321D",   // 간판 레드
  gold: "#C98A2C",     // 대표메뉴 리본
  line: "#E3D5BE",
  muted: "#8B7E6A",
  white: "#FFFFFF",
};

/* 데모용 샘플 데이터 — RestaurantInputForm의 data와 동일한 스키마 */
const sampleData = {
  header: { logoImage: "", businessName: "가양 소반" },
  hero: {
    heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop",
    heroCatchphrase: "매일 아침 직접 끓이는 국물, 가양 소반",
    heroSubtext: "3대째 이어온 손맛, 30년 노포의 진심",
    heroCtaButton: "전화하기",
  },
  about: {
    aboutTitle: "우리 가게를 소개합니다",
    aboutImage: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1200&auto=format&fit=crop",
    aboutText: "1996년 문을 연 이후 한결같이 매일 새벽 육수를 우려내고 있습니다. 화학조미료 없이 정직한 재료만을 사용하며, 단골손님들의 발걸음이 저희 가게의 자부심입니다.",
    establishedYear: "1996년",
  },
  menu: {
    menuSectionTitle: "메뉴판",
    menuCategories: [
      {
        id: "c1", categoryName: "식사",
        menuItems: [
          { id: "m1", menuName: "된장찌개 정식", menuImage: "https://images.unsplash.com/photo-1583224964978-2d4b1c8dfa42?q=80&w=800&auto=format&fit=crop", menuPrice: "9,000원", menuDescription: "직접 담근 된장으로 끓인 구수한 한상", isSignature: true, isSoldOut: false },
          { id: "m2", menuName: "제육볶음", menuImage: "", menuPrice: "10,000원", menuDescription: "매콤달콤 불맛 제육", isSignature: false, isSoldOut: false },
          { id: "m3", menuName: "순두부찌개", menuImage: "", menuPrice: "9,000원", menuDescription: "", isSignature: false, isSoldOut: true },
        ],
      },
      {
        id: "c2", categoryName: "사이드",
        menuItems: [
          { id: "m4", menuName: "계란말이", menuImage: "", menuPrice: "5,000원", menuDescription: "", isSignature: false, isSoldOut: false },
        ],
      },
    ],
  },
  orderLinks: { baeminUrl: "https://baemin.com", coupangEatsUrl: "", yogiyoUrl: "https://yogiyo.co.kr", takeoutAvailable: true },
  gallery: {
    galleryTitle: "매장 둘러보기",
    galleryImages: [
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
    ],
  },
  reviews: {
    reviewSourceType: "직접 입력",
    manualReviews: [
      { id: "r1", reviewerName: "김**", reviewText: "국물이 정말 깊고 진해요. 어머니 손맛 그대로입니다.", reviewRating: "5" },
      { id: "r2", reviewerName: "박**", reviewText: "회사 근처라 자주 가는데 늘 만족스러워요.", reviewRating: "5" },
    ],
    naverPlaceUrl: "",
  },
  location: {
    address: "서울특별시 강서구 허준로 217",
    addressDetail: "1층",
    mapProvider: "카카오맵",
    parkingInfo: "건물 앞 2대 무료 주차 가능합니다.",
    transitInfo: "증미역 3번 출구에서 도보 5분",
  },
  hours: {
    weeklyHours: ["월","화","수","목","금","토","일"].map((d) => ({
      dayOfWeek: d, isOpen: d !== "일", openTime: "09:00", closeTime: "21:00",
    })),
    regularHoliday: "매주 일요일",
    breakTime: "15:00 ~ 17:00",
  },
  contact: { phoneNumber: "02-1234-5678", kakaoChannelUrl: "https://pf.kakao.com", instagramUrl: "https://instagram.com", enableInquiryForm: true, inquiryFormNotifyEmail: "" },
  footer: { businessRegistrationNumber: "123-45-67890", representativeName: "조진혁", footerCopyrightText: "© 2026 가양 소반. All rights reserved." },
};

const CTA_ACTION = {
  "전화하기": (d) => `tel:${d.contact.phoneNumber}`,
  "예약하기": () => "#contact",
  "카카오톡 문의": (d) => d.contact.kakaoChannelUrl || "#contact",
  "오시는길 보기": () => "#location",
};

const TODAY_KR = ["일", "월", "화", "수", "목", "금", "토"][new Date().getDay()];

export default function RestaurantSitePreview({ data }) {
  const d = data || sampleData;
  const [lightbox, setLightbox] = useState(null);

  const hasOrderLinks = d.orderLinks && (d.orderLinks.baeminUrl || d.orderLinks.coupangEatsUrl || d.orderLinks.yogiyoUrl || d.orderLinks.takeoutAvailable);
  const heroHref = (CTA_ACTION[d.hero.heroCtaButton] || CTA_ACTION["전화하기"])(d);

  return (
    <div style={{ background: T.paper, color: T.ink, fontFamily: "'Pretendard','Malgun Gothic',-apple-system,BlinkMacSystemFont,sans-serif", borderRadius: 16, overflow: "hidden", border: `1px solid ${T.line}` }}>
      <style>{`
        .rsp-menu-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .rsp-gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .rsp-about-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        .rsp-review-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 640px) {
          .rsp-about-grid { grid-template-columns: 1fr 1fr; align-items: center; }
          .rsp-review-grid { grid-template-columns: 1fr 1fr; }
        }
        .rsp-order-btn:hover, .rsp-nav a:hover { opacity: .75; }
      `}</style>

      {/* ── 헤더 ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: `${T.paper}F2`, backdropFilter: "blur(6px)", borderBottom: `1px solid ${T.line}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {d.header.logoImage && <img src={d.header.logoImage} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />}
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>{d.header.businessName || "가게 이름"}</span>
        </div>
        <nav className="rsp-nav" style={{ display: "flex", gap: 18, fontSize: 13, fontWeight: 600, color: T.inkSoft }}>
          <a href="#menu" style={{ color: "inherit", textDecoration: "none" }}>메뉴</a>
          <a href="#location" style={{ color: "inherit", textDecoration: "none" }}>오시는길</a>
          <a href="#contact" style={{ color: "inherit", textDecoration: "none" }}>문의</a>
        </nav>
      </header>

      {/* ── 히어로 ── */}
      <section style={{ position: "relative", minHeight: 420, display: "flex", alignItems: "flex-end" }}>
        {d.hero.heroImage && (
          <img src={d.hero.heroImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(31,27,22,.15) 0%, rgba(31,27,22,.75) 100%)" }} />
        <div style={{ position: "relative", padding: "40px 28px 34px", color: T.white, width: "100%" }}>
          <p style={{ fontSize: 12.5, letterSpacing: 3, textTransform: "uppercase", color: T.gold, fontWeight: 700, margin: "0 0 10px" }}>Since {d.about.establishedYear || ""}</p>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 800, lineHeight: 1.25, margin: 0, letterSpacing: -0.5 }}>{d.hero.heroCatchphrase}</h1>
          {d.hero.heroSubtext && <p style={{ fontSize: 15, margin: "10px 0 22px", color: "rgba(255,255,255,.85)" }}>{d.hero.heroSubtext}</p>}
          <a href={heroHref} style={{
            display: "inline-flex", alignItems: "center", gap: 8, background: T.accent, color: T.white,
            padding: "12px 24px", borderRadius: 999, fontSize: 14, fontWeight: 700, textDecoration: "none",
          }}>
            {d.hero.heroCtaButton}
          </a>
        </div>
        {/* 티켓 절취선 느낌의 하단 경계 */}
        <svg viewBox="0 0 400 12" preserveAspectRatio="none" style={{ position: "absolute", bottom: -1, left: 0, width: "100%", height: 12, display: "block" }}>
          <path d="M0,0 Q10,12 20,0 T40,0 T60,0 T80,0 T100,0 T120,0 T140,0 T160,0 T180,0 T200,0 T220,0 T240,0 T260,0 T280,0 T300,0 T320,0 T340,0 T360,0 T380,0 T400,0 V12 H0 Z" fill={T.paper} />
        </svg>
      </section>

      {/* ── 소개 ── */}
      {d.about.aboutText && (
        <section style={{ padding: "48px 28px", maxWidth: 920, margin: "0 auto" }}>
          <div className="rsp-about-grid">
            {d.about.aboutImage && <img src={d.about.aboutImage} alt="" style={{ width: "100%", borderRadius: 14, objectFit: "cover", aspectRatio: "4/3" }} />}
            <div>
              <Eyebrow text="ABOUT" />
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 14px" }}>{d.about.aboutTitle}</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.8, color: T.inkSoft, whiteSpace: "pre-line" }}>{d.about.aboutText}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── 메뉴 ── */}
      <section id="menu" style={{ padding: "48px 28px", background: T.paperDeep }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <Eyebrow text="MENU" center />
          <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", margin: "8px 0 34px" }}>{d.menu.menuSectionTitle}</h2>

          {d.menu.menuCategories.map((cat) => (
            <div key={cat.id} style={{ marginBottom: 30 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: T.accent }}>{cat.categoryName}</span>
                <span style={{ flex: 1, borderBottom: `1px dashed ${T.muted}` }} />
              </div>
              <div className="rsp-menu-grid">
                {cat.menuItems.map((item) => (
                  <div key={item.id} style={{
                    display: "flex", gap: 14, alignItems: "center", background: T.white, borderRadius: 12,
                    padding: 12, border: `1px solid ${T.line}`, opacity: item.isSoldOut ? 0.5 : 1, position: "relative",
                  }}>
                    {item.menuImage && (
                      <img src={item.menuImage} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {item.isSignature && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: T.gold, color: T.white, fontSize: 10.5, fontWeight: 800, padding: "2px 7px", borderRadius: 999 }}>
                            <Star size={9} fill={T.white} /> 대표메뉴
                          </span>
                        )}
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{item.menuName}</span>
                        {item.isSoldOut && <span style={{ fontSize: 11, color: T.accent, fontWeight: 700 }}>품절</span>}
                      </div>
                      {item.menuDescription && <p style={{ fontSize: 12.5, color: T.muted, margin: "4px 0 0" }}>{item.menuDescription}</p>}
                    </div>
                    <span style={{ fontFamily: "'SFMono-Regular',Consolas,monospace", fontWeight: 700, fontSize: 14.5, flexShrink: 0 }}>{item.menuPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {hasOrderLinks && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 20 }}>
              {d.orderLinks.baeminUrl && <OrderBtn href={d.orderLinks.baeminUrl} label="배달의민족" icon={Truck} />}
              {d.orderLinks.coupangEatsUrl && <OrderBtn href={d.orderLinks.coupangEatsUrl} label="쿠팡이츠" icon={Truck} />}
              {d.orderLinks.yogiyoUrl && <OrderBtn href={d.orderLinks.yogiyoUrl} label="요기요" icon={Truck} />}
              {d.orderLinks.takeoutAvailable && <OrderBtn label="포장 가능" icon={ShoppingBag} staticTag />}
            </div>
          )}
        </div>
      </section>

      {/* ── 갤러리 ── */}
      {d.gallery.galleryImages?.length > 0 && (
        <section style={{ padding: "48px 28px", maxWidth: 920, margin: "0 auto" }}>
          <Eyebrow text="GALLERY" />
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 20px" }}>{d.gallery.galleryTitle}</h2>
          <div className="rsp-gallery-grid">
            {d.gallery.galleryImages.map((img, i) => (
              <img key={i} src={img} alt="" onClick={() => setLightbox(i)} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 10, cursor: "pointer" }} />
            ))}
          </div>
        </section>
      )}

      {lightbox !== null && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(31,27,22,.9)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(null); }} style={{ position: "absolute", top: 20, right: 20, background: "transparent", border: "none", color: T.white, cursor: "pointer" }}><X size={26} /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + d.gallery.galleryImages.length) % d.gallery.galleryImages.length); }} style={{ position: "absolute", left: 16, background: "transparent", border: "none", color: T.white, cursor: "pointer" }}><ChevronLeft size={32} /></button>
          <img src={d.gallery.galleryImages[lightbox]} alt="" style={{ maxWidth: "85%", maxHeight: "80%", borderRadius: 10 }} />
          <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % d.gallery.galleryImages.length); }} style={{ position: "absolute", right: 16, background: "transparent", border: "none", color: T.white, cursor: "pointer" }}><ChevronRight size={32} /></button>
        </div>
      )}

      {/* ── 후기 ── */}
      {d.reviews.reviewSourceType === "직접 입력" && d.reviews.manualReviews?.length > 0 && (
        <section style={{ padding: "48px 28px", background: T.paperDeep }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <Eyebrow text="REVIEW" center />
            <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", margin: "8px 0 24px" }}>손님들의 후기</h2>
            <div className="rsp-review-grid">
              {d.reviews.manualReviews.map((r) => (
                <div key={r.id} style={{ background: T.white, borderRadius: 12, padding: 18, border: `1px solid ${T.line}` }}>
                  <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                    {Array.from({ length: Number(r.reviewRating) }).map((_, i) => <Star key={i} size={13} fill={T.gold} color={T.gold} />)}
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: T.inkSoft, margin: "0 0 10px" }}>{r.reviewText}</p>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>{r.reviewerName}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {d.reviews.reviewSourceType === "네이버 리뷰 연동" && d.reviews.naverPlaceUrl && (
        <section style={{ padding: "40px 28px", textAlign: "center" }}>
          <a href={d.reviews.naverPlaceUrl} style={{ color: T.accent, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>네이버 플레이스에서 후기 더 보기 →</a>
        </section>
      )}

      {/* ── 오시는 길 ── */}
      <section id="location" style={{ padding: "48px 28px", maxWidth: 780, margin: "0 auto" }}>
        <Eyebrow text="LOCATION" />
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 20px" }}>오시는 길</h2>
        <div style={{
          height: 180, borderRadius: 14, background: `repeating-linear-gradient(45deg, ${T.paperDeep}, ${T.paperDeep} 10px, ${T.line} 10px, ${T.line} 20px)`,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, position: "relative",
        }}>
          <div style={{ background: T.white, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(31,27,22,.15)" }}>
            <MapPin size={16} color={T.accent} />
            <span style={{ fontSize: 12.5, color: T.inkSoft }}>{d.location.mapProvider} 연동 영역 (API 키 연결 필요)</span>
          </div>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>{d.location.address} {d.location.addressDetail}</p>
        {d.location.parkingInfo && <InfoLine icon={Car} text={d.location.parkingInfo} />}
        {d.location.transitInfo && <InfoLine icon={Bus} text={d.location.transitInfo} />}
      </section>

      {/* ── 영업시간 ── */}
      <section style={{ padding: "0 28px 48px", maxWidth: 480, margin: "0 auto" }}>
        <Eyebrow text="HOURS" />
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 18px" }}>영업시간</h2>
        <div style={{ border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden", background: T.white }}>
          {d.hours.weeklyHours.map((row, i) => {
            const isToday = row.dayOfWeek === TODAY_KR;
            return (
              <div key={row.dayOfWeek} style={{
                display: "flex", justifyContent: "space-between", padding: "9px 16px",
                borderBottom: i < 6 ? `1px solid ${T.line}` : "none",
                background: isToday ? T.paperDeep : "transparent",
              }}>
                <span style={{ fontWeight: isToday ? 800 : 500, fontSize: 13.5, color: isToday ? T.accent : T.ink }}>{row.dayOfWeek}{isToday && " · 오늘"}</span>
                <span style={{ fontSize: 13.5, color: row.isOpen ? T.inkSoft : T.muted, fontFamily: "monospace" }}>
                  {row.isOpen ? `${row.openTime} – ${row.closeTime}` : "휴무"}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
          {d.hours.regularHoliday && <span style={{ fontSize: 12.5, color: T.muted }}>정기휴무: {d.hours.regularHoliday}</span>}
          {d.hours.breakTime && <span style={{ fontSize: 12.5, color: T.muted }}>브레이크타임: {d.hours.breakTime}</span>}
        </div>
      </section>

      {/* ── 문의 ── */}
      <section id="contact" style={{ padding: "48px 28px", background: T.ink, color: T.white }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow text="CONTACT" center light />
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 24px" }}>예약 · 문의</h2>
          <a href={`tel:${d.contact.phoneNumber}`} style={{
            display: "inline-flex", alignItems: "center", gap: 8, background: T.accent, color: T.white,
            padding: "13px 28px", borderRadius: 999, fontSize: 15, fontWeight: 700, textDecoration: "none", marginBottom: 16,
          }}>
            <Phone size={16} /> {d.contact.phoneNumber}
          </a>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 4 }}>
            {d.contact.kakaoChannelUrl && <IconLink href={d.contact.kakaoChannelUrl} icon={MessageCircle} />}
            {d.contact.instagramUrl && <IconLink href={d.contact.instagramUrl} icon={Camera} />}
          </div>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer style={{ padding: "24px 28px", textAlign: "center", fontSize: 11.5, color: T.muted, borderTop: `1px solid ${T.line}` }}>
        {d.footer.representativeName && <span>대표 {d.footer.representativeName} · </span>}
        {d.footer.businessRegistrationNumber && <span>사업자등록번호 {d.footer.businessRegistrationNumber}</span>}
        <div style={{ marginTop: 4 }}>{d.footer.footerCopyrightText}</div>
      </footer>
    </div>
  );
}

function Eyebrow({ text, center, light }) {
  return (
    <p style={{
      fontSize: 11.5, letterSpacing: 3, fontWeight: 800, margin: 0,
      color: light ? "rgba(255,255,255,.55)" : "#A6321D",
      textAlign: center ? "center" : "left",
    }}>
      {text}
    </p>
  );
}

function InfoLine({ icon: Icon, text }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 8 }}>
      <Icon size={14} color={T.muted} style={{ marginTop: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

function OrderBtn({ href, label, icon: Icon, staticTag }) {
  const Comp = staticTag ? "span" : "a";
  return (
    <Comp href={href} className="rsp-order-btn" style={{
      display: "inline-flex", alignItems: "center", gap: 6, background: T.white, border: `1px solid ${T.line}`,
      color: T.ink, padding: "9px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: "none", cursor: staticTag ? "default" : "pointer",
    }}>
      <Icon size={14} /> {label}
    </Comp>
  );
}

function IconLink({ href, icon: Icon }) {
  return (
    <a href={href} style={{
      width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,.1)",
      display: "flex", alignItems: "center", justifyContent: "center", color: T.white,
    }}>
      <Icon size={18} />
    </a>
  );
}
