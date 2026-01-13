export default function SpeechBubble({ line }: { line: string }) {
  return (
    <section className="relative w-full rounded-2xl bg-surface p-4 text-sm text-text shadow-sm shadow-black/10">
      <span>{line}</span>
      <span className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 bg-surface" />
    </section>
  );
}
