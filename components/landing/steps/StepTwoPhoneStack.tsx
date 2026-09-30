import Image from "next/image";

const phones = [
  { id: "1", src: "/phones/phone_1.png", left: "35%", top: "40%" },
  { id: "2", src: "/phones/phone_3.png", left: "45%", top: "40%" },
  { id: "3", src: "/phones/phone_2.png", left: "55%", top: "40%" },
  { id: "4", src: "/phones/phone_4.png", left: "65%", top: "40%" },
  { id: "5", src: "/phones/phone_1.png", left: "75%", top: "40%" },
  { id: "6", src: "/phones/phone_3.png", left: "85%", top: "40%" },
  { id: "7", src: "/phones/phone_2.png", left: "95%", top: "40%" },
  { id: "8", src: "/phones/phone_4.png", left: "105%", top: "40%" },
] as const;

export function StepTwoPhoneStack() {
  return (
    <figure
      className="relative mx-auto my-0 h-[clamp(240px,34vw,390px)] w-full max-w-[560px] overflow-hidden"
      role="img"
      aria-label="Four iPhones arranged in an overlapping, stepped stack"
    >
      {phones.map((phone, index) => (
        <Image
          key={phone.id}
          src={phone.src}
          alt=""
          width={1024}
          height={1536}
          sizes="(max-width: 759px) 140px, 260px"
          draggable={false}
          className="absolute h-[clamp(210px,28vw,280px)] w-auto max-w-none select-none object-contain"
          style={{
            left: phone.left,
            top: phone.top,
            zIndex: index + 1,
            transform: `translate(-50%, -50%) `,
          }}
        />
      ))}
    </figure>
  );
}
