
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Blocks,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Command,
  Database,
  MessagesSquare,
  Network,
  ShieldCheck,
  Workflow,
  Zap,
} from "lucide-react";

const capabilities = [
  {
    icon: Network,
    number: "01",
    title: "Connected operations",
    description:
      "Connect teams, responsibilities, processes and operational information in one coordinated environment.",
  },
  {
    icon: Database,
    number: "02",
    title: "Structured client management",
    description:
      "Keep client profiles, service history, documents and onboarding information organized and accessible.",
  },
  {
    icon: MessagesSquare,
    number: "03",
    title: "Business communication",
    description:
      "Reduce scattered conversations and make important instructions easier to find, follow and act on.",
  },
  {
    icon: Workflow,
    number: "04",
    title: "Workflow automation",
    description:
      "Identify repetitive work and introduce structured workflows, reminders and appropriate automation.",
  },
  {
    icon: BarChart3,
    number: "05",
    title: "Operational visibility",
    description:
      "Build better visibility into responsibilities, progress, bottlenecks and the information needed to make decisions.",
  },
  {
    icon: Blocks,
    number: "06",
    title: "Systems built around you",
    description:
      "Design an operating environment around how your business actually works instead of forcing every process into a generic tool.",
  },
];

const problems = [
  "Client information scattered across spreadsheets, inboxes and messaging apps.",
  "Managers repeatedly chasing staff for updates and task completion.",
  "Client onboarding that depends on memory, manual follow-ups and individual employees.",
  "Important decisions and instructions disappearing inside conversations.",
  "No clear picture of where work stands, who owns it or what needs attention.",
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <nav className="container-main flex h-[76px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Command size={22} strokeWidth={2.5} />
            </span>
            <span className="text-[23px] font-black tracking-[-0.07em] text-slate-950">
              6ixtem<span className="text-blue-600">.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#approach" className="hover:text-blue-600">Our approach</a>
            <a href="#capabilities" className="hover:text-blue-600">Capabilities</a>
            <a href="#fit" className="hover:text-blue-600">Who we serve</a>
          </div>

          <Link href="/6ixtem" className="button-primary">
            Explore 6ixtem <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <section className="blue-glow relative border-b border-slate-200 bg-white">
        <div className="container-main grid items-center gap-14 py-20 md:grid-cols-[1.08fr_.92fr] md:py-28">
          <div>
            <div className="eyebrow">Business systems, intelligently designed</div>

            <h1 className="mt-7 max-w-3xl text-[clamp(43px,6vw,76px)] font-black leading-[1.02] tracking-[-0.065em] text-slate-950">
              Your business has grown.
              <span className="block text-blue-600">
                Have your systems kept up?
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
              Growth creates complexity. 6ixtem helps growing service
              businesses bring their people, client information, communication
              and workflows into a more connected operating environment.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/6ixtem" className="button-primary">
                Discover the system <ArrowRight size={17} />
              </Link>
              <a href="#approach" className="button-secondary">
                See how we work <ArrowDownRight size={17} />
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-600" />
                Built around your operations
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-600" />
                Practical automation
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[36px] bg-blue-100/60 blur-3xl" />
            <div className="surface-card relative overflow-hidden p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                    Operating overview
                  </p>
                  <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                    Your business, connected.
                  </h2>
                </div>
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  System view
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <Database className="text-blue-600" size={21} />
                  <p className="mt-4 text-sm font-bold text-slate-800">Client records</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Information in context
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <Workflow className="text-blue-600" size={21} />
                  <p className="mt-4 text-sm font-bold text-slate-800">Workflows</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Clear process ownership
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <MessagesSquare className="text-blue-600" size={21} />
                  <p className="mt-4 text-sm font-bold text-slate-800">Communication</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Less information friction
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <BarChart3 className="text-blue-600" size={21} />
                  <p className="mt-4 text-sm font-bold text-slate-800">Visibility</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Better operational insight
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-[#102d62] p-5 text-white">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-100">
                  <CircleDot size={16} />
                  The operating principle
                </div>
                <p className="mt-2 text-lg font-bold leading-7">
                  Make the business less dependent on memory and disconnected tools.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-blue-200">
                  <ShieldCheck size={16} />
                  Structured around your business
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="approach" className="container-main py-24">
        <div className="eyebrow">The operational problem</div>
        <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-16">
          <h2 className="section-heading mt-0">
            Growth should create capacity. Not operational chaos.
          </h2>
          <div>
            <p className="section-copy mt-0">
              As a business grows, the informal systems that once worked begin
              to break down. More clients mean more information. More staff mean
              more coordination. More services mean more handovers, dependencies
              and opportunities for things to be missed.
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              The answer is not always another disconnected application. It is
              a more coherent way for the business to operate.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-2">
          {problems.map((problem) => (
            <div key={problem} className="surface-card flex gap-3 p-5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ArrowUpRight size={16} />
              </span>
              <p className="text-sm leading-6 text-slate-700">{problem}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="capabilities" className="border-y border-slate-200 bg-white py-24">
        <div className="container-main">
          <div className="eyebrow">A connected operating environment</div>
          <h2 className="section-heading">
            One operating vision. Multiple connected capabilities.
          </h2>
          <p className="section-copy">
            We identify the operational friction affecting your business and
            design a practical system around the processes that matter.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.number} className="surface-card group p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                      <Icon size={23} />
                    </span>
                    <span className="text-xs font-bold tracking-widest text-slate-300">
                      {item.number}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="fit" className="container-main py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <div className="eyebrow">Who we work with</div>
            <h2 className="section-heading">
              For businesses that have outgrown informal operations.
            </h2>
            <p className="section-copy">
              6ixtem is designed for growing service businesses managing
              recurring clients, multiple responsibilities and increasingly
              complex workflows.
            </p>
            <Link href="/6ixtem" className="button-primary mt-7">
              See if 6ixtem fits your business <ArrowRight size={17} />
            </Link>
          </div>

          <div className="surface-card p-7 sm:p-9">
            {[
              "Your team relies on several disconnected tools.",
              "Client onboarding and service delivery need structure.",
              "Managers spend too much time chasing updates.",
              "You need better visibility into operational activity.",
              "You are ready to invest in improving how the business runs.",
            ].map((item) => (
              <div key={item} className="flex gap-3 border-b border-slate-100 py-4 last:border-0">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-blue-600" />
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-main pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-[#102d62] px-7 py-14 text-white sm:px-12 md:py-16">
          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
              Start with the business, not the software
            </p>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              Before choosing tools, understand what your business actually needs.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-blue-100">
              Start with a structured assessment of your operations, challenges,
              team and requirements. We will use that information to determine
              whether 6ixtem is an appropriate fit.
            </p>
            <Link href="/6ixtem" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 font-bold text-blue-900 transition hover:bg-blue-50">
              Explore the 6ixtem system <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="container-main flex flex-col gap-4 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 6ixtem. Business systems, thoughtfully designed.</p>
          <p>Built around the way your business works.</p>
        </div>
      </footer>
    </main>
  );
}
