
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MessageSquareText,
  UserRoundCheck,
  CalendarCheck,
  Workflow,
  ShieldCheck,
  ClipboardList,
  Clock3,
  Database,
  Route,
  Target,
  CircleHelp,
  Building2,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Customer Acquisition Systems | 6ixtem",
  description:
    "Build a custom AI customer acquisition system to answer enquiries, assess prospects, qualify leads, support bookings and prepare your team for better customer conversations.",
};

const problems = [
  {
    n: "01",
    title: "Initial customer inquiries consume too much time",
    subtitle: "Every new inquiry should not require your team to start from zero.",
    problem:
      "Customers ask about services, pricing, availability, requirements and next steps. Even when the questions are predictable, someone has to read each inquiry, provide an answer and decide what should happen next. As volume grows, responses become inconsistent, follow-ups are delayed and your team struggles to balance customer communication with its other responsibilities.",
    solution:
      "We configure an AI interaction process around your approved service information, policies, FAQs and escalation rules. It can answer routine questions, collect context when a customer needs more help and guide the conversation toward an appropriate next step.",
    benefit:
      "Faster responses to routine questions, less repetitive work and more time for valuable customer interactions.",
  },
  {
    n: "02",
    title: "Your team qualifies every lead manually",
    subtitle: "Not every inquiry is a qualified sales opportunity.",
    problem:
      "Some prospects are ready to proceed; others are still exploring, need a different service or cannot be served by your business. Your team may need to establish objectives, requirements, budget, timeline or eligibility through a long sequence of messages before deciding whether a call is worthwhile.",
    solution:
      "We help define your qualification questions and criteria. The AI can guide prospects through a structured assessment, ask relevant follow-ups, collect answers and direct them toward a suitable route. The criteria are agreed with you rather than invented by the AI.",
    benefit:
      "Better-qualified inquiries and less manual screening before a sales conversation.",
  },
  {
    n: "03",
    title: "Discovery calls begin without enough context",
    subtitle:
      "Your team should not spend the first half of a meeting collecting basic information.",
    problem:
      "Calls often begin with questions about what the prospect needs, what they have tried, their priorities and their timeline. Those questions matter, but gathering every detail for the first time during a meeting limits the time available for actual problem-solving and commercial discussion.",
    solution:
      "An assessment can collect relevant information before the call and organize it into a structured summary. Your team can review the prospect's stated needs, identify open questions and prepare for a more useful conversation.",
    benefit:
      "Better-prepared meetings and a smoother transition from inquiry to sales engagement.",
  },
  {
    n: "04",
    title: "Booking requires too much manual coordination",
    subtitle:
      "Customers should not have to wait for someone to coordinate every step.",
    problem:
      "A prospect expresses interest, suggests a time, waits while your team checks availability, proposes another time and then has to share details again. This creates administrative work and opportunities for incomplete records or appointments without sufficient context.",
    solution:
      "We can configure an AI-assisted booking flow that collects required details and connects to a supported calendar or booking system. A booking should only be confirmed after the connected system verifies availability; the workflow can then pass the relevant context to your team.",
    benefit:
      "Fewer coordination steps and more organized, better-prepared appointments.",
  },
  {
    n: "05",
    title: "Your sales process involves several assessment stages",
    subtitle: "Some customers need to be assessed before they can progress.",
    problem:
      "Specialized services and high-value engagements may require several rounds of discovery, internal review or additional information. Without a defined process, prospects can move forward with missing details while employees manually track what has and has not been collected.",
    solution:
      "We map the stages your business actually needs: initial requirements, suitability questions, missing-information checks, qualification, next-step routing and human review. The sequence is designed around your process rather than a generic template.",
    benefit:
      "A more consistent assessment journey and less administrative friction between stages.",
  },
  {
    n: "06",
    title: "Your business answers the same questions every day",
    subtitle: "Your team's time is too valuable to repeatedly explain the basics.",
    problem:
      "Customers want to understand your services, process, requirements and what happens after they enquire. When employees answer the same questions individually, the business repeatedly spends human time on information that could be made available through a properly configured interaction.",
    solution:
      "We prepare the AI around your approved business knowledge, service descriptions, processes and frequently asked questions. When a request requires specialist judgment or the system lacks reliable information, it can route the customer to a person instead of guessing.",
    benefit:
      "More consistent responses and more capacity for complex customer needs.",
  },
  {
    n: "07",
    title: "Leads arrive without enough context for follow-up",
    subtitle:
      "A contact form should begin an informed conversation, not an information hunt.",
    problem:
      "A name and email rarely explain what a prospect needs, which service interests them, what problem they want to solve or whether important qualification questions have been answered. Your team has to restart the conversation simply to establish the basics.",
    solution:
      "The AI can collect contact details, service interests, stated objectives, qualification responses, constraints, booking details and outstanding information, then pass the relevant context to your designated team or supported CRM.",
    benefit:
      "More informed follow-up and a clearer handover from AI to your team.",
  },
];

