import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import StatCard from "@/components/StatCard";
import { businessTypes, features } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ede9fe] via-[#f5f3ff] to-white" />
        <div className="gradient-blob -top-40 right-0 h-[600px] w-[600px] bg-primary/20" />
        <div className="gradient-blob bottom-0 left-0 h-[500px] w-[500px] bg-secondary/15" />

        <div className="page-container relative py-20 sm:py-28 lg:py-36">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
            {/* Copy */}
            <div>
              <Badge variant="primary" className="mb-8">
                ✦ Trusted by small businesses worldwide
              </Badge>
              <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-[#111827] sm:text-6xl lg:text-7xl">
                The calm way to manage{" "}
                <span className="text-gradient">appointments</span>
              </h1>
              <p className="mt-8 max-w-xl text-xl leading-relaxed text-muted">
                BooklyFlow helps clinics, beauty studios, trainers, and private
                teachers automate bookings, reduce no-shows, and deliver a
                premium client experience.
              </p>
              <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button href="/book" size="xl">
                  Start Booking Free
                </Button>
                <Button href="/admin" variant="outline" size="lg">
                  View Demo Dashboard
                </Button>
              </div>
              <div className="mt-14 flex flex-wrap gap-x-8 gap-y-4 text-sm font-semibold text-[#111827]">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600">
                    ✓
                  </span>
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600">
                    ✓
                  </span>
                  Setup in minutes
                </span>
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 blur-2xl" />
              <Card padding="lg" elevated accent="primary" className="relative">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-muted">
                      Your dashboard
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#111827]">
                      Good morning 👋
                    </p>
                  </div>
                  <Badge variant="neutral">Live preview</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard label="Today" value={8} icon="📅" variant="primary" />
                  <StatCard label="Pending" value={3} icon="⏳" variant="amber" />
                  <StatCard label="Confirmed" value={12} icon="✅" variant="emerald" />
                  <StatCard label="Revenue" value="$1,240" icon="💰" variant="secondary" />
                </div>
                <div className="mt-6">
                  <Button href="/admin" variant="outline" className="w-full">
                    Open Full Dashboard →
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Business types */}
          <div className="mt-24 border-t border-primary/10 pt-16">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted">
              Perfect for
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {businessTypes.map((type) => (
                <span
                  key={type.label}
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-[#111827] shadow-[var(--card-shadow)] ring-1 ring-primary/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--card-shadow-lg)]"
                >
                  <span className="text-lg" aria-hidden="true">
                    {type.icon}
                  </span>
                  {type.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="page-container section-spacing">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6">
            Features
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl">
            Everything you need to run your schedule
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-muted">
            Powerful tools designed for busy owners who care deeply about their
            clients.
          </p>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Card
              key={feature.title}
              hover
              accent={i % 2 === 0 ? "primary" : "secondary"}
              padding="md"
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-light to-white text-2xl shadow-sm ring-1 ring-primary/10"
                role="img"
                aria-hidden="true"
              >
                {feature.icon}
              </span>
              <h3 className="mt-6 text-xl font-bold text-[#111827]">
                {feature.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="page-container pb-24 sm:pb-32 lg:pb-40">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#7c3aed] to-[#9333ea] px-8 py-16 shadow-2xl shadow-primary/25 sm:px-16 sm:py-20 lg:px-20">
          <div className="gradient-blob -right-20 -top-20 h-80 w-80 bg-white/15" />
          <div className="gradient-blob -bottom-20 -left-20 h-64 w-64 bg-secondary/25" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <Badge
              variant="neutral"
              className="mb-8 bg-white/20 text-white ring-white/25"
            >
              Get started free
            </Badge>
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ready to simplify your bookings?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">
              Start accepting online appointments today. A warm, professional
              experience for you and every client.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Button
                href="/book"
                size="xl"
                className="bg-white text-primary shadow-xl hover:bg-white hover:shadow-2xl"
              >
                Get Started — Book Now
              </Button>
              <Button
                href="/admin"
                variant="outline"
                size="lg"
                className="border-2 border-white/50 bg-white/10 text-white backdrop-blur-sm hover:border-white hover:bg-white/20"
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
