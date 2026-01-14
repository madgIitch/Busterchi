import Image from "next/image";

export default function PetScene({ isSleeping }: { isSleeping: boolean }) {
  const petImage = isSleeping ? "/pet/buster_sleep.png" : "/pet/buster_idle.png";
  const altText = isSleeping ? "Buster sleeping" : "Buster idle";

  return (
    <section className="w-full rounded-3xl bg-surface p-4 shadow-lg shadow-black/10 sm:p-6">
      <div className="relative w-full aspect-[3/2] overflow-hidden rounded-2xl bg-background/60">
        <Image
          src="/scenes/housePlaceholder.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 420px"
        />
        <Image
          src={petImage}
          alt={altText}
          width={110}
          height={90}
          priority
          className="absolute left-[60%] top-[80%] h-auto w-[clamp(90px,28vw,130px)] -translate-x-1/2 -translate-y-1/2 idle-float"
        />
      </div>
    </section>
  );
}
