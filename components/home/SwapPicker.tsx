"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

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

type Props = {
  /** Called when both phones are picked and the person taps "Start swap" */
  onStart?: (have: string, want: string) => void;
};

export default function SwapPicker({ onStart }: Props) {
  const [have, setHave] = useState<string | null>(null);
  const [want, setWant] = useState<string | null>(null);
  const [missing, setMissing] = useState<"have" | "want" | null>(null);

  const ready = Boolean(have && want);

  function start() {
    if (!have) return setMissing("have");
    if (!want) return setMissing("want");
    onStart?.(have, want);
  }

  return (
    <div
      className="relative mx-auto w-full max-w-[820px]"
      data-ready={ready}
    >
      <div className="flex items-center gap-1.5 rounded-full border border-[#e9e6e8] bg-white p-1.5 shadow-[0_8px_24px_rgba(27,34,51,0.07)] transition-shadow data-[ready=true]:shadow-[0_12px_30px_rgba(27,34,51,0.12)] max-[680px]:flex-col max-[680px]:items-stretch max-[680px]:rounded-[24px] max-[680px]:p-2">
        <Picker
          label="I have"
          prompt="Choose your iPhone"
          value={have}
          options={MODELS}
          missing={missing === "have"}
          onChange={(v) => {
            setHave(v);
            setMissing(null);
          }}
          onAnimationEnd={() => setMissing(null)}
        />
        <span
          className="h-10 w-px shrink-0 bg-[#e8e5e9] max-[680px]:h-px max-[680px]:w-full"
          aria-hidden="true"
        />
        <Picker
          label="I want"
          prompt="Choose your next iPhone"
          value={want}
          options={MODELS.filter((m) => m !== have)}
          missing={missing === "want"}
          onChange={(v) => {
            setWant(v);
            setMissing(null);
          }}
          onAnimationEnd={() => setMissing(null)}
        />
        <button
          type="button"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#090909] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#292929] focus-visible:outline-2 focus-visible:outline-[#4a00bd] focus-visible:outline-offset-3 max-[680px]:w-full motion-reduce:transition-none"
          data-ready={ready}
          onClick={start}
        >
          Start swap
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Picker (accessible listbox) ---------- */

type PickerProps = {
  label: string;
  prompt: string;
  value: string | null;
  options: string[];
  missing: boolean;
  onChange: (v: string) => void;
  onAnimationEnd: () => void;
};

function Picker({
  label,
  prompt,
  value,
  options,
  missing,
  onChange,
  onAnimationEnd,
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
        className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-x-3 rounded-full px-5 py-2 text-left transition-colors hover:bg-[#faf9fa] focus-visible:outline-2 focus-visible:outline-[#4a00bd] focus-visible:outline-offset-[-2px] data-[missing=true]:animate-[swap-nudge_0.4s_ease-in-out] motion-reduce:transition-none motion-reduce:animate-none max-[680px]:rounded-xl"
        data-missing={missing}
        aria-label={label}
        onAnimationEnd={onAnimationEnd}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${uid}-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-medium text-[#687181] sm:text-[11px]">
            {label}
          </span>
          <span className="mt-0.5 block overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-[#192331] sm:text-sm">
            {value ?? prompt}
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-[#687181] transition-transform duration-200 aria-expanded:rotate-180"
          aria-hidden="true"
          aria-expanded={open}
        />
      </button>

      {open && (
        <ul
          className="absolute left-0 top-[calc(100%+10px)] z-20 m-0 max-h-[288px] min-w-[260px] list-none overflow-auto rounded-2xl border border-[#ececf1] bg-white p-1.5 text-left shadow-[0_20px_50px_-12px_rgba(27,34,51,0.25)] origin-top-left animate-[swap-pop_0.16s_ease-out] motion-reduce:animate-none"
          role="listbox"
          id={listId}
          aria-label={label}
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
