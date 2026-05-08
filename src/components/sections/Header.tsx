import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-[#1e1e1e] bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <LogoMark />
          <span className="font-syne font-bold text-lg tracking-tight text-white group-hover:text-[#00e676] transition-colors">
            fontina
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <a
            href="https://github.com/mahtamun-hoque-fahim/fontina"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#666] hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <GitHubIcon />
          </a>
        </nav>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="#00e676" />
      <text
        x="14"
        y="20"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="16"
        fontWeight="bold"
        fill="#0a0a0a"
      >
        f
      </text>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}
