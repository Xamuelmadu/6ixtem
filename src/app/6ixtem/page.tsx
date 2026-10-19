import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  ClipboardCheck,
  Database,
  Gauge,
  MessageSquareText,
  ShieldCheck,
  Users,
  Workflow,
  Sparkles,
  RefreshCw,
  ClipboardList,
  Building2,
  LockKeyhole,
  Eye,
  CircleHelp,
  BriefcaseBusiness,
  ChartNoAxesCombined,
} from "lucide-react";

const challenges = [
  {
    title: "Your business depends too much on you",
    subtitle: "You cannot step away because too much depends on your memory and personal involvement.",
    problem:
      "You remember which client needs a follow-up, which employee is handling an issue, and how a particular process should work. As the business grows, you become the reminder system, information centre, and final destination for too many questions.",
    solution:
      "Organize client information, responsibilities, documented processes, and operational activities. Give authorized employees access to the information relevant to their roles and make work status easier to follow.",
    benefit: "Greater operational independence, fewer avoidable interruptions, and more time for decisions that move the business forward.",
  },
  {
    title: "Your staff are working, but you cannot always see what is happening",
    subtitle: "You should not have to chase every employee to understand the state of your operations.",
    problem:
      "Tasks may be completed without informing the next person. Managers may believe an issue is resolved only to discover later that nothing happened. These gaps become more difficult across locations, shifts, departments, and client accounts.",
    solution:
      "Establish clearer responsibilities, task assignments, expected completion times, workflow stages, status updates, and escalation processes. Management views can bring important operational information together.",
    benefit: "Better coordination, clearer accountability, and less time spent chasing updates.",
  },
  {
    title: "Your business communication is scattered",
    subtitle: "Important business information should not disappear into conversations.",
    problem:
      "Instructions live in messaging apps, decisions happen on calls, requests arrive by email, and documents sit in different folders. People can communicate frequently and still lack the context needed to do their work.",
    solution:
      "Keep relevant records, instructions, activity histories, and workflows closer to the work they support. Where useful, assess integrations with existing communication and business tools.",
    benefit: "Fewer communication gaps, less repeated explanation, and better continuity between employees and departments.",
  },
  {
    title: "Important client information gets forgotten",
    subtitle: "Clients should not depend on individual employees remembering everything.",
    problem:
      "When an employee goes on leave, changes roles, or leaves the company, the business may lose knowledge about client preferences, previous complaints, agreed arrangements, and outstanding commitments.",
    solution:
      "Create structured client records containing relevant contact details, service history, preferences, interactions, documents, follow-up actions, and assigned responsibilities, with access controlled appropriately.",
    benefit: "More consistent client experiences, fewer forgotten commitments, and less disruption when responsibilities change.",
  },
  {
    title: "Your client onboarding is inconsistent",
    subtitle: "Every new client should enter a process your business understands and can repeat.",
    problem:
      "Information may be incomplete, documents may be missing, responsibilities may be unclear, and clients may have to provide the same details more than once. The problem can affect service delivery and client confidence before work even begins.",
    solution:
      "Design repeatable onboarding steps for information collection, documents, approvals, account ownership, task creation, internal notifications, and handover to the relevant team.",
    benefit: "A more professional first impression, fewer onboarding gaps, and a clearer path from winning a client to delivering the service.",
  },
  {
    title: "Your clients have no central place to interact with your business",
    subtitle: "Some client relationships need more than a phone number and an email address.",
    problem:
      "Clients may need to submit information, access documents, check request status, or communicate with the right team. Without a structured process, staff coordinate every interaction manually.",
    solution:
      "Where it makes sense, design client-facing functionality such as client accounts, permitted document access, service requests, status updates, and client-specific service history.",
    benefit: "A more organized client experience, fewer repetitive inquiries, and better access to relevant information.",
  },
  {
    title: "Your business has information but little operational insight",
    subtitle: "Having records is not the same as understanding what is happening.",
    problem:
      "If management must collect information from multiple people and platforms to find delayed work, unresolved client issues, bottlenecks, or recurring problems, the business has data without enough operational visibility.",
    solution:
      "Identify the information that matters to management and create appropriate dashboards, task and workflow status views, overdue activity reports, team summaries, and reporting on recorded issues.",
    benefit: "Better visibility, earlier identification of problems, and decisions based on recorded evidence rather than assumptions.",
  },
  {
    title: "Employee handovers interrupt business continuity",
    subtitle: "Your business should not lose its operational memory when someone changes roles.",
    problem:
      "Employees acquire knowledge about clients, processes, escalation paths, and documents. When that knowledge is not recorded, a new person must reconstruct the work from scratch.",
    solution:
      "Document standard operating procedures, role guidance, client-specific instructions, task histories, outstanding actions, handover checklists, and relevant decisions.",
    benefit: "More reliable handovers, faster employee onboarding, and greater continuity when people change roles.",
  },
  {
    title: "Your business is doing too much manually",
    subtitle: "Repetitive administration consumes time your team could spend serving clients.",
    problem:
      "Employees repeatedly enter information, send reminders, create similar tasks, prepare routine reports, and chase activities that should follow a defined process.",
    solution:
      "Start by understanding the process, then assess suitable opportunities for recurring task creation, reminders, approvals, escalations, routine reporting, and information movement between connected systems.",
    benefit: "Less repetitive administration, more consistent execution, and more time for work that requires human attention.",
  },
];

