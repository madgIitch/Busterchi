type ActionItem = {
  label: string;
  disabled?: boolean;
};

export default function ActionButtons({ actions }: { actions: ActionItem[] }) {
  return (
    <section className="grid w-full grid-cols-3 gap-3">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          disabled={action.disabled}
          className="h-12 rounded-full bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-text)] shadow-sm shadow-black/10 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {action.label}
        </button>
      ))}
    </section>
  );
}
