"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS, type AnswerValue, type Question } from "@/lib/questions";

const KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type Phase = "intro" | "form" | "review" | "submitting" | "done";

function emptyAnswers(): Record<number, AnswerValue> {
  const map: Record<number, AnswerValue> = {};
  QUESTIONS.forEach((_, idx) => {
    map[idx] = null;
  });
  return map;
}

function displayAnswer(question: Question, value: AnswerValue): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (question.type === "single" && typeof value === "number") {
    return question.options?.[value] ?? null;
  }
  if (question.type === "multi" && Array.isArray(value)) {
    if (value.length === 0) return null;
    return value.map((i) => question.options?.[i]).filter(Boolean).join(", ");
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

export function ApplicationForm() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>(emptyAnswers);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const inputsRef = useRef<Record<number, HTMLInputElement | HTMLTextAreaElement | null>>({});

  const total = QUESTIONS.length;
  const question = QUESTIONS[current];

  const hasAnswerAt = useCallback(
    (idx: number) => displayAnswer(QUESTIONS[idx], answers[idx]) !== null,
    [answers],
  );

  const isFormPhase = phase === "form" || phase === "review";

  useEffect(() => {
    if (isFormPhase) {
      document.body.classList.add("form-page");
      return () => {
        document.body.classList.remove("form-page");
      };
    }
  }, [isFormPhase]);

  const focusCurrent = useCallback((idx: number) => {
    setTimeout(() => {
      const el = inputsRef.current[idx];
      el?.focus();
    }, 450);
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      setCurrent(idx);
      if (!hasAnswerAt(idx)) focusCurrent(idx);
    },
    [focusCurrent, hasAnswerAt],
  );

  const nextSlide = useCallback(() => {
    if (current < total - 1) {
      goTo(current + 1);
    } else {
      setPhase("review");
    }
  }, [current, goTo, total]);

  const prevSlide = useCallback(() => {
    if (current > 0) goTo(current - 1);
  }, [current, goTo]);

  const updateAnswer = useCallback((idx: number, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [idx]: value }));
  }, []);

  const selectChoice = useCallback(
    (idx: number, optIdx: number, multi: boolean) => {
      if (multi) {
        setAnswers((prev) => {
          const current = Array.isArray(prev[idx]) ? [...(prev[idx] as number[])] : [];
          const pos = current.indexOf(optIdx);
          if (pos === -1) current.push(optIdx);
          else current.splice(pos, 1);
          return { ...prev, [idx]: current };
        });
      } else {
        setAnswers((prev) => ({ ...prev, [idx]: optIdx }));
        setTimeout(() => nextSlide(), 380);
      }
    },
    [nextSlide],
  );

  const editAnswer = useCallback(
    (idx: number) => {
      const q = QUESTIONS[idx];
      const cleared: AnswerValue = q.type === "multi" ? [] : q.type === "single" ? null : "";
      updateAnswer(idx, cleared);
      focusCurrent(idx);
    },
    [focusCurrent, updateAnswer],
  );

  const jumpToQuestion = useCallback(
    (idx: number) => {
      editAnswer(idx);
      setPhase("form");
      goTo(idx);
    },
    [editAnswer, goTo],
  );

  const submitForm = useCallback(async () => {
    setSubmitError(null);
    setPhase("submitting");
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Falha ao enviar." }));
        throw new Error(data.error ?? "Falha ao enviar.");
      }
      setPhase("done");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Falha ao enviar.");
      setPhase("review");
    }
  }, [answers]);

  useEffect(() => {
    if (phase !== "form") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        prevSlide();
        return;
      }
      if (e.key === "ArrowDown" && hasAnswerAt(current)) {
        e.preventDefault();
        nextSlide();
        return;
      }
      const q = QUESTIONS[current];
      if (q.type === "single" || q.type === "multi") {
        const ki = KEYS.indexOf(e.key.toUpperCase());
        if (ki !== -1 && ki < (q.options?.length ?? 0) && !hasAnswerAt(current)) {
          selectChoice(current, ki, q.type === "multi");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, current, hasAnswerAt, nextSlide, prevSlide, selectChoice]);

  const progressPct = useMemo(() => ((current + 1) / total) * 100, [current, total]);

  return (
    <>
      <div className="glow-orb" />

      <div id="intro" className={phase !== "intro" ? "hide" : ""}>
        <p className="intro-badge">Processo Seletivo 2025</p>
        <h1 className="intro-title">ASISTO</h1>
        <p className="intro-sub">
          Perfil Processos &amp; Tecnologia. Queremos entender quem você é — leva menos de 5 minutos.
        </p>
        <div className="intro-meta">
          <span>16 perguntas</span>
          <span>~4 minutos</span>
          <span>Sem enrolação</span>
        </div>
        <button
          className="btn-start"
          onClick={() => {
            setPhase("form");
            focusCurrent(0);
          }}
        >
          Começar agora
        </button>
      </div>

      <div id="form-wrap" className={phase === "form" ? "active" : ""}>
        <div className="progress-bar" style={{ width: `${progressPct}%` }} />
        <div className="form-header">
          <span className="logo">ASISTO</span>
          <span className="counter">
            <span>{current + 1}</span> / {total}
          </span>
        </div>
        <div className="slides-container">
          {QUESTIONS.map((q, idx) => (
            <SlideView
              key={q.id}
              question={q}
              idx={idx}
              active={current === idx}
              passed={current > idx}
              value={answers[idx]}
              answered={hasAnswerAt(idx)}
              onChangeValue={(v) => updateAnswer(idx, v)}
              onConfirm={nextSlide}
              onSelectChoice={selectChoice}
              onEdit={() => editAnswer(idx)}
              registerInput={(el) => {
                inputsRef.current[idx] = el;
              }}
            />
          ))}
        </div>
        <div className="footer-nav">
          <button
            className="nav-btn"
            type="button"
            onClick={prevSlide}
            disabled={current === 0}
            title="Anterior"
          >
            ↑
          </button>
          <button className="nav-btn" type="button" onClick={nextSlide} title="Próxima">
            ↓
          </button>
        </div>
      </div>

      <ReviewScreen
        visible={phase === "review" || phase === "submitting"}
        answers={answers}
        submitting={phase === "submitting"}
        submitError={submitError}
        onEdit={jumpToQuestion}
        onBack={() => setPhase("form")}
        onSubmit={submitForm}
      />

      <div id="thankyou" className={phase === "done" ? "show" : ""}>
        <div className="ty-icon">🎉</div>
        <h2 className="ty-title">Incrível!</h2>
        <p className="ty-sub">
          Suas respostas foram enviadas. A equipe da Asisto vai entrar em contato em breve. Obrigado por
          dedicar seu tempo!
        </p>
      </div>
    </>
  );
}