const capabilities = [
  {
    icon: Users,
    title: "Staff and responsibility management",
    description: "Organize employee accounts, role-appropriate access, responsibilities, assignments, and handovers.",
  },
  {
    icon: Database,
    title: "Client records and service history",
    description: "Bring client details, relevant documents, previous interactions, and outstanding requests into structured records.",
  },
  {
    icon: Workflow,
    title: "Workflows and task coordination",
    description: "Define how work moves through your business, who owns each step, what happens next, and when an issue needs attention.",
  },
  {
    icon: MessageSquareText,
    title: "Connected business information",
    description: "Keep instructions, decisions, and operational records closer to the work they support. Assess integrations where useful.",
  },
  {
    icon: ClipboardList,
    title: "Process documentation",
    description: "Document standard operating procedures, role guidance, checklists, and repeatable ways of working.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Operational visibility",
    description: "Give managers relevant views of progress, outstanding work, recorded issues, and operational activity.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted work",
    description: "Assess suitable uses for summaries, information retrieval, categorization, drafting, and administrative assistance.",
  },
  {
    icon: RefreshCw,
    title: "Automation and integrations",
    description: "Reduce repeatable manual steps and connect supported tools where the process and business case justify it.",
  },
];

const industries = [
  {
    label: "FIELD SERVICES",
    title: "Cleaning, facilities management, lawn care and landscaping",
    intro: "Connect clients, service locations, assigned teams, work instructions, schedules, and completion records.",
    bullets: [
      "Organized client and location information.",
      "Assigned responsibilities and recurring service schedules.",
      "Accessible work instructions and relevant checklists.",
      "Recorded completion, outstanding issues, and service histories.",
      "A clearer view of activity across locations.",
    ],
    outcome: "Better coordination between the office, supervisors, field teams, and clients.",
  },
  {
    label: "HOSPITALITY",
    title: "Hotels, guest services and hospitality operators",
    intro: "Structure operational processes where a guest's experience depends on timely communication, clear responsibilities, and reliable handovers.",
    bullets: [
      "Internal task assignment and tracking.",
      "Departmental responsibilities and documented procedures.",
      "Guest-related requests and follow-up.",
      "Internal handovers and operational reporting.",
      "Staff access to relevant business information.",
    ],
    outcome: "Better internal coordination and a more consistent approach to service delivery.",
  },
  {
    label: "MEDICAL AND HOME CARE",
    title: "Healthcare providers, home care agencies and care organizations",
    intro: "Support appropriate administrative and operational workflows where reliable information and clear responsibilities are especially important.",
    bullets: [
      "Staff scheduling and coordination.",
      "Authorized access to relevant records.",
      "Documented procedures and structured handovers.",
      "Administrative task assignment and tracking.",
      "Incident-reporting workflows and operational oversight.",
    ],
    outcome: "Better coordination, clearer documentation, and more structured operational processes within an appropriately designed security and compliance framework.",
    note: "Clinical records, care documentation, and sensitive information require appropriate security controls. Specialized functionality must be assessed against applicable requirements before deployment. A general Business OS is not automatically healthcare-compliant.",
  },
];

