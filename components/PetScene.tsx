import Image from "next/image";

export default function PetScene() {
  return (
    <section className="w-full rounded-3xl bg-[var(--color-surface)] p-6 shadow-lg shadow-black/10">
      <div className="flex items-center justify-center rounded-2xl bg-white/60 p-6">
        <Image
          src="/pet/buster_idle.png"
          alt="Buster idle"
          width={220}
          height={220}
          priority
        />
      </div>
    </section>
  );
}