type SlideViewProps = {
  question: Question;
  idx: number;
  active: boolean;
  passed: boolean;
  value: AnswerValue;
  answered: boolean;
  onChangeValue: (value: AnswerValue) => void;
  onConfirm: () => void;
  onSelectChoice: (idx: number, optIdx: number, multi: boolean) => void;
  onEdit: () => void;
  registerInput: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
};

function SlideView({
  question,
  idx,
  active,
  passed,
  value,
  answered,
  onChangeValue,
  onConfirm,
  onSelectChoice,
  onEdit,
  registerInput,
}: SlideViewProps) {
  const classes = ["slide"];
  if (active) classes.push("active");
  else if (passed) classes.push("exit-up");

  const displayed = displayAnswer(question, value);

  return (
    <div className={classes.join(" ")}>
      <div className={`answered-chip ${answered ? "visible" : ""}`}>Respondido</div>

      {answered && displayed !== null ? (
        <div className="prev-answer-wrap show">
          <div className="prev-answer-label">Sua resposta</div>
          <div className="prev-answer-text">{displayed}</div>
          <button type="button" className="edit-link" onClick={onEdit}>
            ✎ Editar resposta
          </button>
        </div>
      ) : (
        <SlideInput
          question={question}
          idx={idx}
          value={value}
          onChangeValue={onChangeValue}
          onConfirm={onConfirm}
          onSelectChoice={onSelectChoice}
          registerInput={registerInput}
        />
      )}
    </div>
  );
}

type SlideInputProps = {
  question: Question;
  idx: number;
  value: AnswerValue;
  onChangeValue: (value: AnswerValue) => void;
  onConfirm: () => void;
  onSelectChoice: (idx: number, optIdx: number, multi: boolean) => void;
  registerInput: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
};

