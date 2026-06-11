import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" aria-label="Facheiro" className="flex flex-col items-center py-1 group">
      <svg
        viewBox="0 0 100 100"
        className="h-11 w-auto text-facheiro-brown fill-none stroke-facheiro-brown stroke-[2.8] transition-transform duration-300 group-hover:scale-105"
        style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
      >
        {/* Central Stem */}
        <path d="M 50,95 L 50,22" />
        <path d="M 47,24 L 50,20 L 53,24" />
        <path d="M 50,20 L 50,17" />
        
        {/* Left 1 */}
        <path d="M 50,85 C 43,85 41,77 41,65 L 41,38" />
        <path d="M 38,40 L 41,36 L 44,40" />
        <path d="M 41,36 L 41,33" />
        
        {/* Right 1 */}
        <path d="M 50,85 C 57,85 59,77 59,65 L 59,38" />
        <path d="M 56,40 L 59,36 L 62,40" />
        <path d="M 59,36 L 59,33" />
        
        {/* Left 2 */}
        <path d="M 50,90 C 34,90 32,77 32,60 L 32,30" />
        <path d="M 29,32 L 32,28 L 35,32" />
        <path d="M 32,28 L 32,25" />
        
        {/* Right 2 */}
        <path d="M 50,90 C 66,90 68,77 68,60 L 68,30" />
        <path d="M 65,32 L 68,28 L 71,32" />
        <path d="M 68,28 L 68,25" />
        
        {/* Left 3 */}
        <path d="M 50,92 C 25,92 23,77 23,55 L 23,45" />
        <path d="M 20,47 L 23,43 L 26,47" />
        <path d="M 23,43 L 23,40" />

        {/* Right 3 */}
        <path d="M 50,92 C 75,92 77,77 77,55 L 77,45" />
        <path d="M 74,47 L 77,43 L 80,47" />
        <path d="M 77,43 L 77,40" />

        {/* Left 4 */}
        <path d="M 50,95 C 16,95 14,77 14,58 L 14,52" />
        <path d="M 11,54 L 14,50 L 17,54" />
        <path d="M 14,50 L 14,47" />

        {/* Right 4 */}
        <path d="M 50,95 C 84,95 86,77 86,58 L 86,52" />
        <path d="M 83,54 L 86,50 L 89,54" />
        <path d="M 86,50 L 86,47" />
      </svg>
      <span className="font-serif text-lg tracking-[0.16em] uppercase text-facheiro-brown font-bold leading-none mt-1.5">Facheiro</span>
    </Link>
  );
}