const securityItems = [
  {
    title: "Access based on responsibility",
    description: "Define what employees, managers, and other users can access according to their roles. Sensitive records may need additional restrictions.",
  },
  {
    title: "Appropriate separation of business data",
    description: "For shared platforms, organization and tenant isolation must be designed and tested so one business cannot access another business's records.",
  },
  {
    title: "Authentication and account management",
    description: "Assess secure authentication, session handling, account lifecycle processes, and additional protections such as multi-factor authentication where supported and appropriate.",
  },
  {
    title: "Protection in transit and at rest",
    description: "Evaluate encrypted connections, database and hosting protections, administrative access, backups, and integrations based on the information being processed.",
  },
  {
    title: "Operational accountability",
    description: "Where required, assess activity records, audit trails, and monitoring of sensitive operations to support investigation and internal accountability.",
  },
  {
    title: "Backups and recovery",
    description: "Define backup frequency, retention, restoration procedures, and recovery objectives based on the hosting environment and agreed service requirements.",
  },
  {
    title: "Responsible use of AI",
    description: "Assess which information AI tools can access, which providers process it, and what permissions, safeguards, and review processes are needed.",
  },
  {
    title: "Privacy and compliance",
    description: "Requirements depend on the industry, data, countries involved, and 6ixtem's role. Compliance is assessed for the proposed implementation, not assumed.",
  },
];

const process = [
  {
    number: "01",
    title: "Tell us about your business",
    description: "Complete the AI-assisted assessment about your industry, team, clients, current tools, and operational challenges.",
  },
  {
    number: "02",
    title: "Identify the operational challenges",
    description: "Examine the problems you describe, how they affect the business, and which areas may benefit from a more structured operating system.",
  },
  {
    number: "03",
    title: "Assess the scope",
    description: "Determine what can be addressed with existing capabilities, what needs configuration, and what may require integrations or additional development.",
  },
  {
    number: "04",
    title: "Discuss the proposed solution",
    description: "If there is a potential fit, discuss the approach, implementation scope, investment, and next steps. Additional discovery may be needed.",
  },
  {
    number: "05",
    title: "Agree on the implementation",
    description: "Define deliverables, responsibilities, costs, timeline, and acceptance criteria before implementation begins.",
  },
  {
    number: "06",
    title: "Implement and refine",
    description: "Configure or develop the agreed system, prepare relevant information and workflows, and support the agreed onboarding process.",
  },
];

const fitPoints = [
  "Your business manages an established or growing client base.",
  "Multiple employees participate in delivering your services.",
  "Information is scattered across different tools and communication channels.",
  "You struggle to maintain visibility into daily operations.",
  "Client onboarding and employee handovers are inconsistent.",
  "You depend heavily on personal follow-up to keep work moving.",
  "You want more reliable workflows, information continuity, and accountability.",
  "You are prepared to invest in improving how your business operates.",
];

