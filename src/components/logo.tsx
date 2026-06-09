import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" aria-label="Facheiro">
      <Image
        src="/logo-facheiro.png"
        alt="Facheiro"
        width={220}
        height={90}
        priority
      />
    </Link>
  );
}
