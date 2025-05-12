import Image from "next/image";

type BackgroundImageProps = {
  backgroundImage?: string;
  opacity?: number;
};

export default function BackgroundImage({
  backgroundImage = "/chemex-brewing-landing.png",
  opacity = 0.3,
}: BackgroundImageProps) {
  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src={backgroundImage}
        alt="Background"
        fill
        className="object-cover"
        style={{ opacity }}
        priority
      />
    </div>
  );
}
