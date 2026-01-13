import Image from "next/image";

export default function PetScene({ isSleeping }: { isSleeping: boolean }) {
  const petImage = isSleeping ? "/pet/buster_sleep.png" : "/pet/buster_idle.png";
  const altText = isSleeping ? "Buster sleeping" : "Buster idle";

  return (
    <section className="w-full rounded-3xl bg-surface p-6 shadow-lg shadow-black/10">
      <div className="flex items-center justify-center rounded-2xl bg-background/60 p-6">
        <Image
          src={petImage}
          alt={altText}
          width={220}
          height={220}
          priority
        />
      </div>
    </section>
  );
}
