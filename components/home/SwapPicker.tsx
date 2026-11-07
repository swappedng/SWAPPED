"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

/* Edit this list to match the models you accept / sell */
const MODELS = [
  "iPhone 17 Pro Max",
  "iPhone 17 Pro",
  "iPhone Air",
  "iPhone 17",
  "iPhone 16 Pro Max",
  "iPhone 16 Pro",
  "iPhone 16 Plus",
  "iPhone 16",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15 Plus",
  "iPhone 15",
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 14 Plus",
  "iPhone 14",
  "iPhone 13",
  "iPhone 12",
  "iPhone 11",
];

const PREVIEW_MODELS = [
  { have: "iPhone X", want: "iPhone 18" },
  { have: "iPhone 11", want: "iPhone 17 Pro Max" },
  { have: "iPhone 12", want: "iPhone 17 Pro" },
  { have: "iPhone 13", want: "iPhone Air" },
  { have: "iPhone 14", want: "iPhone 17" },
  { have: "iPhone 15", want: "iPhone 16 Pro Max" },
  { have: "iPhone 16", want: "iPhone 16 Pro" },
];

type Props = {
  /** Called when the person taps "Start swap" */
  onStart?: (have: string | null) => void;
};

export default function SwapPicker({ onStart }: Props) {
  const [have, setHave] = useState<string | null>(null);
  const [want, setWant] = useState<string | null>(null);
  const [previewCycle, setPreviewCycle] = useState(0);

  const ready = Boolean(have && want);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const intervalId = window.setInterval(() => {
      setPreviewCycle((cycle) => cycle + 1);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  function start() {
    onStart?.(have);
  }

  const preview = PREVIEW_MODELS[previewCycle % PREVIEW_MODELS.length];

  return (
    <div
      className="relative mx-auto w-full max-w-[560px]"
      data-ready={ready}
    >
      <div className="flex items-stretch gap-1.5 rounded-full border border-[#e7e2eb]/90 bg-white/75 p-1 text-left shadow-[0_12px_36px_rgba(53,28,79,0.02)] backdrop-blur-md transition-shadow data-[ready=true]:shadow-[0_16px_40px_rgba(53,28,79,0.16)] max-[680px]:flex-col max-[680px]:items-stretch max-[680px]:rounded-[24px] max-[680px]:p-0">
        <Picker
          phrase="I have an"
          previewModel={preview.have}
          phraseDelay={0}
          initialPreview={previewCycle === 0}
          value={have}
          options={[...MODELS].reverse()}
          onChange={setHave}
        />
        <span
          className="h-10 w-px shrink-0 bg-[#e8e5e9] max-[680px]:h-px max-[680px]:w-full"
          aria-hidden="true"
        />
        <Picker
          phrase="I want an"
          previewModel={preview.want}
          phraseDelay={180}
          initialPreview={previewCycle === 0}
          value={want}
          options={MODELS.filter((m) => m !== have)}
          onChange={setWant}
        />
        <button
          type="button"
          className="inline-flex self-stretch shrink-0 items-center justify-center gap-2 rounded-full bg-[#090909] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#292929] focus-visible:outline-2 focus-visible:outline-[#4a00bd] focus-visible:outline-offset-3 max-[680px]:w-full motion-reduce:transition-none"
          data-ready={ready}
          onClick={start}
        >
          Start swap
        </button>
      </div>
    </div>
  );
}

/* ---------- Picker (accessible listbox) ---------- */

type PickerProps = {
  phrase: string;
  previewModel: string;
  phraseDelay: number;
  initialPreview: boolean;
  value: string | null;
  options: string[];
  onChange: (v: string) => void;
};

function Picker({
  phrase,
  previewModel,
  phraseDelay,
  initialPreview,
  value,
  options,
  onChange,
}: PickerProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const uid = useId();
  const listId = `${uid}-list`;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  function openList() {
    const i = value ? options.indexOf(value) : 0;
    setActive(Math.max(i, 0));
    setOpen(true);
  }

  const displayedModel = value ?? previewModel;
  const accessiblePhrase = `${phrase} ${displayedModel}`;

  function staggeredText(text: string, keyPrefix: string, delay = 0) {
    return text.split("").map((character, index) => (
      <span
        key={`${keyPrefix}-${index}`}
        className="inline-block animate-[swap-placeholder-in_550ms_cubic-bezier(0.34,1.56,0.64,1)_both] motion-reduce:animate-none"
        style={{ animationDelay: `${delay + index * 30}ms` }}
      >
        {character === " " ? "\u00a0" : character}
      </span>
    ));
  }

  function choose(v: string) {
    onChange(v);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return openList();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + step + options.length) % options.length);
    } else if ((e.key === "Enter" || e.key === " ") && open) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // keep the highlighted option in view
  useEffect(() => {
    if (open) {
      document
        .getElementById(`${uid}-opt-${active}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [active, open, uid]);

  return (
    <div className="relative min-w-0 flex-1" ref={root}>
      <button
        type="button"
        className="w-full min-h-[48px] cursor-pointer rounded-full px-5 py-3 text-left text-sm font-semibold text-[#192331] transition-colors hover:bg-[#faf9fa] focus-visible:outline-2 focus-visible:outline-[#4a00bd] focus-visible:outline-offset-[-2px] motion-reduce:transition-none motion-reduce:animate-none max-[680px]:rounded-xl"
        aria-label={accessiblePhrase}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${uid}-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
          {!value && (
            <span className="text-[#9aa0ad]" aria-hidden="true">
              {staggeredText(phrase, `phrase-${phrase}`, phraseDelay)}
              {"\u00a0"}
            </span>
          )}
          {value ? (
            <span className="font-semibold text-[#192331]" aria-hidden="true">
              {value}
            </span>
          ) : (
            <span className="font-medium text-[#9aa0ad]" aria-hidden="true">
              {staggeredText(
                previewModel,
                `model-${previewModel}`,
                initialPreview ? phraseDelay + phrase.length * 30 : 0,
              )}
            </span>
          )}
        </span>
      </button>

      {open && (
        <ul
          className="absolute left-0 top-[calc(100%+10px)] z-20 m-0 max-h-[288px] min-w-[260px] list-none overflow-auto rounded-2xl border border-[#ececf1] bg-white p-1.5 text-left shadow-[0_20px_50px_-12px_rgba(27,34,51,0.25)] origin-top-left animate-[swap-pop_0.16s_ease-out] motion-reduce:animate-none"
          role="listbox"
          id={listId}
          aria-label={phrase}
        >
          {options.map((m, i) => (
            <li
              key={m}
              id={`${uid}-opt-${i}`}
              role="option"
              aria-selected={m === value}
              className="p-2.5 px-3.5 rounded-[12px] text-sm text-[#1b2233] cursor-pointer data-[active=true]:bg-[#f4f3f8] data-[selected=true]:text-[#4a0fc9] data-[selected=true]:font-semibold"
              data-active={i === active}
              data-selected={m === value}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(m)}
            >
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