const applications = [
  {
    icon: UserRoundCheck,
    title: "Lead qualification before discovery calls",
    text: "Establish what a prospect needs, whether the service is relevant and what information your sales team should review before a meeting.",
  },
  {
    icon: CalendarCheck,
    title: "Appointments and reservations",
    text: "Collect booking requirements, guide customers through supported scheduling steps and attach useful context to the appointment.",
  },
  {
    icon: ClipboardList,
    title: "Customer assessment before service",
    text: "Gather the information your business needs to assess suitability, readiness, eligibility or service requirements before proceeding.",
  },
  {
    icon: MessageSquareText,
    title: "Repetitive customer inquiries",
    text: "Make approved business information accessible through a guided interaction and escalate questions that need human judgment.",
  },
  {
    icon: Workflow,
    title: "Multi-stage customer journeys",
    text: "Coordinate structured discovery, missing-information checks, qualification and handoff across the stages your process requires.",
  },
];

const implementation = [
  [
    "01",
    "Understand your current process",
    "We map where inquiries originate, how your team responds, what information is collected and where prospects commonly stall.",
  ],
  [
    "02",
    "Identify the operational bottleneck",
    "We establish which parts of the journey are repetitive, slow, inconsistent or dependent on manual intervention, and whether AI is a practical fit.",
  ],
  [
    "03",
    "Design the assessment and routing",
    "We define the questions, required information, qualification criteria, exceptions and next steps with your team.",
  ],
  [
    "04",
    "Configure AI and integrations",
    "We prepare business knowledge and conversation behavior, then scope the required website, CRM, calendar or booking connections.",
  ],
  [
    "05",
    "Test realistic scenarios",
    "We test common questions, unsuitable leads, missing information, booking paths, edge cases and human handovers before launch.",
  ],
  [
    "06",
    "Launch and improve",
    "After deployment, we review the agreed workflow, identify friction and scope improvements based on real operating needs.",
  ],
];

const fit = [
  "You receive a steady flow of customer inquiries.",
  "Your team repeatedly answers the same questions.",
  "You need to qualify leads before discovery calls.",
  "Customers must complete an assessment before booking or receiving a service.",
  "You coordinate consultations, reservations or appointments.",
  "Your sales process requires several stages of information gathering.",
  "Employees spend too much time collecting lead information manually.",
  "You want structured customer journeys, not just a chatbot that replies to messages.",
];

function SectionIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-heading mt-4">{title}</h2>
      <p className="section-copy mt-5">{copy}</p>
    </div>
  );
}

function CTA({
  label = "Start your business qualification",
  secondary = false,
  href = "/ai-customer-acquisition/qualify",
}: {
  label?: string;
  secondary?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={
        secondary
          ? "button-secondary inline-flex items-center gap-2"
          : "button-primary inline-flex items-center gap-2"
      }
    >
      {label}
      <ArrowRight size={17} />
    </Link>
  );
}