function SlideInput({
  question,
  idx,
  value,
  onChangeValue,
  onConfirm,
  onSelectChoice,
  registerInput,
}: SlideInputProps) {
  const reqStar = question.required ? <span className="req-star">*</span> : null;
  const header = (
    <>
      <div className="question-num">{String(question.id).padStart(2, "0")}</div>
      <h2 className="question-title">
        {question.title}
        {reqStar}
      </h2>
      {question.sub && <p className="question-sub">{question.sub}</p>}
    </>
  );

  if (question.type === "text") {
    return (
      <>
        {header}
        <div className="input-wrap">
          <input
            ref={registerInput}
            type="text"
            placeholder={question.placeholder}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChangeValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onConfirm();
              }
            }}
          />
          <div className="input-underline" />
        </div>
        <div className="confirm-wrap">
          <button className="btn-ok" type="button" onClick={onConfirm}>
            OK <kbd>Enter ↵</kbd>
          </button>
          {!question.required && (
            <button type="button" className="skip-hint" onClick={onConfirm}>
              Pular →
            </button>
          )}
        </div>
      </>
    );
  }

  if (question.type === "textarea") {
    return (
      <>
        {header}
        <div className="input-wrap" style={{ maxWidth: 580 }}>
          <textarea
            ref={registerInput}
            placeholder={question.placeholder}
            rows={4}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChangeValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                onConfirm();
              }
            }}
          />
          <div className="input-underline" />
        </div>
        <div className="confirm-wrap">
          <button className="btn-ok" type="button" onClick={onConfirm}>
            OK <kbd>Ctrl+Enter</kbd>
          </button>
          {!question.required && (
            <button type="button" className="skip-hint" onClick={onConfirm}>
              Pular →
            </button>
          )}
        </div>
      </>
    );
  }

  if (question.type === "single") {
    const cls = question.horizontal ? "choices horizontal" : "choices";
    return (
      <>
        {header}
        <div className={cls}>
          {question.options?.map((opt, oi) => (
            <button
              key={opt}
              type="button"
              className={`choice-btn ${value === oi ? "selected" : ""}`}
              onClick={() => onSelectChoice(idx, oi, false)}
            >
              {!question.horizontal && <span className="choice-key">{KEYS[oi]}</span>}
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </>
    );
  }

  const selected = Array.isArray(value) ? value : [];
  return (
    <>
      {header}
      <p className="multi-hint">Escolha uma ou mais opções</p>
      <div className="choices">
        {question.options?.map((opt, oi) => (
          <button
            key={opt}
            type="button"
            className={`choice-btn ${selected.includes(oi) ? "selected" : ""}`}
            onClick={() => onSelectChoice(idx, oi, true)}
          >
            <span className="choice-key">{KEYS[oi]}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>
      <div className="confirm-wrap" style={{ marginTop: 20 }}>
        <button className="btn-ok" type="button" onClick={onConfirm}>
          Confirmar <kbd>Enter ↵</kbd>
        </button>
      </div>
    </>
  );
}

type ReviewScreenProps = {
  visible: boolean;
  answers: Record<number, AnswerValue>;
  submitting: boolean;
  submitError: string | null;
  onEdit: (idx: number) => void;
  onBack: () => void;
  onSubmit: () => void;
};

function ReviewScreen({ visible, answers, submitting, submitError, onEdit, onBack, onSubmit }: ReviewScreenProps) {
  return (
    <div id="review" className={visible ? "show" : ""}>
      <div className="review-header">
        <h2>Revise suas respostas</h2>
        <p>Clique em qualquer pergunta para editar antes de enviar.</p>
      </div>
      <div className="review-grid">
        {QUESTIONS.map((q, idx) => {
          const display = displayAnswer(q, answers[idx]);
          return (
            <button
              key={q.id}
              type="button"
              className="review-item"
              onClick={() => onEdit(idx)}
              style={{ textAlign: "left", width: "100%", background: "var(--card)" }}
            >
              <div className="review-item-q">
                {String(q.id).padStart(2, "0")} — {q.title}
              </div>
              <div className={`review-item-a ${display ? "" : "empty"}`}>
                {display ?? "— não respondido —"}
              </div>
              <div className="review-item-edit">✎ Clique para editar</div>
            </button>
          );
        })}
      </div>
      <div className="review-actions">
        <button type="button" className="btn-back-review" onClick={onBack} disabled={submitting}>
          ← Voltar
        </button>
        <button type="button" className="btn-submit" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Enviando..." : "Enviar candidatura ✓"}
        </button>
      </div>
      {submitError && <p className="submit-error">{submitError}</p>}
    </div>
  );
}
