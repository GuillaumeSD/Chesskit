// src/components/NavLink.tsx
import Link from "next/link";
import { ReactNode } from "react";

export default function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      {children}
    </Link>
  );
}