export default function AICustomerAcquisitionPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <nav className="container-main flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black tracking-[-0.07em]"
            aria-label="6ixtem home"
          >
            6ixtem<span className="text-blue-600">.</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <a
              href="#problems"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600"
            >
              Problems we solve
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600"
            >
              Pricing
            </a>
          </div>

          <CTA label="Assess your business" />
        </nav>
      </header>

      <section className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.12),transparent_45%)]" />

        <div className="container-main grid gap-14 py-16 md:py-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-28">
          <div>
            <p className="eyebrow">AI-powered customer acquisition</p>

            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Your Business Needs More Than a Chatbot. It Needs an AI That
              Moves Customers Forward.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Your potential customers are visiting your website, asking
              questions, requesting information and expressing interest in
              your services. But what happens after they arrive?
            </p>

            <p className="mt-4 max-w-2xl leading-8 text-slate-600">
              Someone has to answer their questions, understand what they need,
              determine whether they are the right fit, collect their
              information and arrange the next step. When inquiries arrive
              faster than your team can handle them, opportunities can slip
              through the cracks.
            </p>

            <p className="mt-4 max-w-2xl leading-8 text-slate-600">
              <strong className="text-slate-950">
                6ixtem helps you build a custom AI customer acquisition system
              </strong>{" "}
              that handles the initial stages of your customer journey around
              the way your business actually works.
            </p>

            <p className="mt-4 max-w-2xl leading-8 text-slate-600">
              Your AI can engage potential customers, understand their needs,
              ask relevant questions, assess suitability, support bookings and
              prepare useful information for your team.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <CTA label="Assess your business with AI" />
              <CTA
                label="Explore how it works"
                secondary
                href="#how-it-works"
              />
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              First, tell us about your business. Then the AI assessment
              explores your customer acquisition process.
            </p>
          </div>

          <div className="blue-glow rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-blue-950/10 sm:p-7">
            <div className="rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
                  <Sparkles size={22} />
                </span>
                <div>
                  <p className="font-bold">AI Customer Acquisition</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Designed around your business
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                {[
                  ["01", "Understand the inquiry"],
                  ["02", "Ask the right questions"],
                  ["03", "Assess and qualify"],
                  ["04", "Route to the next step"],
                  ["05", "Prepare your team"],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-xs font-black text-blue-300">
                      {number}
                    </span>
                    <span className="font-medium text-slate-100">{label}</span>
                    <CheckCircle2
                      className="ml-auto text-blue-300"
                      size={17}
                    />
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm leading-6 text-slate-300">
                Not just a conversation interface. A defined process that
                helps move a customer from initial interest toward an
                appropriate next step.
              </p>
            </div>

            <div className="grid gap-3 p-2 pt-5 sm:grid-cols-3">
              {[
                ["Engage", "Answer approved questions"],
                ["Assess", "Collect useful context"],
                ["Handover", "Prepare the next step"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-xl bg-slate-50 p-4">
                  <p className="font-bold">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16 md:py-24">
        <div className="container-main">
          <SectionIntro
            eyebrow="The operational problem"
            title="Your team shouldn't have to process every customer manually."
            copy="You can invest in advertising, improve your website and generate inquiries. But when every inquiry requires a person to intervene, your ability to convert interest into business becomes dependent on your team's availability."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="surface-card p-6">
              <h3 className="text-xl font-bold">
                What happens during a typical day?
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                One prospect wants to know whether your service is suitable.
                Another needs to answer questions before booking. Someone else
                wants to understand your process or pricing. A promising lead
                submits an inquiry, but your team needs more information
                before scheduling a call.
              </p>
              <p className="mt-3 leading-7 text-slate-600">
                Meanwhile, your employees are serving existing customers,
                delivering work and managing other responsibilities. Questions
                accumulate, follow-ups get delayed, and meetings are scheduled
                without enough context.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <h3 className="text-xl font-bold">
                The issue is not always a lack of effort.
              </h3>
              <p className="mt-3 leading-7 text-slate-300">
                Your customer acquisition process may simply depend on too
                much manual work. As the business grows, that dependency
                becomes increasingly expensive in staff time, responsiveness
                and missed opportunities.
              </p>

              <div className="mt-6 border-t border-white/15 pt-5">
                <p className="text-lg font-bold">
                  What if your business could assess a customer before your
                  team ever speaks to them?
                </p>
                <p className="mt-3 leading-7 text-slate-300">
                  A configured AI can engage the prospect, ask relevant
                  questions, collect required information and guide them to
                  the next step. Your team receives a clearer picture of who
                  the prospect is, what they need and why they are interested.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="problems"
        className="border-y border-slate-200 bg-slate-50 py-16 md:py-24"
      >
        <div className="container-main">
          <SectionIntro
            eyebrow="Problems we solve"
            title="Build a better first step for every customer."
            copy="The exact workflow depends on your business. These are seven common points where a custom AI customer acquisition process can reduce manual work and make customer engagement more consistent."
          />

          <div className="mt-10 space-y-5">
            {problems.map((p) => (
              <article
                key={p.n}
                className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-[90px_1fr_1fr] md:p-8"
              >
                <div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-700">
                    {p.n}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold tracking-tight">{p.title}</h3>
                  <p className="mt-2 font-semibold text-slate-700">
                    {p.subtitle}
                  </p>
                  <p className="mt-4 leading-7 text-slate-600">{p.problem}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-5">
                  <h4 className="flex items-center gap-2 font-bold">
                    <CheckCircle2 size={17} className="text-blue-600" />
                    How 6ixtem helps
                  </h4>
                  <p className="mt-3 leading-7 text-slate-600">{p.solution}</p>
                  <p className="mt-4 border-t border-slate-200 pt-4 text-sm font-semibold leading-6 text-slate-800">
                    Benefit: {p.benefit}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-main py-16 md:py-24">
        <SectionIntro
          eyebrow="Business applications"
          title="One system. Multiple customer acquisition use cases."
          copy="Every business has a different customer journey. We do not assume every company needs the same workflow. We start with what your customers need to do, what your team needs to know and which steps can be handled reliably through AI."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => {
            const Icon = application.icon;

            return (
              <article
                key={application.title}
                className="surface-card p-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 text-lg font-bold">
                  {application.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {application.text}
                </p>
              </article>
            );
          })}

          <article className="rounded-2xl bg-blue-600 p-6 text-white">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <Target size={22} />
            </span>
            <h3 className="mt-5 text-lg font-bold">
              A workflow built for your business
            </h3>
            <p className="mt-3 leading-7 text-blue-50">
              The aim is not to add AI for its own sake. It is to design a
              useful process around your actual acquisition bottleneck.
            </p>
          </article>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-slate-200 bg-slate-50 py-16 md:py-24"
      >
        <div className="container-main grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <SectionIntro
              eyebrow="How the system works"
              title="Your AI should support the process you already need."
              copy="We translate your business knowledge and customer journey into a defined interaction, assessment and handoff process."
            />

            <div className="mt-7 rounded-2xl bg-slate-950 p-6 text-white">
              <ShieldCheck size={25} className="text-blue-300" />
              <h3 className="mt-4 text-lg font-bold">Designed with controls</h3>
              <p className="mt-3 leading-7 text-slate-300">
                Approved business knowledge, explicit qualification criteria,
                clear escalation paths and human review where required. The
                system should not invent policies, claim unverified results
                or confirm bookings without a connected system validating
                availability.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              [
                Building2,
                "Business knowledge",
                "Your service information, policies, FAQs and approved answers.",
              ],
              [
                ClipboardList,
                "Assessment rules",
                "The questions and information your business needs to evaluate a prospect.",
              ],
              [
                Route,
                "Customer journey",
                "The steps from first inquiry through qualification, booking or human review.",
              ],
              [
                Database,
                "Tools and handover",
                "Where supported, connect website forms, CRM, calendar or booking tools and pass the relevant context to your team.",
              ],
              [
                CircleHelp,
                "Exceptions and escalation",
                "Define what happens when information is missing, the request is outside scope or a person needs to make the decision.",
              ],
            ].map(([Icon, title, description]) => {
              const ItemIcon = Icon as typeof Building2;

              return (
                <div
                  key={String(title)}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <ItemIcon size={21} />
                  </span>
                  <div>
                    <h3 className="font-bold">{String(title)}</h3>
                    <p className="mt-2 leading-7 text-slate-600">
                      {String(description)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-main py-16 md:py-24">
        <SectionIntro
          eyebrow="Implementation"
          title="From business process to deployed workflow."
          copy="A useful system starts with understanding your process—not with choosing a model or adding a chat window. Each stage is shaped around the agreed scope."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {implementation.map(([number, title, description]) => (
            <article key={number} className="surface-card p-6">
              <p className="text-sm font-black tracking-widest text-blue-600">
                STEP {number}
              </p>
              <h3 className="mt-3 text-lg font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16 md:py-24">
        <div className="container-main grid gap-12 md:grid-cols-2">
          <div>
            <SectionIntro
              eyebrow="Is it a fit?"
              title="Built for businesses with a real customer acquisition bottleneck."
              copy="A custom AI workflow is most useful when there is a meaningful process to improve, enough information to define the rules and a team ready to use the handoff."
            />

            <ul className="mt-7 space-y-3">
              {fit.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 leading-7 text-slate-700"
                >
                  <CheckCircle2
                    className="mt-1 shrink-0 text-blue-600"
                    size={18}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            id="pricing"
            className="rounded-2xl border border-slate-200 bg-white p-7"
          >
            <Clock3 size={26} className="text-blue-600" />
            <h3 className="mt-4 text-2xl font-bold">
              When a custom system may not be necessary
            </h3>
            <p className="mt-4 leading-7 text-slate-600">
              If your business receives very few inquiries, has a very simple
              customer journey or would be better served by an inexpensive
              standard booking form, a custom AI implementation may not be
              the right investment.
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              Our objective is to identify whether AI can solve a meaningful
              problem—not to introduce complexity where it offers little
              practical value.
            </p>

            <div className="mt-7 border-t border-slate-200 pt-6">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Commercial starting point
              </p>
              <p className="mt-2 text-3xl font-black">
                $1,500{" "}
                <span className="text-base font-semibold text-slate-500">
                  implementation from
                </span>
              </p>
              <p className="mt-2 leading-7 text-slate-600">
                Ongoing service from $100/month. Advanced booking, CRM and
                workflow integrations are scoped according to requirements.
                Complex multi-stage systems receive a custom quotation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-main py-16 md:py-24">
        <div className="rounded-3xl bg-[#0b1730] px-6 py-12 text-white sm:px-10 md:px-14 md:py-16">
          <p className="eyebrow text-blue-300">
            Let&apos;s assess your business
          </p>

          <h2 className="mt-4 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
            Your business has a way of acquiring customers. Your AI should
            support it.
          </h2>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Tell us about your business first. Then our AI assessment will
            explore how inquiries arrive, how prospects are qualified, what
            tools you use and where a custom workflow could help. Suitable
            prospects can proceed to a consultation; other requirements may
            need further review.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <CTA label="Start with business qualification" />
            <p className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle2 size={16} />
              Business details first. AI assessment second.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          6ixtem — Business systems, intelligently designed.
        </p>
      </section>
    </main>
  );
}
