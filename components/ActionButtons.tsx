import Image from "next/image";

type ActionItem = {
  label: string;
  disabled?: boolean;
  cooldownLabel?: string;
  onClick?: () => void;
  imageSrc: string;
};

export default function ActionButtons({ actions }: { actions: ActionItem[] }) {
  return (
    <section className="grid w-full grid-cols-3 gap-3">
      {actions.map((action) => (
        <div key={action.label} className="flex flex-col items-center gap-1">
          <button
            type="button"
            disabled={action.disabled}
            onClick={action.onClick}
            className="flex w-full items-center justify-center rounded-3xl shadow-lg shadow-black/15 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Image
              src={action.imageSrc}
              alt={`${action.label} button`}
              width={180}
              height={180}
              className="h-auto w-full"
            />
            <span className="sr-only">{action.label}</span>
          </button>
          {action.cooldownLabel ? (
            <span className="text-[10px] text-[var(--color-muted)]">
              {action.cooldownLabel}
            </span>
          ) : (
            <span className="text-[10px] text-transparent">.</span>
          )}
        </div>
      ))}
    </section>
  );
}