export default function SixxtemPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <nav className="container-main flex h-[72px] items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-black tracking-[-0.07em]">
            6ixtem<span className="text-blue-600">.</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#challenges" className="transition hover:text-blue-700">Challenges</a>
            <a href="#capabilities" className="transition hover:text-blue-700">Capabilities</a>
            <a href="#industries" className="transition hover:text-blue-700">Industries</a>
            <a href="#security" className="transition hover:text-blue-700">Security</a>
            <a href="#pricing" className="transition hover:text-blue-700">Pricing</a>
          </div>
          <Link href="/6ixtem/assessment" className="button-primary whitespace-nowrap">
            Assess your business <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <section className="blue-glow border-b border-slate-200">
        <div className="container-main py-20 md:py-28">
          <div className="eyebrow">Business operating systems · Built around your business</div>
          <h1 className="mt-7 max-w-5xl text-[clamp(43px,7vw,78px)] font-black leading-[1.02] tracking-[-0.065em]">
            Your business has grown. Have your systems kept up?
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600">
            You have clients to serve, employees to manage, information to keep track of, and operations that need to run whether you are present or not. 6ixtem helps you build a business operating system around the way your business actually works.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            We study your operations, understand your challenges, and design a connected working environment to help your team manage clients, coordinate activities, share information, document processes, and keep the business moving.
          </p>
          <p className="mt-4 max-w-3xl font-semibold leading-7 text-slate-800">
            We don't begin by asking you to change how your business works. We begin by understanding how it works and building the systems it needs to work better.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/6ixtem/assessment" className="button-primary">
              Discuss your business <ArrowRight size={17} />
            </Link>
            <a href="#capabilities" className="button-secondary">Explore capabilities</a>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Offers can start from <strong className="text-slate-800">$2,000</strong>. Final scope and pricing depend on your requirements.
          </p>
        </div>
      </section>

      <section className="container-main py-20 md:py-24">
        <div className="eyebrow">Recognize the pattern</div>
        <h2 className="section-heading">You built the business. You shouldn't have to remember everything that keeps it running.</h2>
        <div className="section-copy space-y-4">
          <p>At first, managing a business through messaging apps, spreadsheets, phone calls, notebooks, email, and personal supervision can seem manageable. You know your clients, understand what everyone is doing, and remember which employee is responsible for a task.</p>
          <p>Then the business grows. You have more clients, employees, transactions, service locations, and people making decisions. Information is everywhere except where you need it. An employee knows something the manager doesn't. A client has to explain the same issue twice. A task is completed, but nobody updates the relevant person.</p>
          <p>You spend time managing the flow of information instead of managing the business itself. You call more often, ask for updates, follow up personally, and check whether work has been completed.</p>
          <p><strong>This is not necessarily a people problem. Often, it is a systems problem.</strong> When the systems connecting people, information, responsibilities, and daily activities are fragmented, even good teams struggle to perform consistently.</p>
        </div>
        <div className="mt-9 rounded-2xl border border-blue-100 bg-blue-50/70 p-6 md:p-8">
          <h3 className="text-xl font-bold tracking-tight md:text-2xl">What if everyone knew what they needed to know, did what they needed to do, and kept the right people informed?</h3>
          <p className="mt-3 leading-7 text-slate-600">Imagine accessible client information, clear responsibilities, documented instructions, visible work status, reliable handovers, and AI or automation supporting suitable repetitive processes. That is the operational environment 6ixtem helps you work toward.</p>
        </div>
      </section>

      <section id="challenges" className="border-y border-slate-200 bg-[#f5f8ff] py-20 md:py-24">
        <div className="container-main">
          <div className="eyebrow">The operational problems</div>
          <h2 className="section-heading">Nine problems we help growing businesses address.</h2>
          <p className="section-copy">Each implementation is shaped by your requirements. These are common operational challenges we investigate during discovery.</p>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {challenges.map((item, index) => (
              <article key={item.title} className="surface-card p-6 md:p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight">{item.title}</h3>
                <p className="mt-2 font-medium leading-6 text-slate-700">{item.subtitle}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{item.problem}</p>
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-blue-800">How 6ixtem helps</h4>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.solution}</p>
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm leading-6 text-slate-700"><strong>The benefit:</strong> {item.benefit}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities" className="container-main py-20 md:py-24">
        <div className="eyebrow">What the system can address</div>
        <h2 className="section-heading">One operating environment. Connected business functions.</h2>
        <p className="section-copy">The final configuration depends on your assessment and agreed scope. We evaluate the operational areas that will make a meaningful difference to your business.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="surface-card p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white"><Icon size={22} /></span>
                <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="industries" className="border-y border-slate-200 bg-[#f5f8ff] py-20 md:py-24">
        <div className="container-main">
          <div className="eyebrow">Industry applications</div>
          <h2 className="section-heading">One approach, configured around your industry.</h2>
          <p className="section-copy">Service businesses have different operating realities. We account for those differences instead of assuming every organization needs the same system.</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {industries.map((industry) => (
              <article key={industry.label} className="surface-card flex flex-col p-6 md:p-7">
                <span className="text-xs font-bold tracking-[0.14em] text-blue-700">{industry.label}</span>
                <h3 className="mt-4 text-xl font-bold tracking-tight">{industry.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{industry.intro}</p>
                <ul className="mt-5 space-y-3">
                  {industry.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2 text-sm leading-6 text-slate-700">
                      <Check size={17} className="mt-1 shrink-0 text-blue-700" /> <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl bg-blue-50 p-4">
                  <p className="text-sm leading-6 text-slate-700"><strong>Potential outcome:</strong> {industry.outcome}</p>
                </div>
                {industry.note && <p className="mt-4 text-xs leading-6 text-slate-500">{industry.note}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-main py-20 md:py-24">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="eyebrow">Designed around your operations</div>
            <h2 className="section-heading">We don't believe every business should be forced into the same workflow.</h2>
            <p className="section-copy">A cleaning company does not operate like a home care provider. Even two companies in the same industry may have different approval processes, management structures, and service requirements.</p>
            <p className="mt-4 leading-7 text-slate-600">We begin with your business, identify the problems worth solving, and determine how a connected operating system can support the way you work.</p>
          </div>
          <div className="space-y-4">
            {[
              ["Workflows that reflect your business", "We examine how work moves through your organization and identify opportunities to make it more structured and reliable."],
              ["Information with a clear place", "Establish how client information, staff records, operational documents, and decisions should be organized and accessed."],
              ["Responsibilities people understand", "Define how tasks, responsibilities, and handovers should be communicated and tracked."],
              ["Visibility for management", "Identify the operational information that matters to managers and make it available through appropriate views and reporting."],
              ["Room to evolve", "Extend the system through supported configuration, additional modules, integrations, or separately scoped development as your business changes."],
            ].map(([title, description]) => (
              <div key={title} className="surface-card flex gap-4 p-5 md:p-6">
                <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Check size={18} /></span>
                <div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{description}</p></div>
              </div>
            ))}
            <p className="text-sm leading-7 text-slate-500">We will distinguish existing capabilities from items that need configuration, third-party services, or additional development. We do not assume every feature is available immediately.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#f5f8ff] py-20 md:py-24">
        <div className="container-main">
          <div className="eyebrow">AI and automation</div>
          <h2 className="section-heading">Use AI where it solves a real operational problem.</h2>
          <p className="section-copy">Adding AI does not automatically make a business more efficient. We treat AI and automation as capabilities that can support a well-defined process—not as substitutes for understanding your business.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["AI-assisted business information", "Help authorized employees find and summarize relevant information where the required records and integrations are available."],
              ["Operational summaries", "Summarize available records to help managers understand outstanding activities, recorded issues, or changes that deserve attention."],
              ["Administrative assistance", "Support suitable repetitive information processing, drafting, categorization, and other administrative tasks."],
              ["Workflow automation", "Trigger notifications, create tasks, move work through defined stages, and escalate activities according to established rules."],
              ["Information handovers", "Organize relevant records and task histories so employees can understand what has happened and what needs to happen next."],
              ["Industry-specific opportunities", "Assess opportunities such as recurring field assignments, hospitality request routing, or carefully controlled administrative handover support."],
            ].map(([title, description]) => (
              <article key={title} className="surface-card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white"><Sparkles size={20} /></span>
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm leading-7 text-slate-500">Not every business needs every capability. We assess suitability, permissions, safeguards, and human review before proposing an AI or automation feature.</p>
        </div>
      </section>

      <section id="security" className="container-main py-20 md:py-24">
        <div className="max-w-3xl">
          <div className="eyebrow">Security and trust</div>
          <h2 className="section-heading">Your business operating system must be designed around trust.</h2>
          <p className="section-copy">You may be entrusting the system with client information, employee records, internal documents, service histories, and commercially sensitive information. These questions should be answered before implementation—not after deployment.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {securityItems.map((item, index) => (
            <article key={item.title} className="surface-card p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  {index === 0 ? <LockKeyhole size={20} /> : index === 1 ? <ShieldCheck size={20} /> : index === 2 ? <Users size={20} /> : index === 3 ? <Database size={20} /> : index === 4 ? <Eye size={20} /> : index === 5 ? <RefreshCw size={20} /> : index === 6 ? <Sparkles size={20} /> : <BriefcaseBusiness size={20} />}
                </span>
                <div><h3 className="font-bold">{item.title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p></div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <strong>Important:</strong> Security and compliance depend on the actual architecture, configuration, data, hosting, and applicable legal requirements. We do not claim every deployment is automatically compliant with every regulation. The security arrangements and any additional requirements should be documented for the proposed implementation.
        </div>
      </section>

      <section id="pricing" className="border-y border-slate-200 bg-[#f5f8ff] py-20 md:py-24">
        <div className="container-main">
          <div className="grid gap-10 md:grid-cols-[1fr_0.85fr] md:items-start">
            <div>
              <div className="eyebrow">Scope and pricing</div>
              <h2 className="section-heading">A system shaped around your actual requirements.</h2>
              <p className="section-copy">Offers can start from $2,000. The final price depends on operational complexity, workflows, existing systems to connect, data migration, and the functionality required.</p>
              <p className="mt-4 leading-7 text-slate-600">We assess your needs and propose a defined scope of work. More extensive implementations involving multiple departments or locations, complex workflows, specialist integrations, or bespoke functionality may require a larger investment.</p>
              <p className="mt-4 leading-7 text-slate-600">Ongoing charges may apply for hosting, maintenance, support, AI usage, third-party services, software access, and continued development. These costs should be clearly stated in your proposal.</p>
            </div>
            <div className="rounded-3xl bg-[#102d62] p-7 text-white sm:p-9">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-200"><Building2 size={17} /> Tailored implementation</div>
              <p className="mt-6 text-sm font-semibold text-blue-100">Offers can start from</p>
              <p className="mt-1 text-5xl font-black tracking-tight">$2,000</p>
              <p className="mt-4 leading-7 text-blue-100">The actual proposal depends on the agreed requirements, deliverables, integrations, and implementation complexity.</p>
              <ul className="mt-6 space-y-3">
                {[
                  "Core business records and workflows, where included in scope",
                  "Staff access and client management, as agreed",
                  "Relevant task coordination and reporting",
                  "Defined deliverables and implementation terms",
                ].map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-blue-50"><Check size={17} className="mt-1 shrink-0" />{item}</li>)}
              </ul>
              <Link href="/6ixtem/assessment" className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 font-bold text-blue-900 transition hover:bg-blue-50">
                Discuss your requirements <ArrowRight size={17} />
              </Link>
            </div>
          </div>
          <p className="mt-6 text-sm leading-7 text-slate-500">We are not interested in selling features you do not need. The goal is to identify the operational problems worth solving and agree on a system with clear scope and realistic expectations.</p>
        </div>
      </section>

      <section className="container-main py-20 md:py-24">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="eyebrow">The implementation approach</div>
            <h2 className="section-heading">Understand first. Design second. Implement with purpose.</h2>
            <p className="section-copy">We use a structured process to understand your business before proposing an implementation.</p>
          </div>
          <div className="space-y-4">
            {process.map((step) => (
              <article key={step.number} className="surface-card flex gap-5 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-700">{step.number}</div>
                <div><h3 className="text-lg font-bold">{step.title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#f5f8ff] py-20 md:py-24">
        <div className="container-main grid gap-10 md:grid-cols-2">
          <div>
            <div className="eyebrow">Is 6ixtem right for you?</div>
            <h2 className="section-heading">A good fit starts with an operational problem worth solving.</h2>
            <p className="section-copy">6ixtem is most relevant when challenges extend across several parts of your business and you need a more connected operating environment.</p>
            <ul className="mt-7 space-y-3">
              {fitPoints.map((point) => <li key={point} className="flex gap-3 text-sm leading-7 text-slate-700"><Check size={18} className="mt-1 shrink-0 text-blue-700" />{point}</li>)}
            </ul>
          </div>
          <div className="surface-card h-fit p-7 md:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><CircleHelp size={23} /></span>
            <h3 className="mt-5 text-xl font-bold">When it may not be the right fit</h3>
            <p className="mt-3 leading-7 text-slate-600">If you only need a basic website, a simple contact list, or one isolated feature already available in an inexpensive off-the-shelf tool, a custom operating system may be unnecessary.</p>
            <p className="mt-3 leading-7 text-slate-600">We would rather establish that distinction early than recommend a system your business does not need.</p>
          </div>
        </div>
      </section>

      <section className="container-main py-20 md:py-24">
        <div className="rounded-3xl bg-[#102d62] p-7 text-white sm:p-12 md:p-14">
          <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-blue-200"><ClipboardCheck size={17} /> Business assessment</div>
              <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">Your business has outgrown its current way of working.</h2>
              <p className="mt-5 max-w-2xl leading-7 text-blue-100">You do not need more disconnected tools. You need a clearer understanding of how your business operates, where the gaps exist, and which systems can help your people work more effectively.</p>
              <p className="mt-4 max-w-2xl font-semibold leading-7 text-white">Offers can start from $2,000. Let's understand your business before we define the system.</p>
            </div>
            <Link href="/6ixtem/assessment" className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 font-bold text-blue-900 transition hover:bg-blue-50 md:self-center">
              Start your business assessment <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="container-main flex flex-col gap-3 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="font-black tracking-tight text-slate-800">6ixtem.</Link>
          <span>Business operating systems built around your business.</span>
          <Link href="/6ixtem/assessment" className="font-semibold text-blue-700 hover:text-blue-900">Discuss your business <ArrowRight className="ml-1 inline" size={14} /></Link>
        </div>
      </footer>
    </main>
  );
}
