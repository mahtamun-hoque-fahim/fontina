export default function Footer() {
  return (
    <footer className="border-t border-[#1e1e1e] py-6 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-mono text-xs text-[#444]">
          © {new Date().getFullYear()} fontina — built by{" "}
          <a
            href="https://mahtamunhoquefahim.pages.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#666] hover:text-[#00e676] transition-colors"
          >
            MAHTAMUN
          </a>
        </p>
        <p className="font-mono text-xs text-[#444]">
          Powered by{" "}
          <span className="text-[#666]">fonttools</span> · No file storage
        </p>
      </div>
    </footer>
  );
}
