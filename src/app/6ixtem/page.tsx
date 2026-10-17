
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Database,
  Gauge,
  MessagesSquare,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

const challenges = [
  {
    title: "Your team operates across disconnected tools",
    description:
      "Client records live in one place, instructions in another, documents somewhere else and progress updates in private conversations. People spend time searching for information instead of using it.",
  },
  {
    title: "The business depends too heavily on memory",
    description:
      "Follow-ups, approvals, onboarding steps and internal responsibilities depend on someone remembering what needs to happen next. When people get busy or leave, important context can disappear.",
  },
  {
    title: "Managers have to chase operational updates",
    description:
      "You should not have to message every employee to understand what has been completed, what is delayed and what needs attention. Your operating process should make responsibilities and progress more visible.",
  },
  {
    title: "Client onboarding is inconsistent",
    description:
      "When every employee follows a different process, the client experience becomes difficult to standardize. Structured records, onboarding steps and service history can make delivery more consistent.",
  },
  {
    title: "You cannot easily see how the business is functioning",
    description:
      "When information is fragmented, patterns and bottlenecks are harder to identify. Better structured operational data creates a stronger foundation for analysis and decision-making.",
  },
];

const capabilities = [
  {
    icon: Users,
    title: "Staff and responsibility management",
    description:
      "Organize team access, roles, responsibilities, assigned work and operational accountability around the structure of your business.",
  },
  {
    icon: Database,
    title: "Client records and onboarding",
    description:
      "Create organized client profiles, retain relevant service information and structure the journey from onboarding through ongoing delivery.",
  },
  {
    icon: MessagesSquare,
    title: "Centralized business communication",
    description:
      "Give important operational information a clearer home so staff can find relevant context without depending entirely on scattered conversations.",
  },
  {
    icon: Workflow,
    title: "Workflow and process design",
    description:
      "Translate recurring activities into repeatable processes, with defined steps, ownership and opportunities for appropriate automation.",
  },
  {
    icon: Gauge,
    title: "Operational visibility",
    description:
      "Develop clearer views of work in progress, outstanding responsibilities, handovers and the areas that may require management attention.",
  },
  {
    icon: ShieldCheck,
    title: "A system shaped around your business",
    description:
      "Determine the right features, access model and integrations from your actual requirements instead of paying for a collection of unrelated tools.",
  },
];

const steps = [
  {
    number: "01",
    title: "Understand your business",
    description:
      "Complete the AI-assisted assessment. It gathers information about your operations, current tools, challenges and desired outcomes.",
  },
  {
    number: "02",
    title: "Evaluate the fit",
    description:
      "Your responses help establish whether your needs align with the 6ixtem approach and what requires further discussion.",
  },
  {
    number: "03",
    title: "Define the system",
    description:
      "Discuss the required modules, workflows, integrations, access requirements and implementation scope.",
  },
  {
    number: "04",
    title: "Implement and refine",
    description:
      "Once scope and terms are agreed, the system can be implemented, tested and refined against the agreed operational requirements.",
  },
];

export default function SixxtemPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <nav className="container-main flex h-[72px] items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-[-0.07em]">
            6ixtem<span className="text-blue-600">.</span>
          </Link>
          <Link href="/6ixtem/assessment" className="button-primary">
            Assess your business <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <section className="blue-glow border-b border-slate-200">
        <div className="container-main py-20 md:py-28">
          <div className="eyebrow">The business operating system</div>
          <h1 className="mt-7 max-w-5xl text-[clamp(43px,7vw,78px)] font-black leading-[1.02] tracking-[-0.065em]">
            Stop managing business complexity through memory, spreadsheets and scattered conversations.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600">
            6ixtem helps growing service businesses bring client information,
            staff operations, internal communication and recurring workflows
            into a more coherent operating environment designed around how the
            business actually functions.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/6ixtem/assessment" className="button-primary">
              Start your business assessment <ArrowRight size={17} />
            </Link>
            <a href="#capabilities" className="button-secondary">
              Explore capabilities
            </a>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Start with your operational challenges. Determine the right system
            before defining the implementation.
          </p>
        </div>
      </section>

      <section className="container-main py-20 md:py-24">
        <div className="eyebrow">Recognize the pattern</div>
        <h2 className="section-heading">
          The business is growing. The way it operates may be holding it back.
        </h2>
        <p className="section-copy">
          Informal processes can work when a business is small. As the team,
          client base and service commitments expand, those same processes can
          become a source of friction.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {challenges.map((item, index) => (
            <article key={item.title} className="surface-card p-6 md:p-7">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
                0{index + 1}
              </div>
              <h3 className="mt-5 text-xl font-bold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="capabilities" className="border-y border-slate-200 bg-[#f5f8ff] py-20 md:py-24">
        <div className="container-main">
          <div className="eyebrow">What the system can address</div>
          <h2 className="section-heading">
            Your operations deserve more than a collection of disconnected tools.
          </h2>
          <p className="section-copy">
            The final configuration depends on your assessment and agreed scope.
            These are the core operational areas we evaluate when designing a
            6ixtem implementation.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="surface-card p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-main grid gap-12 py-20 md:grid-cols-[.8fr_1.2fr] md:py-24">
        <div>
          <div className="eyebrow">The implementation approach</div>
          <h2 className="section-heading">
            Understand first. Design second. Implement with purpose.
          </h2>
          <p className="section-copy">
            We begin with the business and its operating realities, not a
            predetermined list of features.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.number} className="surface-card flex gap-5 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-700">
                {step.number}
              </div>
              <div>
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-main pb-20">
        <div className="rounded-3xl bg-[#102d62] p-7 text-white sm:p-12 md:p-14">
          <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-200">
                <ClipboardCheck size={17} />
                Business assessment
              </div>
              <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                Is your business ready for a more structured operating system?
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-blue-100">
                Tell us how your business operates, where the friction exists
                and what you need to improve. Our AI-assisted assessment helps
                organize that information before the next step.
              </p>
            </div>
            <Link
              href="/6ixtem/assessment"
              className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 font-bold text-blue-900 transition hover:bg-blue-50 md:self-center"
            >
              Begin assessment <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="container-main flex flex-col gap-3 py-7 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <Link href="/" className="font-black tracking-tight text-slate-800">
            6ixtem.
          </Link>
          <span>Business systems designed around your operations.</span>
        </div>
      </footer>
    </main>
  );
}
