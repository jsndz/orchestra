export default function FancySlider() {
  return (
    <form className="absolute inset-0 whitespace-nowrap overflow-hidden font-sans  text-foreground">

      <div
        className="relative flex transition-transform duration-500 ease-out
        peer-checked/hearts:-translate-x-[100vw]
        peer-checked/spades:-translate-x-[200vw]
        peer-checked/diamonds:-translate-x-[300vw]"
      >
        <Slide label="♣ Create" variant="card" />
      </div>

    
    </form>
  );
}

function Slide({
  label,
  variant,
}: {
  label: string;
  variant: "card" | "secondary";
}) {
  const bg =
    variant === "card"
      ? "bg-card text-card-foreground"
      : "bg-secondary text-secondary-foreground";

  return (
    <label
      className={`relative flex items-center justify-center 
      w-screen h-screen text-5xl ${bg}
      cursor-pointer select-none transition-colors duration-300`}
    >
      {label}

      {/* Left Arrow */}
      <span
        className="absolute left-full top-1/2 -translate-y-1/2
        bg-primary text-primary-foreground
        text-4xl px-4 py-8 rounded-r-full
        hover:bg-accent hover:text-accent-foreground
        transition-colors duration-300"
      >
        ❬
      </span>

      {/* Right Arrow */}
      <span
        className="absolute right-full top-1/2 -translate-y-1/2
        bg-primary text-primary-foreground
        text-4xl px-4 py-8 rounded-l-full
        hover:bg-accent hover:text-accent-foreground
        transition-colors duration-300"
      >
        ❭
      </span>
    </label>
  );
}
