import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="top rise" style={{ ["--d" as string]: "0s" }}>
      <Link href="/" className="brand" aria-label="Freshest Fresher home">
        <Logo className="brand-logo" />
        <span className="brand-text">
          <b>SRA</b>
          <span>Veritas University</span>
        </span>
      </Link>
      <nav className="nav">
        <Link href="/#how">How it works</Link>
        <Link href="/#contenders" className="pill">
          Vote
        </Link>
      </nav>
    </header>
  );
}
