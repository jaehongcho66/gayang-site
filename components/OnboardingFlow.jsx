"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import {
  Mail, Lock, User, ChevronRight, ChevronLeft, Check, Store,
  Scissors, GraduationCap, Loader2, MessageCircle, CircleCheck, CircleX,
} from "lucide-react";

const T = {
  paper: "#FAF6EF", paperDeep: "#F1EADC", ink: "#262019", inkSoft: "#5C5346",
  accent: "#C1440E", muted: "#A69C8C", line: "#E4DACB", white: "#FFFFFF", danger: "#B3261E",
  kakao: "#FEE500", kakaoText: "#3C1E1E",
};

const TEMPLATES = [
  { key: "restaurant_cafe", label: "음식점 · 카페", desc: "메뉴, 배달 링크, 예약 안내", icon: Store },
  { key: "beauty_salon", label: "미용실 · 네일샵", desc: "시술 메뉴, 디자이너 소개, 온라인 예약", icon: Scissors },
  { key: "academy", label: "학원 · 교습소", desc: "커리큘럼, 강사진, 상담 신청", icon: GraduationCap },
];

/* ── 실제 Supabase API 레이어 ───────── */
const mockApi = {
  async signUpWithEmail({ email, password, fullName }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(error.message);
    return { user: data.user };
  },

  async signUpWithKakao() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error(error.message);
    return { user: null }; // 카카오는 리다이렉트 방식이라 여기서 바로 user를 못 받습니다
  },

  async checkSubdomainAvailable(subdomain) {
    const { count, error } = await supabase
      .from("sites")
      .select("id", { count: "exact", head: true })
      .eq("subdomain", subdomain);
    if (error) throw new Error(error.message);
    return count === 0;
  },

  async createSite({ templateKey, subdomain }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const { data: template, error: templateError } = await supabase
      .from("templates")
      .select("id")
      .eq("template_key", templateKey)
      .single();
    if (templateError) throw new Error(templateError.message);

    const { data: site, error: siteError } = await supabase
      .from("sites")
      .insert({ user_id: user.id, template_id: template.id, subdomain })
      .select()
      .single();
    if (siteError) throw new Error(siteError.message);

    await supabase.from("site_content").insert({ site_id: site.id, draft_data: {} });

    return { siteId: site.id, templateKey, subdomain };
  },
};

/* ── 공통 UI ─────────────────────────────────────────────── */
function ProgressDots({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: i === step ? 22 : 7, height: 7, borderRadius: 999,
          background: i <= step ? T.accent : T.line, transition: "all .2s",
        }} />
      ))}
    </div>
  );
}
const inputBase = {
  width: "100%", boxSizing: "border-box", border: `1px solid ${T.line}`, borderRadius: 10,
  padding: "12px 14px", fontSize: 14.5, color: T.ink, background: T.white, outline: "none", fontFamily: "inherit",
};
function InputField({ icon: Icon, ...props }) {
  return (
    <div style={{ position: "relative", marginBottom: 12 }}>
      <Icon size={16} color={T.muted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
      <input {...props} style={{ ...inputBase, paddingLeft: 40 }} />
    </div>
  );
}
function PrimaryButton({ children, onClick, disabled, loading }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width: "100%", background: disabled ? T.muted : T.accent, color: T.white, border: "none",
      borderRadius: 999, padding: "13px 0", fontSize: 14.5, fontWeight: 700,
      cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    }}>
      {loading && <Loader2 size={16} className="spin" />}
      {children}
    </button>
  );
}

