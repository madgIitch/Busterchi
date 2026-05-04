export default function SpeechBubble({ line }: { line: string }) {
  return (
    <section className="relative mx-auto w-[94%] rounded-[24px] border-2 border-white/70 bg-white/92 px-4 py-3 text-center text-[13px] leading-5 text-text shadow-lg shadow-black/15">
      <span className="relative z-10">{line}</span>
      <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-white/70 bg-white/92" />
    </section>
  );
}
