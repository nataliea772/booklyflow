export default function PublicFooter() {
  return (
    <footer className="border-t border-primary/10 bg-white/60 py-8 backdrop-blur-sm">
      <div className="page-container flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-right">
        <p className="text-sm text-muted">
          הזמנת תורים אונליין — פשוט, מהיר ונוח.
        </p>
        <p className="text-xs text-muted/80">
          Powered by{" "}
          <span className="font-semibold text-primary/70">BooklyFlow</span>
        </p>
      </div>
    </footer>
  );
}