/* ════════════════════ 메인 온보딩 컴포넌트 ════════════════════ */
export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ email: "", password: "", fullName: "" });
  const [templateKey, setTemplateKey] = useState(null);
  const [subdomain, setSubdomain] = useState("");
  const [subdomainStatus, setSubdomainStatus] = useState(null);
  const [site, setSite] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!subdomain || subdomain.length < 3) { setSubdomainStatus(null); return; }
    setSubdomainStatus("checking");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const available = await mockApi.checkSubdomainAvailable(subdomain);
        setSubdomainStatus(available ? "available" : "taken");
      } catch (e) {
        setSubdomainStatus(null);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [subdomain]);

  const handleEmailSignup = async () => {
    setError(""); setLoading(true);
    try {
      const { user } = await mockApi.signUpWithEmail(form);
      setUser(user);
      setStep(1);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleKakaoSignup = async () => {
    setError(""); setLoading(true);
    try {
      await mockApi.signUpWithKakao();
      // 카카오는 리다이렉트되므로 이후 로직은 리다이렉트 후 페이지에서 처리합니다
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleCreateSite = async () => {
    setLoading(true);
    try {
      const result = await mockApi.createSite({ templateKey, subdomain });
      setSite(result);
      setStep(3);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const cleanSubdomain = (v) => v.toLowerCase().replace(/[^a-z0-9-]/g, "");

  return (
    <div style={{
      background: T.paper, fontFamily: "'Pretendard','Malgun Gothic',-apple-system,BlinkMacSystemFont,sans-serif",
      borderRadius: 16, border: `1px solid ${T.line}`, padding: "40px 32px", maxWidth: 440, margin: "0 auto",
    }}>
      <style>{`.spin{animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <ProgressDots step={step} total={4} />

      {step === 0 && (
        <>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: T.ink, textAlign: "center", margin: "0 0 6px" }}>사장님, 반갑습니다</h2>
          <p style={{ fontSize: 13, color: T.muted, textAlign: "center", margin: "0 0 26px" }}>1분이면 홈페이지 만들기를 시작할 수 있어요</p>

          <button onClick={handleKakaoSignup} disabled={loading} style={{
            width: "100%", background: T.kakao, color: T.kakaoText, border: "none", borderRadius: 999,
            padding: "13px 0", fontSize: 14.5, fontWeight: 700, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 18,
          }}>
            <MessageCircle size={17} /> 카카오로 3초만에 시작하기
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 18px" }}>
            <div style={{ flex: 1, height: 1, background: T.line }} /><span style={{ fontSize: 11.5, color: T.muted }}>또는 이메일로 가입</span><div style={{ flex: 1, height: 1, background: T.line }} />
          </div>

          <InputField icon={User} placeholder="이름" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <InputField icon={Mail} placeholder="이메일" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <InputField icon={Lock} placeholder="비밀번호 (6자 이상)" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

          {error && <p style={{ color: T.danger, fontSize: 12.5, margin: "0 0 12px" }}>{error}</p>}

          <div style={{ marginTop: 6 }}>
            <PrimaryButton onClick={handleEmailSignup} loading={loading} disabled={!form.email || !form.password}>
              가입하고 시작하기
            </PrimaryButton>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: T.ink, textAlign: "center", margin: "0 0 6px" }}>업종을 선택해주세요</h2>
          <p style={{ fontSize: 13, color: T.muted, textAlign: "center", margin: "0 0 24px" }}>업종에 맞는 템플릿으로 시작해요</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {TEMPLATES.map((t) => {
              const Icon = t.icon, selected = templateKey === t.key;
              return (
                <button key={t.key} onClick={() => setTemplateKey(t.key)} style={{
                  display: "flex", alignItems: "center", gap: 14, textAlign: "left", padding: "14px 16px",
                  borderRadius: 12, cursor: "pointer",
                  border: selected ? `2px solid ${T.accent}` : `1px solid ${T.line}`,
                  background: selected ? T.paperDeep : T.white,
                }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: selected ? T.accent : T.paperDeep, color: selected ? T.white : T.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={19} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{t.desc}</div>
                  </div>
                  {selected && <Check size={18} color={T.accent} />}
                </button>
              );
            })}
          </div>

          <PrimaryButton onClick={() => setStep(2)} disabled={!templateKey}>다음</PrimaryButton>
        </>
      )}

      {step === 2 && (
        <>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: T.ink, textAlign: "center", margin: "0 0 6px" }}>주소를 정해주세요</h2>
          <p style={{ fontSize: 13, color: T.muted, textAlign: "center", margin: "0 0 24px" }}>나중에 원하는 도메인으로 바꿀 수 있어요</p>

          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${subdomainStatus === "taken" ? T.danger : T.line}`, borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
            <input
              value={subdomain}
              onChange={(e) => setSubdomain(cleanSubdomain(e.target.value))}
              placeholder="가게이름"
              style={{ flex: 1, border: "none", padding: "13px 14px", fontSize: 14.5, outline: "none", background: T.white, color: T.ink }}
            />
            <span style={{ padding: "0 14px", fontSize: 13, color: T.muted, background: T.paperDeep, alignSelf: "stretch", display: "flex", alignItems: "center" }}>.mysite.com</span>
          </div>

          <div style={{ minHeight: 20, marginBottom: 18 }}>
            {subdomainStatus === "checking" && <p style={{ fontSize: 12, color: T.muted, display: "flex", alignItems: "center", gap: 5 }}><Loader2 size={12} className="spin" />확인 중...</p>}
            {subdomainStatus === "available" && <p style={{ fontSize: 12, color: "#2F5233", display: "flex", alignItems: "center", gap: 5 }}><CircleCheck size={13} />사용 가능한 주소예요</p>}
            {subdomainStatus === "taken" && <p style={{ fontSize: 12, color: T.danger, display: "flex", alignItems: "center", gap: 5 }}><CircleX size={13} />이미 사용 중인 주소예요</p>}
          </div>

          {error && <p style={{ color: T.danger, fontSize: 12.5, margin: "0 0 12px" }}>{error}</p>}

          <PrimaryButton onClick={handleCreateSite} loading={loading} disabled={subdomainStatus !== "available"}>
            사이트 만들기
          </PrimaryButton>

          <button onClick={() => setStep(1)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, width: "100%", marginTop: 14, background: "transparent", border: "none", color: T.muted, fontSize: 12.5, cursor: "pointer" }}>
            <ChevronLeft size={13} /> 이전으로
          </button>
        </>
      )}

      {step === 3 && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: T.accent, color: T.white, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Check size={28} strokeWidth={3} />
          </div>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: T.ink, margin: "0 0 8px" }}>사이트가 준비됐어요!</h2>
          <p style={{ fontSize: 13, color: T.muted, margin: "0 0 4px" }}>
            {TEMPLATES.find((t) => t.key === site?.templateKey)?.label} 템플릿으로 시작합니다
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: T.accent, margin: "0 0 28px" }}>{site?.subdomain}.mysite.com</p>
          <PrimaryButton onClick={() => (onComplete ? onComplete(site) : alert("완료"))}>
            정보 입력하러 가기 <ChevronRight size={16} />
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}