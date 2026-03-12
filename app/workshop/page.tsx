"use client";

// ── ADDITION 1: Supabase import ──
import { supabase } from "@/lib/supabase";

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import WorkshopEmailGate from "@/components/WorkshopEmailGate";

// ============================================================
// TYPES
// ============================================================
type ViewType = "home" | "workshop" | "section" | "paywall" | "results";

interface Question {
  q: string;
  options: string[];
  answer: number;
}

interface Section {
  id: number;
  free: boolean;
  title: string;
  subtitle: string;
  content: string;
  activity: string;
  questions: Question[];
}

interface SectionProgress {
  read: boolean;
  answers: Record<number, number>;
  activityDone: boolean;
  completed: boolean;
  score: number | null;
}

type ProgressMap = Record<number, SectionProgress>;

interface HomeViewProps {
  setView: (v: ViewType) => void;
  completedCount: number;
  freeCompleted: number;
}

interface PaywallViewProps {
  setView: (v: ViewType) => void;
}

interface Tier {
  name: string;
  price: string;
  desc: string;
  color: string;
  bg: string;
  cta: string;
}

// ============================================================
// WORKSHOP DATA — 90 SECTIONS
// ============================================================
const SECTIONS: Section[] = [
  // ---- FREE TIER: SECTIONS 1–9 ----
  {
    id: 1, free: true,
    title: "The Silent Frustration of Employees",
    subtitle: "Understanding the System You Were Never Told About",
    content: `[[PERSONAL_OPENING]]

Most employees are not failing. They are surviving inside a system that was never designed for ownership.

Every month follows the same rhythm. You wake up early. You commute. You give your best hours to work. You get paid. And before the next paycheck arrives, most of it is already gone — rent, transport, food, school fees, electricity, data, insurance.

What remains is often not peace — it's pressure. Not because you are reckless. Not because you lack discipline. But because the cost of living keeps rising while income crawls forward.

Yet this struggle is rarely spoken about openly. Employees are expected to be grateful. To "manage better." To "budget smarter." To "be patient." So many suffer in silence, smiling at work while privately wondering: "Is this really it?"

**Hard Work Is No Longer the Problem.** Most employees were raised to believe one simple formula: Work hard → get educated → get a job → live well. For decades, this formula worked. But today, something has shifted. Hard work still exists — but rewards have thinned. Education still matters — but it no longer guarantees freedom. Jobs still provide income — but rarely ownership.

The issue is not effort. The issue is structure. Employees are trapped in a time-for-money model where income has a ceiling, but expenses do not. Inflation has no loyalty. Emergencies do not wait for promotions.

**You Are Not Broken — You Are Mispositioned.** If you are an employee feeling uneasy, hear this clearly: You are not lazy. You are not incapable. You are not late. You have simply been positioned only as a worker and a consumer — not as a participant in value creation.

[[MIRROR_MOMENT]]`,
    activity: "Write down your three biggest monthly expenses and next to each one, ask: 'Could this ever flow value back to me?' Don't answer yet — just sit with the question.",
    questions: [
      { q: "What is the PRIMARY reason most employees struggle financially?", options: ["They spend irresponsibly", "They lack education", "They are trapped in a time-for-money structure", "They don't work hard enough"], answer: 2 },
      { q: "The formula 'Work hard → get educated → get a job → live well' is described as:", options: ["Still perfectly effective today", "A formula that once worked but has shifted", "A myth that never worked", "The foundation of wealth building"], answer: 1 },
      { q: "Complete: 'You are not broken — you are ______.'", options: ["Unmotivated", "Mispositioned", "Uneducated", "Unlucky"], answer: 1 },
      { q: "What creates a 'quiet fear' in most employees?", options: ["Fear of their boss", "Fear of missing one paycheck", "Fear of competition", "Fear of technology"], answer: 1 },
      { q: "Debt in the employee's life becomes:", options: ["A strategic investment tool", "A survival tool instead of a strategic instrument", "Something to be avoided entirely", "A sign of poor character"], answer: 1 },
    ],
  },
  {
    id: 2, free: true,
    title: "Consumption Without Leverage",
    subtitle: "Why You Power the Economy but Don't Benefit From It",
    content: `Here is a truth few people explain clearly: Employees are powerful consumers — but powerless owners.

Every month, employees spend money. They support brands. They sustain companies. They keep entire industries alive. But most never benefit from the value they help create. Consumption flows outward — never back.

Employees are loyal customers to supermarkets, telecom companies, transport systems, financial institutions, and household brands. Yet none of these reward them for their loyalty beyond discounts and points.

**The problem is not consumption itself. The problem is consumption without leverage.**

No ownership. No participation. No upside. This is where frustration quietly turns into resignation. People stop dreaming big — not because they lack ambition, but because ambition feels dangerous when responsibility is heavy.

**The Myth of "Just Quit and Start a Business."** In recent years, a new pressure has emerged. Social media glorifies quitting jobs. "Escape the 9–5." "Be your own boss." "Hustle harder."

But for most employees, this advice feels reckless. They have families to support. Bills to pay. Reputations to protect. Limited time and energy. Quitting without preparation is not courageous — it is risky.

That's why many employees feel stuck between two unsatisfying options: stay employed and frustrated, or quit and gamble on uncertainty. This false choice creates paralysis.

**What is rarely offered is a third option** — one that respects reality while expanding possibility. A way that does not require quitting your job. Does not demand a business idea upfront. Does not pressure you to take reckless risks. Instead, it begins with clarity, community, and intentional consumption.

[[MONTH_CHECK]]`,
    activity: "List 5 brands or companies you spend money with every month. Next to each one, write: 'Do I participate in their profits in any way?' This exercise plants the seed of strategic awareness.",
    questions: [
      { q: "Employees are described as 'powerful ______ but powerless owners':", options: ["Workers", "Consumers", "Investors", "Entrepreneurs"], answer: 1 },
      { q: "What is the core problem with the way most employees consume?", options: ["They buy too many luxury items", "Consumption without leverage — no ownership or upside", "They don't save enough", "They trust brands too much"], answer: 1 },
      { q: "The 'third option' being proposed is:", options: ["Start a business immediately", "Quit your job and freelance", "A path that respects reality while expanding possibility", "Invest in the stock market"], answer: 2 },
      { q: "Why does social media advice to 'quit' feel reckless to most employees?", options: ["They are lazy", "They have families, bills, and limited time", "Entrepreneurship is too difficult", "It always leads to failure"], answer: 1 },
      { q: "Ambition feels dangerous to employees because:", options: ["Their employers discourage it", "Responsibility is heavy and the system doesn't support ownership", "They lack intelligence", "Dreams are impractical"], answer: 1 },
    ],
  },
  {
    id: 3, free: true,
    title: "The Three Identities in the Marketplace",
    subtitle: "Discovering the Identity You Were Never Taught",
    content: `Most people believe there are only two financial identities available: Consumers, who earn and spend; and Entrepreneurs, who take risks and build businesses.

If you are an employee, this creates an invisible wall. On one side is safety without freedom. On the other is freedom without certainty.

**The Three Marketplace Identities:**

**1. The Consumer** — Earns income. Spends on necessities and lifestyle. Has no ownership in the value created. Depends on salary increases for growth. Consumption is the end of the journey.

**2. The Entrepreneur** — Creates products or services. Takes significant financial and emotional risk. Operates under uncertainty. Builds systems, teams, and structures. Ownership is the starting point — but the pressure is high.

**3. The Entrepreneurial Consumer (The Missing Identity)** — Earns income (often as an employee). Consumes intentionally and strategically. Buys where they are allowed to participate in value creation. Builds ownership gradually, without rushing to quit employment. They don't resign to run away from work — they graduate to ownership.

Consumption becomes a tool, not a weakness. Household expenses are turned into Income Generating Assets.

**Entrepreneurial consumers do not rush to "start businesses."** They start by asking better questions: What do I already spend money on every month? Who else around me spends on the same things? Is there a way to redirect this flow so value comes back to me?

This is not about inventing something new. It is about repositioning what already exists.

[[IDENTITY_SELECTOR]]`,
    activity: "Identify which of the three identities describes you TODAY. Be honest. Write it down. Then write which identity you want to grow INTO over the next 12 months. The gap between those two is your workshop journey.",
    questions: [
      { q: "What is the 'missing identity' this section introduces?", options: ["The Investor", "The Freelancer", "The Entrepreneurial Consumer", "The Side Hustler"], answer: 2 },
      { q: "How does the Entrepreneurial Consumer differ from a regular Consumer?", options: ["They earn more salary", "They consume intentionally and participate in value creation", "They own multiple businesses", "They never spend on necessities"], answer: 1 },
      { q: "Complete: 'Household expenses are turned into ______'", options: ["Savings accounts", "Income Generating Assets", "Business capital", "Investment funds"], answer: 1 },
      { q: "The Entrepreneurial Consumer graduates to ownership by:", options: ["Immediately quitting their job", "Taking massive financial risks", "Building ownership gradually without disrupting employment", "Starting multiple businesses at once"], answer: 2 },
      { q: "Entrepreneurial consumption is about:", options: ["Inventing new products", "Repositioning what already exists", "Copying successful businesses", "Avoiding all consumption"], answer: 1 },
    ],
  },
  {
    id: 4, free: true,
    title: "Why Employees Already Have Assets",
    subtitle: "Recognising the Capital You Have Been Ignoring",
    content: `Employees already have assets — even if they've never seen them that way.

They have: Monthly Salary (predictable cash flow), Stable routines (discipline and consistency), Predictable consumption (known spending patterns), Existing networks (colleagues, family, community), Daily exposure to systems and operations.

These are not small things. In community-based business models, these assets compound.

**Identity Comes Before Opportunity.** Most people fail not because they choose the wrong opportunity — but because they never shift identity. They join programs as consumers. They evaluate everything by short-term comfort. They quit when results are slow.

The Entrepreneurial Consumer thinks differently. They ask: What am I becoming through this process? What skills am I developing? How does this position me long-term?

This identity shift is what makes everything else work. Before income. Before business models. Before systems.

**Entrepreneurial consumption works because it:** Respects limited time. Reduces financial risk. Allows gradual confidence-building. Rewards consistency, not hype. Instead of forcing employees to become full-time entrepreneurs overnight, this model allows them to grow into ownership.

No quitting. No gambling. No pretending. Just structured progress.

Once you see yourself differently, you begin to notice opportunities that were always around you — quietly waiting for clarity. You do not need a business idea to move forward. You need a new way of seeing yourself in the economy.

[[ASSET_AUDIT]]`,
    activity: "Make a list under these headings: MY SKILLS, MY NETWORKS, MY ROUTINES, MY KNOWLEDGE. Fill in at least 3 items under each. You are mapping your existing capital.",
    questions: [
      { q: "Which is listed as an existing asset most employees overlook?", options: ["Luxury investments", "Predictable consumption patterns and existing networks", "Business ownership experience", "Advanced technical skills"], answer: 1 },
      { q: "Why do most people fail to capitalise on opportunities?", options: ["Lack of money", "Never shifting their identity", "Poor education", "Bad timing"], answer: 1 },
      { q: "The Entrepreneurial Consumer model rewards:", options: ["Hype and bold moves", "Consistency, not hype", "Fast risk-taking", "Quitting employment quickly"], answer: 1 },
      { q: "What must come BEFORE income, business models, and systems?", options: ["A business plan", "A large network", "An identity shift", "Capital investment"], answer: 2 },
      { q: "Your current life contains:", options: ["Too many obstacles", "The raw material for something more", "Nothing of entrepreneurial value", "Only consumer habits"], answer: 1 },
    ],
  },
  {
    id: 5, free: true,
    title: "The Z2B TABLE Philosophy — Community Before Commerce",
    subtitle: "Why You Need a Table Before You Need a Business",
    content: `Wealth has always been built at tables. Long before wealth was measured in numbers, it was measured in access. Access to conversations. Access to relationships. Access to shared resources.

Tables are where plans are discussed, trust is built, partnerships are formed, and futures are negotiated. No one builds anything meaningful alone.

**Why Community Must Come Before Commerce.** Most opportunities today start with a product: "Sell this." "Promote that." "Recruit people." Community is treated as a by-product. Z2B reverses this order.

At the Z2B TABLE: People come before products. Education comes before execution. Trust comes before transactions.

Commerce is powerful — but without community, it becomes extractive. Community creates belonging before buying, understanding before selling, alignment before scaling.

**T.E.E.E — The Operating Philosophy:**
Transform — how members think about money, work, and ownership.
Educate — how members learn systems, skills, and strategy.
Empower — how members apply knowledge confidently.
Enrich — how value flows back to individuals, families, and communities.

This is not a slogan. It is a sequence. Transformation without education creates confusion. Education without empowerment creates frustration. Empowerment without enrichment creates burnout.

**Why the Table Creates Leverage.** A single consumer has no negotiating power. But a community of aligned Entrepreneurial Consumers creates collective leverage — a distribution channel, a marketing ecosystem, a negotiation partner.

[[COMMUNITY_PREVIEW]]`,
    activity: "Think of one person in your life who is quietly frustrated with their financial situation but hasn't found a way forward. Don't contact them yet — just identify them. You may be about to invite them to your table.",
    questions: [
      { q: "In the Z2B philosophy, what comes BEFORE commerce?", options: ["Products", "Sales systems", "Community", "Marketing"], answer: 2 },
      { q: "What does T.E.E.E stand for?", options: ["Train, Execute, Earn, Expand", "Transform, Educate, Empower, Enrich", "Think, Engage, Earn, Establish", "Transform, Enable, Execute, Earn"], answer: 1 },
      { q: "Education without empowerment creates:", options: ["Burnout", "Confusion", "Frustration", "Growth"], answer: 2 },
      { q: "A community of aligned Entrepreneurial Consumers creates:", options: ["Individual wealth only", "Collective leverage", "Competition among members", "Dependency on leaders"], answer: 1 },
      { q: "The Z2B TABLE is a place you:", options: ["Visit once to get information", "Grow into over time", "Join only when you have money", "Use only for selling"], answer: 1 },
    ],
  },
  {
    id: 6, free: true,
    title: "Vision Before Execution — Milestone 1",
    subtitle: "Why Clarity Is the Most Valuable Asset You Can Build",
    content: `Most people approach income the same way they approach emergencies — reactively. They ask: What business can I start quickly? What opportunity pays fast? What can fix my situation now?

This urgency is understandable. But it is also why many fail repeatedly. Execution without clarity leads to burnout, confusion, jumping from one opportunity to another, and blaming systems instead of positioning.

**Z2B begins differently. Before tools. Before companies. Before income streams. We begin with vision.**

Not vague dreams — structured vision.

**The Three Levels of Vision:**

**Immediate Term — Stabilization:** Addresses pressure. Daily survival, cost of living, reducing financial stress. Extra income to cover essentials. Avoiding cash loans. Breathing room at month-end. This is not greed — it is dignity.

**Medium Term — Freedom:** Once pressure is reduced, perspective returns. Financial flexibility, time ownership, family goals. Housing, reliable transport, education funding, savings. Income stops being reactive — it becomes intentional.

**Long Term — Legacy:** Shifts thinking beyond self. Assets, ownership, generational impact. Properties, businesses, land, structures that outlive effort. Legacy thinking changes behavior today — even if results come later.

**The Five Foundational Questions:** Why. What. When. How. Where. These questions, asked correctly across all three time horizons, change everything. Most systems fail because they treat everyone the same regardless of urgency or stage. Z2B does not.

[[VISION_GATE]]`,
    activity: "Write one goal under each of the three time horizons: Immediate Term (next 90 days), Medium Term (1–3 years), Long Term (5–10 years). Don't overthink it. Your first answer is often your truest answer.",
    questions: [
      { q: "What does Z2B prioritise BEFORE tools, companies, and income streams?", options: ["Networking", "Vision", "Capital", "Skills training"], answer: 1 },
      { q: "Immediate Term vision focuses on:", options: ["Legacy and generational wealth", "Stabilization and reducing financial stress", "Building a business empire", "Retiring early"], answer: 1 },
      { q: "Medium Term vision is characterised by:", options: ["Survival and emergency management", "Financial flexibility and time ownership", "Platform ownership", "Building a team"], answer: 1 },
      { q: "Legacy thinking is important because:", options: ["It makes you feel better temporarily", "It changes behavior today even if results come later", "It replaces the need for immediate action", "It only applies to wealthy people"], answer: 1 },
      { q: "Complete: 'Execution without clarity leads to ______'", options: ["Slow growth", "Burnout, confusion and jumping between opportunities", "Steady progress", "Financial discipline"], answer: 1 },
    ],
  },
  {
    id: 7, free: true,
    title: "From SWOT to Opportunity",
    subtitle: "Turning Your Reality Into Your Strategy",
    content: `Most people believe opportunities come from ideas. In reality, opportunities come from awareness. Ideas feel heavy because they are imagined from pressure. Awareness feels light because it reveals what already exists.

That is why Z2B uses SWOT analysis — not as a business-school exercise, but as a mirror. A mirror does not judge. It simply shows you where you stand. Once you see clearly, direction becomes obvious.

**Strengths You've Been Overlooking.** Many employees underestimate their strengths because they see them as "normal." But normal to you can be valuable to others. Strengths include: Consistency, Reliability, Communication skills, Exposure to systems, Experience in specific environments. What matters is not how impressive a strength looks — but how usable it is.

**Weaknesses as Signals, Not Disqualifiers.** Weaknesses are not verdicts — they are signals. They point to: skills to learn, systems to leverage, people to partner with. In a community, no one needs to be complete. One person's weakness becomes another's contribution.

**Opportunities Hidden in Plain Sight.** Opportunities hide inside repeated expenses, shared frustrations, unmet needs, and underutilized networks. When SWOT is applied across all three time horizons, patterns emerge.

**Threats as Teachers.** Threats reveal what must be protected, what must be diversified, and why reliance on a single income is risky. Z2B does not promise immunity from challenges — it provides options. And options reduce fear.

[[SWOT_BUILDER]]`,
    activity: "Draw a simple 2x2 grid on paper. Label the four boxes: STRENGTHS, WEAKNESSES, OPPORTUNITIES, THREATS. Fill in at least 3 items in each box as they relate to YOUR current financial and life situation.",
    questions: [
      { q: "In Z2B, SWOT analysis is used as:", options: ["A corporate planning tool only", "A personal mirror to reveal where you stand", "A way to compare yourself to competitors", "A recruitment screening process"], answer: 1 },
      { q: "Weaknesses should be treated as:", options: ["Reasons to quit", "Signals pointing to skills to learn and people to partner with", "Permanent limitations", "Secrets to hide from others"], answer: 1 },
      { q: "Where do opportunities often hide?", options: ["In expensive business courses", "In repeated expenses, shared frustrations, and underutilised networks", "Only in big cities", "In government programs"], answer: 1 },
      { q: "Threats in your SWOT are valuable because they:", options: ["Should be ignored", "Teach you what must be protected and diversified", "Prove the system is unfair", "Show you are not ready"], answer: 1 },
      { q: "Opportunities come primarily from:", options: ["New ideas", "Large investments", "Awareness of what already exists", "Luck and timing"], answer: 2 },
    ],
  },
  {
    id: 8, free: true,
    title: "Network Marketing — A Vehicle, Not the Destination",
    subtitle: "Understanding the Tool That Can Train You for Ownership",
    content: `Few economic vehicles have been more misunderstood than Network Marketing. Before many people even investigate it, they have already accepted negative conclusions: "It's just selling to friends." "It's a pyramid scheme." "It doesn't work."

These statements are often spoken by people who have never studied the model, never built within it, and never understood its structural genius.

**The truth is far simpler — and more powerful: Network Marketing is a vehicle, not a destination.** A vehicle transports people from one location to another. It does not define their identity. It accelerates movement.

Network Marketing transports employees from: Pure consumption → Strategic consumption. Income dependence → Income diversification. Isolation → Community collaboration. Employment only → Ownership exposure.

**Why Employees Thrive in Network Marketing.** The workplace has already trained them in: Communication, Accountability, Punctuality, Team collaboration, Target execution. These are not small skills — they are commercial infrastructure. You are not starting from zero. You are repurposing existing capacity.

**Household Products as Training Wheels.** Many network marketing companies distribute household necessities. Demand already exists. You are not creating consumption — you are redirecting it. This allows builders to learn in a low-risk environment with familiar products.

**Network Marketing Is Not Your Identity.** You are an Entrepreneurial Consumer first. Network Marketing is one of your tools — not your definition. Identity traps create burnout. Use it. Learn from it. Leverage it. But never mistake the vehicle for the vision.

[[OBJECTION_DISSOLVER]]`,
    activity: "Research one legitimate network marketing company that distributes products you already buy monthly. Look at their compensation plan for 30 minutes. You don't have to join — just understand the structure. Note what surprised you.",
    questions: [
      { q: "Network Marketing is described as:", options: ["The final goal for entrepreneurs", "A guaranteed path to wealth", "A vehicle that accelerates movement toward ownership", "A replacement for employment"], answer: 2 },
      { q: "Why do employees already have an advantage in Network Marketing?", options: ["They have lots of spare time", "The workplace has already trained them in commercial skills", "They have large savings to invest", "They know many wealthy people"], answer: 1 },
      { q: "Household products in network marketing are 'Training Wheels' because:", options: ["They are easy to sell to strangers", "They allow learning in a low-risk environment with familiar products", "They generate massive profits quickly", "They replace the need for an office"], answer: 1 },
      { q: "What happens when a Builder ties their identity to one company?", options: ["They achieve great success", "Disappointment becomes identity collapse", "They build sustainable income", "Their team grows faster"], answer: 1 },
      { q: "Your true positioning as a Z2B Builder is:", options: ["A Network Marketer", "A product seller", "An Entrepreneurial Consumer first", "A full-time entrepreneur"], answer: 2 },
    ],
  },
  {
    id: 9, free: true,
    title: "Building Your Circle of Twelve",
    subtitle: "Human Capital Is Heaven's First Currency",
    content: `Before God gives a man land, He gives him people. Before He releases territory, He releases relationships. Before He entrusts wealth, He tests stewardship through human connection.

You are not surrounded by employees and consumers by accident. You are surrounded by potential partners in dominion.

**The Z2B TABLE BANQUET reframes your environment.** You stop seeing people as co-workers only. You begin to see them as co-builders, co-learners, co-investors, co-visionaries.

**The Doctrine of the Table.** Tables are places of negotiation, alignment, covenant, strategy, and wealth architecture. "You prepare a table before me in the presence of my enemies." (Psalm 23:5) — God blesses you with provision AND positioning.

**Envision Partnerships Across Three Layers:**

**1. Short-Term Destiny Helpers:** Ready to walk immediately with you. They help you implement, share learning, test ideas, and break fear barriers. They are your ignition partners.

**2. Medium-Term Strategic Builders:** Carry complementary capabilities. Launch structured collaborations, combine skills, execute joint initiatives.

**3. Long-Term Covenant Partners:** Destiny alliances. They may grow with you into business partnerships, investment alliances, property collaborations, legacy ventures.

**The Circle of Twelve.** Identify 12 Builders across these three layers. Why Twelve? Because Twelve represents governmental structure — 12 Tribes of Israel, 12 Disciples, 12 Foundations of New Jerusalem. Twelve is a number of organized expansion.

**The Doctrine of Capital:** Financial Capital is money. Human Capital is skills, wisdom, and networks. Strategic Capital is alignment, positioning, and influence. Your Circle contains all three in seed form.

[[CIRCLE_OF_TWELVE]]`,
    activity: "Write down 12 names — people in your life across the three layers: 4 short-term helpers, 4 medium-term builders, 4 long-term covenant partners. Don't filter — just write names. You don't need their permission yet. You just need clarity.",
    questions: [
      { q: "In Kingdom economics, what does God give BEFORE land and territory?", options: ["Money and resources", "Business ideas", "People and relationships", "A vision statement"], answer: 2 },
      { q: "Short-Term Destiny Helpers are described as your:", options: ["Long-term investors", "Ignition partners", "Business competitors", "Mentors only"], answer: 1 },
      { q: "Why is 'Twelve' significant as the number for your Builder Circle?", options: ["It's a popular management number", "It represents governmental structure and organized expansion in scripture", "It fits on one page", "It's the maximum team size"], answer: 1 },
      { q: "Which is considered the LOWEST form of capital?", options: ["Human Capital", "Strategic Capital", "Financial Capital", "Social Capital"], answer: 2 },
      { q: "Long-Term Covenant Partners walk with you in agreement of:", options: ["Only financial returns", "Vision, values, and stewardship", "Profit-sharing formulas", "Marketing strategies"], answer: 1 },
    ],
  },

  // ---- PAID TIER: SECTIONS 10–90 ----
  ...(Array.from({ length: 81 }, (_, i): Section => {
    const id = i + 10;
    const topics: [string, string][] = [
      ["Innovators and Early Adopters", "Claiming Your Purple and Gold Mantle"],
      ["The Power of Ethical Collaboration", "Kingdom Economics Runs on Multiplication, Not Limitation"],
      ["AI Technology — The Digital Oil of This Generation", "How Artificial Intelligence Levels the Playing Field"],
      ["Converting Your Smartphone Into an Income Engine", "The Tool in Your Pocket Is Already a Business Platform"],
      ["Copywriting — Turning Words Into Currency", "How the Right Words Open Doors and Close Deals"],
      ["The Platform Funnel — Your Economic Architecture", "Building a System That Works While You Sleep"],
      ["Platform Ownership — From Tenant to Landlord", "Never Build Your Empire on Borrowed Land"],
      ["Digital Assets That Form Legacy Infrastructure", "Building Systems That Outlive Your Effort"],
      ["The Doctrine of Strategic Capital", "Positioning, Influence, and Access as Economic Assets"],
      ["Sourcing Quality Business Partners", "Discernment Over Desperation in Partnership Building"],
      ["Your Circle as an Economic Incubator", "Before Corporations Form Publicly, They Form Privately"],
      ["Financial Literacy for the Entrepreneurial Consumer", "Understanding Money as a Language You Must Learn"],
      ["The Employee Mindset vs The Owner Mindset", "Rewiring How You Think About Time, Money and Work"],
      ["Creating Your Personal Income Blueprint", "Mapping Multiple Income Streams Before You Need Them"],
      ["The Psychology of Money", "Why Your Beliefs About Money Determine Your Financial Ceiling"],
      ["Understanding Compensation Plans", "How to Evaluate and Choose the Right Network Marketing Vehicle"],
      ["Retail Profit — Your First Income Layer", "Mastering the Foundation Before Building the Structure"],
      ["Team Building Basics", "How to Invite Without Being Pushy or Desperate"],
      ["The Art of the Invitation", "Scripts and Frameworks for Expanding Your Circle"],
      ["Handling Objections With Confidence", "Turning 'No' Into a Navigation Tool"],
      ["Leadership vs Management", "Why the Entrepreneurial Consumer Must Develop Leaders, Not Dependents"],
      ["Building Duplication Systems", "How to Create an Organisation That Grows Without You Doing Everything"],
      ["Personal Branding for Builders", "Why You Are the Brand Before the Product Is"],
      ["Content Creation for Non-Creators", "How AI Removes Every Excuse for Not Showing Up Online"],
      ["Video Marketing for Builders", "Why the Camera Is Your Most Powerful Recruitment Tool"],
      ["WhatsApp as a Business Platform", "Structuring Your Messaging App Into a Revenue Engine"],
      ["Facebook Strategy for Builders", "Organic Growth Systems That Don't Require an Advertising Budget"],
      ["TikTok and Short Video for Entrepreneurial Consumers", "How 60 Seconds Can Change a Life"],
      ["Email Marketing Fundamentals", "Building a List That Belongs to You"],
      ["The Power of Testimonials", "How Social Proof Multiplies Trust at Scale"],
      ["Goal Setting for Builders", "The Difference Between Wishes and Targets With Deadlines"],
      ["Time Management for the Employed Builder", "How to Build a Business in the Hours That Are Already Available"],
      ["Morning Routines of the Entrepreneurial Consumer", "How the First 60 Minutes Shape the Entire Day"],
      ["Financial Planning Basics", "Budgeting as a Strategic Tool, Not a Restriction"],
      ["Saving and Investment Principles", "Building Financial Buffers Before You Need Them"],
      ["Debt Strategy for Builders", "When Debt Is a Tool and When It's a Trap"],
      ["The Compound Effect in Business", "Small Consistent Actions and Their Extraordinary Long-Term Results"],
      ["Creating Your First Product or Service", "How to Monetise What You Already Know"],
      ["Pricing Your Value", "Why Undercharging Is a Strategy That Destroys Income"],
      ["Customer Service as a Growth Strategy", "How to Turn One Customer Into Ten Through Experience"],
      ["Referral Systems", "Building a Pipeline That Feeds Itself"],
      ["The Law of Reciprocity in Business", "How Generous Givers Become Wealthy Receivers"],
      ["Event Marketing for Builders", "How to Use Gatherings to Grow Your Community"],
      ["Digital Marketing Fundamentals", "Understanding Paid and Organic Traffic"],
      ["SEO Basics for Builders", "How to Be Found by People Who Are Already Looking"],
      ["Building a Basic Website", "Your Digital Headquarters on Owned Land"],
      ["E-commerce for Entrepreneurial Consumers", "How to Sell Products 24 Hours a Day"],
      ["Automating Your Business Processes", "Systems That Replace Repetitive Manual Tasks"],
      ["CRM — Customer Relationship Management", "How to Manage and Nurture Your Contacts at Scale"],
      ["The Subscription Model", "Building Recurring Revenue That Compounds Monthly"],
      ["Passive Income Principles", "What Real Passive Income Looks Like and What It Requires"],
      ["Investing for Beginners", "Understanding Assets That Work While You Sleep"],
      ["Property as a Wealth Vehicle", "How Real Estate Fits Into the Entrepreneurial Consumer's Legacy Plan"],
      ["Business Registration and Structures", "When and How to Formalise Your Enterprise"],
      ["Tax Basics for Builders", "What You Don't Know About Tax Is Costing You Money"],
      ["Banking for Business", "Separating Personal and Business Finances From Day One"],
      ["Contracts and Agreements", "Protecting Yourself in All Business Relationships"],
      ["Intellectual Property Basics", "Owning the Value You Create"],
      ["Building a Board of Advisors", "How to Access Wisdom You Don't Yet Have"],
      ["Mentorship — Finding and Keeping Mentors", "The Fastest Path to Avoiding Expensive Mistakes"],
      ["Faith and Business — The Kingdom Economic Mandate", "Why Serving People Is the Foundation of Sustainable Wealth"],
      ["Stewardship Principles", "Why How You Handle Small Things Determines Your Access to Large Things"],
      ["The Tithe Principle in Business", "How Generosity Creates Flow in Your Economic Ecosystem"],
      ["Prayer and Business Strategy", "Integrating Spiritual Disciplines Into Practical Planning"],
      ["Character Development for Leaders", "Why Who You Are Determines How Far You Go"],
      ["Resilience Training for Builders", "How to Handle Setbacks Without Losing Momentum"],
      ["Managing Failure", "Why Every Successful Builder Has a Catalogue of Failures"],
      ["The Power of Community Accountability", "Why You Need People Who Will Tell You the Truth"],
      ["Reading and Learning as Economic Habits", "How Continuous Learning Creates Compound Knowledge"],
      ["Public Speaking for Builders", "How to Communicate Your Vision to Groups"],
      ["Writing as a Business Skill", "How Written Communication Opens Economic Doors"],
      ["Negotiation Fundamentals", "How to Create Win-Win Outcomes in Every Business Interaction"],
      ["Advanced Team Leadership", "Taking Your Organisation From Momentum to Movement"],
      ["Scaling Your Network Marketing Business", "Systems for Growing Beyond Your Personal Reach"],
      ["Multiple Income Streams — Advanced Strategy", "Building a Portfolio of Income Sources That Reinforce Each Other"],
      ["The Legacy Mindset", "Shifting From Personal Success to Generational Impact"],
      ["Wealth Transfer Principles", "How to Prepare the Next Generation for What You Are Building"],
      ["Philanthropy and Kingdom Impact", "How Giving at Scale Becomes Your Greatest Business Strategy"],
      ["Building Your Brand Authority", "Becoming the Go-To Person in Your Economic Community"],
      ["Publishing and Thought Leadership", "How Writing a Book or Creating a Course Multiplies Your Influence"],
      ["The Diamond Legacy Path", "Your Roadmap to the Billionaire Table"],
    ];
    const [title, subtitle] = topics[i] ?? [`Advanced Builder Training ${id}`, `Deepening Your Economic Architecture`];
    return {
      id,
      free: false,
      title,
      subtitle,
      content: `This section deepens your journey as an Entrepreneurial Consumer. Building on everything you have learned so far, this module focuses on ${title.toLowerCase()} — a critical component of your transition from employee to economic builder.\n\nAs you progress through this level of the workshop, remember the governing doctrine: you are not building a job. You are building a legacy. Every skill, every relationship, every system you develop in this section contributes to the table you are constructing for yourself and for those who will sit at it after you.\n\nApply the T.E.E.E framework to everything you encounter here:\n- Transform how you think about this topic\n- Educate yourself deeply and practically\n- Empower yourself to act with confidence\n- Enrich those around you with what you learn\n\nLegacy is not built in one dramatic moment. It is built in the daily discipline of applying knowledge intentionally, investing in relationships consistently, and trusting the process faithfully.\n\n"Write the vision and make it plain, that he may run who reads it." — Habakkuk 2:2`,
      activity: `Apply the core principle from "${title}" to your current situation. Document your reflection and one specific action you will take within 48 hours. Remember: knowledge without execution is just inspiration without income.`,
      questions: [
        { q: "What framework should you apply to every section of this workshop?", options: ["ROI analysis", "T.E.E.E — Transform, Educate, Empower, Enrich", "SWOT analysis only", "The 80/20 rule"], answer: 1 },
        { q: "Legacy is built through:", options: ["One dramatic breakthrough moment", "Daily discipline of applying knowledge intentionally", "Having the right connections only", "Luck and timing"], answer: 1 },
        { q: "Complete: 'Write the vision and make it plain, that he may ______ who reads it.'", options: ["Understand", "Run", "Share", "Pray"], answer: 1 },
        { q: "The governing doctrine of this workshop is:", options: ["Build a better job", "Create a side hustle", "Build a legacy, not just an income", "Retire as quickly as possible"], answer: 2 },
        { q: "What does the Entrepreneurial Consumer build every day through consistent action?", options: ["A social media following", "Quick wins only", "A table for themselves and future generations", "A replacement salary"], answer: 2 },
      ],
    };
  })),
];

// ============================================================
// PROGRESS HELPERS
// ============================================================
const createInitialProgress = (): ProgressMap => {
  const p: ProgressMap = {};
  SECTIONS.forEach((s) => {
    p[s.id] = { read: false, answers: {}, activityDone: false, completed: false, score: null };
  });
  return p;
};

// ============================================================
// COLOUR TOKENS
// ============================================================
if (typeof window !== "undefined") {
  const styleId = "z2b-workshop-animations";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes wave {
        0%   { height: 6px;  opacity: 0.6; }
        100% { height: 28px; opacity: 1;   }
      }
      @keyframes bounce {
        0%,100% { transform: translateY(0);   }
        50%      { transform: translateY(-12px); }
      }
    `;
    document.head.appendChild(style);
  }
}

const purple       = "#6B21A8";
const purpleLight  = "#9333EA";
const purplePale   = "#F3E8FF";
const purpleMid    = "#EDE9FE";
const purpleBorder = "#C4B5FD";
const gold         = "#D97706";
const goldLight    = "#FEF3C7";
const bg           = "#FAFAFA";
const white        = "#FFFFFF";
const text         = "#1E1B2E";
const textMuted    = "#6B7280";
const textLight    = "#9CA3AF";
const green        = "#059669";
const greenPale    = "#D1FAE5";
const red          = "#DC2626";
const redPale      = "#FEE2E2";
const bluePale     = "#DBEAFE";
const blue         = "#2563EB";

// ============================================================
// STYLES
// ============================================================
const S: Record<string, CSSProperties> = {
  homePage:      { minHeight: "100vh", background: `linear-gradient(135deg, ${purplePale} 0%, #ffffff 50%, ${purpleMid} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "Georgia, serif", position: "relative", overflow: "hidden" },
  homeGlow:      { position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: "700px", height: "500px", borderRadius: "50%", background: `radial-gradient(ellipse, rgba(147,51,234,0.1) 0%, transparent 65%)`, pointerEvents: "none" },
  homeContent:   { maxWidth: "640px", width: "100%", textAlign: "center", position: "relative", zIndex: 1 },
  homeLogoRow:   { marginBottom: "20px" },
  homeLogo:      { fontSize: "56px", fontWeight: "bold", color: purple, letterSpacing: "8px" },
  homeLogoSub:   { fontSize: "11px", letterSpacing: "6px", color: purpleLight, marginTop: "4px", textTransform: "uppercase" },
  homeTitle:     { fontSize: "26px", color: text, margin: "0 0 12px", lineHeight: 1.35, fontWeight: "bold" },
  homeTagline:   { fontSize: "15px", color: textMuted, fontStyle: "italic", margin: "0 0 8px", lineHeight: 1.7 },
  homeBy:        { fontSize: "12px", color: purpleLight, margin: "0 0 32px", fontWeight: "bold" },
  homeStats:     { display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "28px", background: white, borderRadius: "16px", padding: "20px", border: `2px solid ${purpleBorder}`, boxShadow: "0 4px 20px rgba(107,33,168,0.1)" },
  homeStat:      { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  homeStatNum:   { fontSize: "30px", fontWeight: "bold", color: purple },
  homeStatLabel: { fontSize: "11px", color: textMuted, letterSpacing: "1px", textTransform: "uppercase" },
  homeStatDiv:   { width: "1px", height: "40px", background: purpleBorder },
  homeBtnRow:    { display: "flex", gap: "12px", justifyContent: "center", marginBottom: "24px", flexWrap: "wrap" },
  homeTeee:      { display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" },
  teeePill:      { background: white, color: purple, border: `1.5px solid ${purpleBorder}`, padding: "7px 16px", borderRadius: "20px", fontSize: "12px", letterSpacing: "1px", fontWeight: "bold" },
  homeFooter:    { fontSize: "11px", color: textLight, marginTop: "8px" },
  page: { minHeight: "100vh", background: bg, color: text, fontFamily: "Georgia, serif", paddingBottom: "80px" },
  workshopHeader: { background: white, borderBottom: `2px solid ${purpleBorder}`, padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 12px rgba(107,33,168,0.07)" },
  workshopTitle:  { fontSize: "20px", color: purple, margin: "8px 0 4px", textAlign: "center", fontWeight: "bold" },
  workshopSub:    { fontSize: "12px", color: textMuted, textAlign: "center", margin: "0 0 12px" },
  progressBar:    { height: "6px", background: purplePale, borderRadius: "3px", overflow: "hidden", margin: "0 0 6px", border: `1px solid ${purpleBorder}` },
  progressFill:   { height: "100%", background: `linear-gradient(90deg, ${purple}, ${purpleLight})`, transition: "width 0.5s", borderRadius: "3px" },
  progressText:   { fontSize: "11px", color: purpleLight, textAlign: "center", fontWeight: "bold" },
  sectionGrid:    { padding: "20px", display: "flex", flexDirection: "column", gap: "10px", maxWidth: "800px", margin: "0 auto" },
  sectionCard:    { display: "flex", alignItems: "center", gap: "16px", background: white, border: `1.5px solid ${purpleBorder}`, borderRadius: "12px", padding: "14px 16px", cursor: "pointer", transition: "all 0.2s" },
  cardDone:       { borderColor: green, background: greenPale },
  cardLocked:     { opacity: 0.45, cursor: "default", background: "#f9f9f9" },
  cardNext:       { borderColor: purpleLight, background: purplePale },
  cardNum:        { width: "38px", height: "38px", borderRadius: "50%", background: purplePale, border: `2px solid ${purpleBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: purple, fontWeight: "bold", flexShrink: 0 },
  cardInfo:       { flex: 1 },
  cardTitle:      { fontSize: "14px", color: text, fontWeight: "bold", marginBottom: "2px" },
  cardSub:        { fontSize: "11px", color: textMuted },
  freeBadge:      { display: "inline-block", background: greenPale, color: green, border: `1px solid ${green}88`, borderRadius: "4px", padding: "2px 8px", fontSize: "10px", marginTop: "4px", marginRight: "6px", fontWeight: "bold" },
  doneBadge:      { display: "inline-block", background: greenPale, color: green, borderRadius: "4px", padding: "2px 8px", fontSize: "10px", marginTop: "4px", fontWeight: "bold" },
  sectionTopBar:  { display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", background: white, borderBottom: `2px solid ${purpleBorder}`, position: "sticky", top: 0, zIndex: 10 },
  sectionBadge:   { fontSize: "12px", color: purpleLight, marginLeft: "auto", fontWeight: "bold", background: purplePale, padding: "4px 10px", borderRadius: "20px", border: `1px solid ${purpleBorder}` },
  sectionHero:    { padding: "32px 20px 20px", textAlign: "center", maxWidth: "800px", margin: "0 auto", background: `linear-gradient(180deg, ${purplePale} 0%, ${bg} 100%)` },
  sectionNum:     { fontSize: "11px", letterSpacing: "3px", color: purpleLight, textTransform: "uppercase", marginBottom: "10px", fontWeight: "bold" },
  sectionTitle:   { fontSize: "24px", color: purple, margin: "0 0 10px", lineHeight: 1.3, fontWeight: "bold" },
  sectionSubtitle:{ fontSize: "14px", color: textMuted, fontStyle: "italic" },
  contentCard:    { background: white, border: `1.5px solid ${purpleBorder}`, borderRadius: "14px", margin: "0 20px 16px", maxWidth: "760px", marginLeft: "auto", marginRight: "auto", maxHeight: "60vh", overflowY: "auto", padding: "28px", position: "relative" },
  para:           { color: text, lineHeight: 1.95, marginBottom: "16px", fontSize: "15px" },
  sectionH3:      { color: purple, fontSize: "16px", margin: "22px 0 8px", fontWeight: "bold" },
  scrollHint:     { textAlign: "center", color: purpleLight, fontSize: "12px", padding: "14px 0 0", fontStyle: "italic", fontWeight: "bold" },
  activityCard:   { background: goldLight, border: "1.5px solid #FCD34D", borderRadius: "14px", margin: "0 20px 16px", maxWidth: "760px", marginLeft: "auto", marginRight: "auto", padding: "24px" },
  activityHeader: { fontSize: "14px", color: gold, fontWeight: "bold", marginBottom: "12px", letterSpacing: "1px", textTransform: "uppercase" },
  activityText:   { color: "#78350F", lineHeight: 1.8, fontSize: "14px", marginBottom: "16px", fontStyle: "italic" },
  checkLabel:     { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: text, fontSize: "14px", fontWeight: "bold" },
  checkbox:       { width: "18px", height: "18px", accentColor: green, cursor: "pointer" },
  quizCard:       { background: white, border: `1.5px solid ${purpleBorder}`, borderRadius: "14px", margin: "0 20px 16px", maxWidth: "760px", marginLeft: "auto", marginRight: "auto", padding: "28px" },
  quizHeader:     { fontSize: "14px", color: purple, fontWeight: "bold", marginBottom: "8px", letterSpacing: "1px", textTransform: "uppercase" },
  quizSub:        { fontSize: "12px", color: textMuted, marginBottom: "20px" },
  question:       { marginBottom: "24px" },
  qText:          { color: text, fontSize: "14px", marginBottom: "10px", lineHeight: 1.6, fontWeight: "bold" },
  optionBtn:      { display: "flex", alignItems: "center", gap: "10px", width: "100%", background: purplePale, border: `1.5px solid ${purpleBorder}`, color: text, padding: "11px 16px", borderRadius: "10px", cursor: "pointer", marginBottom: "8px", textAlign: "left", fontSize: "13px" },
  optionSelected: { background: bluePale, borderColor: blue, color: blue },
  optionCorrect:  { background: greenPale, borderColor: green, color: green },
  optionWrong:    { background: redPale, borderColor: red, color: red },
  optionLetter:   { width: "24px", height: "24px", borderRadius: "50%", background: purpleBorder, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", flexShrink: 0, color: purple },
  scoreBox:       { marginTop: "20px", textAlign: "center" },
  scoreResult:    { color: text, fontSize: "16px", marginBottom: "16px", fontWeight: "bold" },
  hint:           { color: gold, fontSize: "12px", marginTop: "8px", fontWeight: "bold" },
  resultCard:     { maxWidth: "480px", margin: "60px auto", background: white, border: `2px solid ${purpleBorder}`, borderRadius: "20px", padding: "40px", textAlign: "center", boxShadow: "0 8px 40px rgba(107,33,168,0.12)" },
  goldStar:       { fontSize: "52px", marginBottom: "16px" },
  resultTitle:    { color: purple, fontSize: "24px", margin: "0 0 8px", fontWeight: "bold" },
  resultSub:      { color: textMuted, fontSize: "14px", margin: "0 0 24px" },
  scoreCircle:    { width: "84px", height: "84px", borderRadius: "50%", border: `4px solid ${purple}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: "bold", color: purple, margin: "0 auto 12px", background: purplePale },
  scoreLabel:     { color: text, fontSize: "14px", margin: "0 0 24px" },
  resultBtnRow:   { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
  paywallPage:    { minHeight: "100vh", background: `linear-gradient(135deg, ${purplePale} 0%, ${white} 60%, ${purpleMid} 100%)`, padding: "20px", fontFamily: "Georgia, serif", color: text },
  paywallInner:   { maxWidth: "820px", margin: "0 auto", paddingTop: "20px" },
  paywallTitle:   { fontSize: "26px", color: purple, textAlign: "center", margin: "20px 0 12px", fontWeight: "bold" },
  paywallSub:     { color: textMuted, textAlign: "center", maxWidth: "520px", margin: "0 auto 32px", lineHeight: 1.75, fontSize: "14px" },
  tierGrid:       { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: "12px", marginBottom: "24px" },
  tierCard:       { background: white, border: "2px solid", borderRadius: "14px", padding: "22px 14px", textAlign: "center" },
  tierName:       { fontSize: "14px", fontWeight: "bold", letterSpacing: "2px", marginBottom: "8px" },
  tierPrice:      { fontSize: "20px", color: text, fontWeight: "bold", margin: "0 0 6px" },
  tierDesc:       { fontSize: "11px", color: textMuted, margin: "0 0 16px", lineHeight: 1.5 },
  tierBtn:        { display: "block", padding: "11px", borderRadius: "8px", color: white, fontWeight: "bold", fontSize: "12px", textDecoration: "none", cursor: "pointer" },
  paywallNote:    { textAlign: "center", color: textMuted, fontSize: "13px" },
  goldLink:       { color: purple, fontWeight: "bold", textDecoration: "none" },
  btnGold:    { background: `linear-gradient(135deg, ${purple}, ${purpleLight})`, color: white, border: "none", padding: "14px 28px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", fontFamily: "Georgia, serif" },
  btnOutline: { background: white, color: purple, border: `2px solid ${purple}`, padding: "12px 24px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", fontFamily: "Georgia, serif" },
  backBtn:    { background: white, border: `1.5px solid ${purpleBorder}`, color: purple, padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "Georgia, serif", fontWeight: "bold" },
};

// ============================================================
// CELEBRATION CAPTIONS
// ============================================================
const CAPTIONS = (sectionId: number, sectionTitle: string, score: number) => [
  `🏆 DAY ${sectionId} DONE! I just completed Session ${sectionId} of 90 in the Z2B Entrepreneurial Consumer Workshop — scoring ${score}/5 on "${sectionTitle}"!\n\nI'm learning how to turn my monthly expenses into income-generating assets — WITHOUT quitting my job.\n\n🔥 Do you know that your household spending could be building your legacy?\n\n👇 Start YOUR free 9-day workshop right now:\napp.z2blegacybuilders.co.za/workshop\n\n#Z2BTable #EntrepreneurialConsumer #Legacy #Zero2Billionaires #BuildYourTable`,
  `💜 I just finished Day ${sectionId} of my 90-day transformation journey!\n\nSection: "${sectionTitle}" ✅\nScore: ${score}/5 🎯\n\nRev Mokoro Manana is teaching me that I don't need to quit my job to start building wealth. I just need to consume SMARTER.\n\nChallenge: Can you complete 9 FREE sections this week? 🙌\n👉 app.z2blegacybuilders.co.za/workshop\n\n#Z2BLegacyBuilders #EmployeeToOwner #PullUpYourChair`,
  `🎓 Session ${sectionId} COMPLETE! "${sectionTitle}" — ${score}/5 score!\n\nHonestly, I didn't know I was already sitting on assets. My salary. My network. My spending habits. All of it can be redirected.\n\nThis workshop is FREE for the first 9 sessions. I dare you to start today.\n\n🔗 app.z2blegacybuilders.co.za/workshop\n\nTag someone who needs to hear this 👇\n\n#Z2BTable #ConsumerToBuilder #LegacyMindset #SouthAfrica`,
];

// ============================================================
// AUDIO PLAYER COMPONENT
// ============================================================
interface AudioPlayerProps {
  text: string;
  sectionTitle: string;
}

function AudioPlayer({ text, sectionTitle }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying]   = useState(false);
  const [isPaused, setIsPaused]     = useState(false);
  const [progress, setProgress]     = useState(0);
  const [voiceReady, setVoiceReady] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chunksRef    = useRef<string[]>([]);
  const chunkIdxRef  = useRef(0);
  const totalChunks  = useRef(0);

  const cleanText = useCallback((raw: string) => {
    return raw
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\n\n/g, ". ")
      .replace(/\n/g, " ")
      .trim();
  }, []);

  const splitChunks = useCallback((str: string): string[] => {
    const sentences = str.match(/[^.!?]+[.!?]+/g) ?? [str];
    const chunks: string[] = [];
    let current = "";
    for (const s of sentences) {
      if ((current + s).length > 220) { if (current) chunks.push(current.trim()); current = s; }
      else current += " " + s;
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }, []);

  useEffect(() => {
    const check = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        setVoiceReady(voices.length > 0);
      }
    };
    check();
    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = check;
    }
    return () => { stopSpeech(); };
  }, []);

  const pickVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined") return null;
    const voices = window.speechSynthesis.getVoices();
    const priority = [
      (v: SpeechSynthesisVoice) => v.lang === "en-ZA" && v.name.toLowerCase().includes("male"),
      (v: SpeechSynthesisVoice) => v.lang === "en-ZA",
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en") && v.name.toLowerCase().match(/david|james|daniel|george|mark|john|guy|oliver/) !== null,
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en-GB"),
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en"),
    ];
    for (const fn of priority) {
      const found = voices.find(fn);
      if (found) return found;
    }
    return voices[0] ?? null;
  };

  const speakChunk = useCallback((chunks: string[], idx: number) => {
    if (idx >= chunks.length) {
      setIsPlaying(false); setIsPaused(false); setProgress(100);
      return;
    }
    const utter = new SpeechSynthesisUtterance(chunks[idx]);
    utter.rate  = 0.88;
    utter.pitch = 0.82;
    utter.volume = 1;
    const v = pickVoice();
    if (v) utter.voice = v;
    utter.onend = () => {
      chunkIdxRef.current = idx + 1;
      setProgress(Math.round(((idx + 1) / totalChunks.current) * 100));
      speakChunk(chunks, idx + 1);
    };
    utter.onerror = () => { setIsPlaying(false); };
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, []);

  const stopSpeech = () => {
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
    setIsPlaying(false); setIsPaused(false); setProgress(0);
    chunkIdxRef.current = 0;
  };

  const handlePlay = () => {
    if (typeof window === "undefined") return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true); setIsPaused(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleaned = cleanText(text);
    const chunks  = splitChunks(cleaned);
    chunksRef.current  = chunks;
    totalChunks.current = chunks.length;
    chunkIdxRef.current = 0;
    setIsPlaying(true); setIsPaused(false); setProgress(0);
    speakChunk(chunks, 0);
  };

  const handlePause = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.pause();
    setIsPlaying(false); setIsPaused(true);
  };

  const handleStop = () => { stopSpeech(); };

  return (
    <div style={AS.wrap}>
      <div style={AS.header}>
        <span style={AS.mic}>🎙️</span>
        <div>
          <div style={AS.title}>Audio Reader</div>
          <div style={AS.sub}>{sectionTitle}</div>
        </div>
        {!voiceReady && <span style={AS.warn}>⚠️ Loading voices…</span>}
      </div>
      <div style={AS.progressWrap}>
        <div style={{ ...AS.progressFill, width: `${progress}%` }} />
      </div>
      <div style={AS.progressLabel}>{progress}% read</div>
      <div style={AS.controls}>
        {!isPlaying && !isPaused && (
          <button style={AS.btnPlay} onClick={handlePlay} disabled={!voiceReady} title="Play">▶ Play</button>
        )}
        {isPlaying && (
          <button style={AS.btnPause} onClick={handlePause} title="Pause">⏸ Pause</button>
        )}
        {isPaused && (
          <button style={AS.btnPlay} onClick={handlePlay} title="Resume">▶ Resume</button>
        )}
        {(isPlaying || isPaused || progress > 0) && (
          <button style={AS.btnStop} onClick={handleStop} title="Stop">⏹ Stop</button>
        )}
        <span style={AS.voiceTag}>🇿🇦 SA Male Voice</span>
      </div>
      {isPlaying && (
        <div style={AS.waveWrap}>
          {[1,2,3,4,5,6,7,8].map((n) => (
            <div key={n} style={{ ...AS.wave, animationDelay: `${n * 0.12}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}

const AS: Record<string, CSSProperties> = {
  wrap:         { background: "#1E1B2E", border: "1.5px solid #6B21A8", borderRadius: "14px", padding: "20px 24px", margin: "0 20px 16px", maxWidth: "760px", marginLeft: "auto", marginRight: "auto" },
  header:       { display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" },
  mic:          { fontSize: "28px" },
  title:        { fontSize: "14px", fontWeight: "bold", color: "#C4B5FD", letterSpacing: "1px" },
  sub:          { fontSize: "11px", color: "#9CA3AF", marginTop: "2px" },
  warn:         { fontSize: "11px", color: "#FCD34D", marginLeft: "auto" },
  progressWrap: { height: "6px", background: "#2a2a3a", borderRadius: "3px", overflow: "hidden", marginBottom: "4px" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #6B21A8, #9333EA)", borderRadius: "3px", transition: "width 0.4s" },
  progressLabel:{ fontSize: "11px", color: "#6B7280", marginBottom: "14px" },
  controls:     { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  btnPlay:      { background: "linear-gradient(135deg, #6B21A8, #9333EA)", color: "#fff", border: "none", padding: "10px 22px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", fontFamily: "Georgia, serif" },
  btnPause:     { background: "#374151", color: "#fff", border: "none", padding: "10px 22px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", fontFamily: "Georgia, serif" },
  btnStop:      { background: "transparent", color: "#9CA3AF", border: "1px solid #374151", padding: "9px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif" },
  voiceTag:     { marginLeft: "auto", fontSize: "11px", color: "#C4B5FD", background: "#2a1a3a", padding: "4px 10px", borderRadius: "20px", border: "1px solid #6B21A8" },
  waveWrap:     { display: "flex", alignItems: "flex-end", gap: "4px", marginTop: "12px", height: "28px" },
  wave:         { width: "4px", background: "#9333EA", borderRadius: "2px", animation: "wave 0.8s ease-in-out infinite alternate", height: "100%" },
};

// ============================================================
// SHARE CELEBRATION CARD COMPONENT
// ============================================================
interface ShareCardProps {
  sectionId: number;
  sectionTitle: string;
  score: number;
  builderRef: string | null;
  onClose: () => void;
}

function ShareCard({ sectionId, sectionTitle, score, builderRef, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captionIdx, setCaptionIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>("");

  const captions = CAPTIONS(sectionId, sectionTitle, score);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = 1080;
    canvas.height = 1080;

    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0,   "#3b0764");
    grad.addColorStop(0.5, "#6B21A8");
    grad.addColorStop(1,   "#1e1b4b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#C4B5FD";
    ctx.beginPath(); ctx.arc(900, 150, 280, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(100, 950, 220, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    const r = 40, x = 140, y = 140, w = 800, h = 800;
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#E9D5FF";
    ctx.font      = "bold 52px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Z2B TABLE BANQUET", 540, 230);

    ctx.font      = "120px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🏆", 540, 400);

    ctx.fillStyle = "#F5F3FF";
    ctx.font      = "bold 56px Arial";
    ctx.fillText(`SECTION ${sectionId} COMPLETE!`, 540, 490);

    ctx.fillStyle = "#C4B5FD";
    ctx.font      = "36px Arial";
    const maxW = 700;
    const words = sectionTitle.split(" ");
    let line = "";
    let lineY = 560;
    for (const word of words) {
      const test = line + (line ? " " : "") + word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, 540, lineY);
        line = word; lineY += 44;
      } else line = test;
    }
    ctx.fillText(line, 540, lineY);

    const starY = lineY + 80;
    ctx.font = "64px Arial";
    const stars = score === 5 ? "⭐⭐⭐⭐⭐" : score >= 3 ? "⭐⭐⭐" : "⭐⭐";
    ctx.fillText(stars, 540, starY);

    ctx.fillStyle = "#FDE68A";
    ctx.font      = "bold 48px Arial";
    ctx.fillText(`${score}/5 SCORE`, 540, starY + 70);

    ctx.fillStyle = "#D97706";
    ctx.beginPath(); ctx.roundRect(390, starY + 100, 300, 60, 30); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font      = "bold 28px Arial";
    ctx.fillText(`Day ${sectionId} of 90 Completed`, 540, starY + 138);

    ctx.fillStyle = "#A78BFA";
    ctx.font      = "24px Arial";
    ctx.fillText(
      builderRef
        ? `app.z2blegacybuilders.co.za/workshop?ref=${builderRef}`
        : "app.z2blegacybuilders.co.za/workshop",
      540, 1000
    );

    setImgUrl(canvas.toDataURL("image/png"));
  }, [sectionId, sectionTitle, score]);

  const shareUrl  = builderRef
    ? `https://app.z2blegacybuilders.co.za/workshop?ref=${builderRef}`
    : `https://app.z2blegacybuilders.co.za/workshop`;
  const caption   = captions[captionIdx];
  const encoded   = encodeURIComponent(caption + "\n\n" + shareUrl);

  const copyCaption = () => {
    navigator.clipboard.writeText(caption).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const downloadCard = () => {
    const a = document.createElement("a");
    a.href     = imgUrl;
    a.download = `Z2B-Section-${sectionId}-Complete.png`;
    a.click();
  };

  return (
    <div style={SC.overlay}>
      <div style={SC.modal}>
        <button style={SC.closeBtn} onClick={onClose}>✕</button>
        <h2 style={SC.heading}>🎉 Share Your Win!</h2>
        <p style={SC.subheading}>Challenge your friends to start their FREE workshop journey</p>
        <canvas ref={canvasRef} style={{ display: "none" }} />
        {imgUrl && (
          <div style={SC.cardPreviewWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgUrl} alt="Share card" style={SC.cardPreview} />
          </div>
        )}
        <button style={SC.downloadBtn} onClick={downloadCard}>⬇️ Download Card (PNG)</button>
        <p style={SC.downloadNote}>Save the card, then post it with the caption below</p>
        <div style={SC.captionTabs}>
          {captions.map((_, i) => (
            <button key={i} style={{ ...SC.captionTab, ...(captionIdx === i ? SC.captionTabActive : {}) }} onClick={() => setCaptionIdx(i)}>
              Caption {i + 1}
            </button>
          ))}
        </div>
        <div style={SC.captionBox}>
          <p style={SC.captionText}>{caption}</p>
          <button style={SC.copyBtn} onClick={copyCaption}>{copied ? "✅ Copied!" : "📋 Copy Caption"}</button>
        </div>
        <p style={SC.shareLabel}>Quick Share (opens app with caption):</p>
        <div style={SC.shareBtns}>
          <a href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noopener noreferrer" style={{ ...SC.shareBtn, background: "#25D366" }}>
            <span style={SC.shareIcon}>💬</span> WhatsApp
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(caption)}`} target="_blank" rel="noopener noreferrer" style={{ ...SC.shareBtn, background: "#1877F2" }}>
            <span style={SC.shareIcon}>📘</span> Facebook
          </a>
          <a href={`https://www.tiktok.com/`} target="_blank" rel="noopener noreferrer" style={{ ...SC.shareBtn, background: "#010101", border: "1px solid #69C9D0" }} title="Download card & caption, then post on TikTok">
            <span style={SC.shareIcon}>🎵</span> TikTok
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${encoded}`} target="_blank" rel="noopener noreferrer" style={{ ...SC.shareBtn, background: "#000" }}>
            <span style={SC.shareIcon}>𝕏</span> X / Twitter
          </a>
        </div>
        <p style={SC.tiktokNote}>📱 For TikTok: download the card, open TikTok → New Post → select image → paste caption</p>
      </div>
    </div>
  );
}

const SC: Record<string, CSSProperties> = {
  overlay:        { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflowY: "auto" },
  modal:          { background: "#fff", borderRadius: "20px", padding: "28px 24px", maxWidth: "560px", width: "100%", position: "relative", maxHeight: "95vh", overflowY: "auto" },
  closeBtn:       { position: "absolute", top: "16px", right: "16px", background: "#F3E8FF", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", color: "#6B21A8", fontWeight: "bold" },
  heading:        { fontSize: "22px", fontWeight: "bold", color: "#6B21A8", textAlign: "center", margin: "0 0 6px" },
  subheading:     { fontSize: "13px", color: "#6B7280", textAlign: "center", margin: "0 0 20px" },
  cardPreviewWrap:{ borderRadius: "12px", overflow: "hidden", border: "2px solid #C4B5FD", marginBottom: "12px", textAlign: "center" },
  cardPreview:    { width: "100%", maxWidth: "360px", height: "auto", display: "block", margin: "0 auto" },
  downloadBtn:    { width: "100%", background: "linear-gradient(135deg, #6B21A8, #9333EA)", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", marginBottom: "6px", fontFamily: "Georgia, serif" },
  downloadNote:   { fontSize: "11px", color: "#9CA3AF", textAlign: "center", margin: "0 0 16px" },
  captionTabs:    { display: "flex", gap: "8px", marginBottom: "10px" },
  captionTab:     { flex: 1, padding: "8px", borderRadius: "8px", border: "1.5px solid #C4B5FD", background: "#F3E8FF", color: "#6B21A8", fontSize: "12px", fontWeight: "bold", cursor: "pointer" },
  captionTabActive:{ background: "#6B21A8", color: "#fff", borderColor: "#6B21A8" },
  captionBox:     { background: "#F9FAFB", border: "1.5px solid #E5E7EB", borderRadius: "10px", padding: "14px", marginBottom: "16px" },
  captionText:    { fontSize: "12px", color: "#374151", lineHeight: 1.7, margin: "0 0 10px", whiteSpace: "pre-line" },
  copyBtn:        { background: "#6B21A8", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif" },
  shareLabel:     { fontSize: "12px", color: "#6B7280", fontWeight: "bold", margin: "0 0 8px" },
  shareBtns:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" },
  shareBtn:       { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "10px", color: "#fff", fontWeight: "bold", fontSize: "13px", textDecoration: "none", border: "none" },
  shareIcon:      { fontSize: "18px" },
  tiktokNote:     { fontSize: "11px", color: "#9CA3AF", textAlign: "center", lineHeight: 1.5 },
};


// ============================================================
// WELCOME OVERLAY — shown to prospects arriving via referral link
// ============================================================
interface WelcomeOverlayProps {
  builderName: string;
  builderRef: string;
  sectionId: number;
  sectionTitle: string;
  onClose: () => void;
}

function WelcomeOverlay({ builderName, builderRef, sectionId, sectionTitle, onClose }: WelcomeOverlayProps) {
  const [step, setStep]           = useState<"welcome" | "contact" | "thanks">("welcome");
  const [name, setName]           = useState("");
  const [whatsapp, setWhatsapp]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const handleContactNow = async () => {
    if (!name.trim() || !whatsapp.trim()) { setError("Please enter your name and WhatsApp number."); return; }
    setSaving(true); setError("");
    try {
      // Look up builder_id from referral code
      const { data: builderData } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", builderRef)
        .single();

      await supabase.from("prospect_notifications").insert({
        builder_id:        builderData?.id ?? null,
        builder_ref:       builderRef,
        prospect_name:     name.trim(),
        prospect_whatsapp: whatsapp.trim(),
        section_id:        sectionId,
        section_title:     sectionTitle,
        status:            "new",
        read:              false,
      });
      setStep("thanks");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Inject 3D text animation
  useEffect(() => {
    const styleId = "z2b-welcome-3d";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes float3d {
          0%   { transform: perspective(600px) rotateX(0deg) translateY(0px); }
          50%  { transform: perspective(600px) rotateX(6deg) translateY(-8px); }
          100% { transform: perspective(600px) rotateX(0deg) translateY(0px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-40px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes pulse3d {
          0%,100% { text-shadow: 0 4px 8px rgba(107,33,168,0.4), 0 0 20px rgba(147,51,234,0.3); }
          50%     { text-shadow: 0 8px 20px rgba(107,33,168,0.7), 0 0 40px rgba(147,51,234,0.6); }
        }
        @keyframes heartbeat {
          0%,100% { transform: scale(1);   }
          25%     { transform: scale(1.3); }
          50%     { transform: scale(1);   }
          75%     { transform: scale(1.15);}
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div style={WO.overlay}>
      <div style={WO.modal}>

        {step === "welcome" && (
          <>
            {/* 3D Floating Title */}
            <div style={WO.titleWrap}>
              <div style={WO.title3d}>Welcome to Abundance</div>
              <div style={WO.heart}>❤️</div>
            </div>

            {/* Builder invite message */}
            <div style={WO.inviteBox}>
              <p style={WO.inviteLabel}>You have been personally invited by</p>
              <p style={WO.builderName}>🏆 {builderName}</p>
              <p style={WO.inviteSub}>to experience the Z2B Entrepreneurial Consumer Workshop — FREE for your first 9 sessions.</p>
            </div>

            {/* Decorative divider */}
            <div style={WO.divider} />

            <p style={WO.question}>Would you like <strong>{builderName.split(" ")[0]}</strong> to contact you?</p>

            <div style={WO.btnRow}>
              <button style={WO.btnYes} onClick={() => setStep("contact")}>
                ✋ Contact Me Now
              </button>
              <button style={WO.btnLater} onClick={onClose}>
                🎓 Maybe Later — Start Workshop
              </button>
            </div>
            <p style={WO.footNote}>Your referral link is saved. {builderName.split(" ")[0]} will still get credit if you join later.</p>
          </>
        )}

        {step === "contact" && (
          <>
            <div style={WO.titleWrap}>
              <div style={{ ...WO.title3d, fontSize: "22px" }}>Leave Your Details ✍️</div>
            </div>
            <p style={WO.inviteSub}><strong>{builderName.split(" ")[0]}</strong> will reach out to you on WhatsApp.</p>

            {error && <p style={WO.error}>{error}</p>}

            <div style={WO.formGroup}>
              <label style={WO.label}>Your Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thabo Nkosi"
                style={WO.input}
              />
            </div>
            <div style={WO.formGroup}>
              <label style={WO.label}>Your WhatsApp Number *</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 0821234567"
                style={WO.input}
              />
            </div>

            <div style={WO.btnRow}>
              <button style={WO.btnYes} onClick={handleContactNow} disabled={saving}>
                {saving ? "Sending..." : "✅ Send My Details"}
              </button>
              <button style={WO.btnLater} onClick={onClose}>
                Cancel — Start Workshop
              </button>
            </div>
          </>
        )}

        {step === "thanks" && (
          <>
            <div style={WO.titleWrap}>
              <div style={{ ...WO.title3d, fontSize: "24px" }}>You're All Set! 🎉</div>
              <div style={WO.heart}>❤️</div>
            </div>
            <p style={{ textAlign: "center", color: "#374151", fontSize: "15px", lineHeight: 1.7, marginBottom: "24px" }}>
              <strong>{builderName.split(" ")[0]}</strong> has been notified and will contact you soon on WhatsApp.<br /><br />
              In the meantime, enjoy your <strong>FREE 9-section workshop</strong>!
            </p>
            <button style={{ ...WO.btnYes, width: "100%" }} onClick={onClose}>
              🎓 Start My Workshop Now
            </button>
          </>
        )}

      </div>
    </div>
  );
}

// Welcome Overlay Styles
const WO: Record<string, CSSProperties> = {
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  modal:       { background: "#fff", borderRadius: "24px", padding: "36px 28px", maxWidth: "480px", width: "100%", animation: "slideDown 0.5s ease-out", boxShadow: "0 24px 60px rgba(107,33,168,0.35)" },
  titleWrap:   { textAlign: "center", marginBottom: "20px" },
  title3d:     { fontSize: "30px", fontWeight: "bold", color: "#6B21A8", fontFamily: "Georgia, serif", animation: "float3d 3s ease-in-out infinite, pulse3d 3s ease-in-out infinite", display: "inline-block", letterSpacing: "1px", textShadow: "0 4px 8px rgba(107,33,168,0.4), 2px 2px 0px #C4B5FD, 4px 4px 0px rgba(107,33,168,0.2)" },
  heart:       { fontSize: "36px", display: "block", animation: "heartbeat 1.5s ease-in-out infinite", marginTop: "8px" },
  inviteBox:   { background: "linear-gradient(135deg, #F3E8FF, #EDE9FE)", border: "2px solid #C4B5FD", borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "20px" },
  inviteLabel: { fontSize: "12px", color: "#7C3AED", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 8px" },
  builderName: { fontSize: "24px", fontWeight: "bold", color: "#3B0764", margin: "0 0 10px", fontFamily: "Georgia, serif" },
  inviteSub:   { fontSize: "13px", color: "#6B7280", lineHeight: 1.7, margin: 0, textAlign: "center" },
  divider:     { height: "1px", background: "linear-gradient(90deg, transparent, #C4B5FD, transparent)", margin: "20px 0" },
  question:    { textAlign: "center", fontSize: "15px", color: "#374151", marginBottom: "20px", lineHeight: 1.6 },
  btnRow:      { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" },
  btnYes:      { background: "linear-gradient(135deg, #6B21A8, #9333EA)", color: "#fff", border: "none", padding: "14px 24px", borderRadius: "12px", fontWeight: "bold", fontSize: "15px", cursor: "pointer", fontFamily: "Georgia, serif" },
  btnLater:    { background: "#F9FAFB", color: "#6B7280", border: "1.5px solid #E5E7EB", padding: "12px 24px", borderRadius: "12px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif" },
  footNote:    { textAlign: "center", fontSize: "11px", color: "#9CA3AF", lineHeight: 1.6 },
  formGroup:   { marginBottom: "16px" },
  label:       { display: "block", fontSize: "13px", fontWeight: "bold", color: "#374151", marginBottom: "6px" },
  input:       { width: "100%", padding: "12px 14px", border: "1.5px solid #C4B5FD", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif" },
  error:       { background: "#FEE2E2", color: "#DC2626", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px", textAlign: "center" },
};


// ============================================================
// HOME VIEW
// ============================================================
function HomeView({ setView, completedCount, freeCompleted }: HomeViewProps) {
  void freeCompleted;
  return (
    <div style={S.homePage}>
      <div style={S.homeGlow} />
      <div style={S.homeContent}>
        <div style={S.homeLogoRow}>
          <div style={S.homeLogo}>Z2B</div>
          <div style={S.homeLogoSub}>TABLE BANQUET</div>
        </div>
        <h1 style={S.homeTitle}>The Entrepreneurial Consumer Workshop</h1>
        <p style={S.homeTagline}>How Employees Turn Monthly Expenses Into Income-Generating Assets</p>
        <p style={S.homeBy}>— Rev Mokoro Manana · Founder, Z2B Legacy Builders</p>
        <div style={S.homeStats}>
          <div style={S.homeStat}><span style={S.homeStatNum}>90</span><span style={S.homeStatLabel}>Sessions</span></div>
          <div style={S.homeStatDiv} />
          <div style={S.homeStat}><span style={S.homeStatNum}>9</span><span style={S.homeStatLabel}>Free Days</span></div>
          <div style={S.homeStatDiv} />
          <div style={S.homeStat}><span style={S.homeStatNum}>{completedCount}</span><span style={S.homeStatLabel}>Completed</span></div>
        </div>
        <div style={S.homeBtnRow}>
          <button style={S.btnGold} onClick={() => setView("workshop")}>🏛️ Enter Workshop</button>
          <button style={S.btnOutline} onClick={() => setView("workshop")}>🎁 Start Free (9 Sessions)</button>
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "12px" }}>
          <a
            href="/vision-board"
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #B8860B, #D4AF37)", color: "#000", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", textDecoration: "none", fontFamily: "Georgia, serif" }}
          >
            🏆 My Vision Board
          </a>
          <a
            href="/pricing"
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", color: "#6B21A8", border: "2px solid #6B21A8", padding: "12px 24px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", textDecoration: "none", fontFamily: "Georgia, serif" }}
          >
            ⬆️ Upgrade
          </a>
          <a
            href="/"
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", color: "#9CA3AF", border: "2px solid #E5E7EB", padding: "12px 24px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", textDecoration: "none", fontFamily: "Georgia, serif" }}
          >
            🏠 Main Home
          </a>
        </div>
        <div style={S.homeTeee}>
          {["Transform", "Educate", "Empower", "Enrich"].map((t) => (
            <span key={t} style={S.teeePill}>{t}</span>
          ))}
        </div>
        <p style={S.homeFooter}>app.z2blegacybuilders.co.za · Zero2Billionaires Amavulandlela Pty Ltd</p>
      </div>
    </div>
  );
}

// ============================================================
// PAYWALL VIEW
// ============================================================
function PaywallView({ setView }: PaywallViewProps) {
  const tiers: Tier[] = [
    { name: "FAM",      price: "R0",         desc: "Free — 9 Sessions only",         color: "#9CA3AF", bg: "#F9FAFB", cta: "Start Free"  },
    { name: "BUILDER",  price: "R297/mo",    desc: "Sessions 1–30 + Community",      color: "#7C3AED", bg: "#EDE9FE", cta: "Join Builder" },
    { name: "LEADER",   price: "R797/mo",    desc: "Sessions 1–60 + Coaching",       color: "#6B21A8", bg: "#F3E8FF", cta: "Join Leader"  },
    { name: "LEGACY",   price: "R1,497/mo",  desc: "All 90 Sessions + Mentorship",   color: "#D97706", bg: "#FEF3C7", cta: "Join Legacy"  },
    { name: "PLATINUM", price: "R4,980/mo",  desc: "Full System + Diamond Path",     color: "#4F46E5", bg: "#EEF2FF", cta: "Go Platinum"  },
  ];
  return (
    <div style={S.paywallPage}>
      <div style={S.paywallInner}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button style={S.backBtn} onClick={() => setView("home")}>🏠 Home</button>
          <button style={S.backBtn} onClick={() => setView("workshop")}>← Workshop</button>
        </div>
        <h1 style={S.paywallTitle}>🔒 Members-Only Content</h1>
        <p style={S.paywallSub}>Sessions 10–90 require a paid membership. You&apos;ve completed the free preview — now pull up your chair and own your table.</p>
        <div style={S.tierGrid}>
          {tiers.map((t) => (
            <div key={t.name} style={{ ...S.tierCard, borderColor: t.color, background: t.bg }}>
              <div style={{ ...S.tierName, color: t.color }}>{t.name}</div>
              <div style={S.tierPrice}>{t.price}</div>
              <div style={S.tierDesc}>{t.desc}</div>
              <a
                href={`https://app.z2blegacybuilders.co.za/register?tier=${t.name.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...S.tierBtn, background: t.color }}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <a
            href="https://app.z2blegacybuilders.co.za/pricing"
            style={{ display: "inline-block", background: "linear-gradient(135deg, #6B21A8, #9333EA)", color: "#fff", padding: "14px 36px", borderRadius: "14px", fontWeight: "bold", fontSize: "16px", textDecoration: "none", fontFamily: "Georgia, serif", boxShadow: "0 6px 20px rgba(107,33,168,0.35)" }}
          >
            ⬆️ View All Pricing Plans →
          </a>
        </div>
        <p style={S.paywallNote}>
          Already a member?{" "}
          <a href="https://app.z2blegacybuilders.co.za/login" style={S.goldLink}>Login here →</a>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
// ── COACH MANLAW VOICE COMPONENT ──
function ManlawVoice({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused]     = useState(false);

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate  = 0.92;
    utterance.pitch = 1.0;
    // Pick a deep male voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.toLowerCase().includes("david") ||
      v.name.toLowerCase().includes("james") ||
      v.name.toLowerCase().includes("daniel") ||
      v.name.toLowerCase().includes("male")
    );
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => { setSpeaking(true); setPaused(false); };
    utterance.onend   = () => { setSpeaking(false); setPaused(false); };
    utterance.onerror = () => { setSpeaking(false); setPaused(false); };
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setPaused(false);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      {!speaking ? (
        <button
          onClick={speak}
          style={{
            background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)",
            borderRadius: "20px", padding: "4px 12px", color: "#D4AF37",
            fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
          }}
        >
          🔊 Listen
        </button>
      ) : (
        <>
          {paused ? (
            <button onClick={resume} style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "20px", padding: "4px 12px", color: "#D4AF37", fontSize: "11px", cursor: "pointer" }}>
              ▶ Resume
            </button>
          ) : (
            <button onClick={pause} style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "20px", padding: "4px 12px", color: "#D4AF37", fontSize: "11px", cursor: "pointer" }}>
              ⏸ Pause
            </button>
          )}
          <button onClick={stop} style={{ background: "rgba(255,100,100,0.15)", border: "1px solid rgba(255,100,100,0.3)", borderRadius: "20px", padding: "4px 12px", color: "#FF6464", fontSize: "11px", cursor: "pointer" }}>
            ⏹ Stop
          </button>
        </>
      )}
    </div>
  );
}

// ── SESSION 8 — OBJECTION DISSOLVER ─────────────────────────
function ObjectionDissolver({ firstName }: { firstName: string }) {
  const [activeObj, setActiveObj] = React.useState<number | null>(null);
  const [dissolved, setDissolved] = React.useState<Record<number, boolean>>({});

  const objections = [
    {
      fear: "Is this a pyramid scheme?",
      icon: "🔺",
      color: "#EF4444",
      reality: "A pyramid scheme pays people to recruit — with no real product or value exchanged. It is illegal in South Africa. Network Marketing is a legal distribution model regulated by the Consumer Protection Act. The difference is simple: real products, real customers, real value. Z2B distributes products people already buy. No product = pyramid. Real product = legitimate business vehicle.",
      truth: "You were right to ask. Discernment is a builder's first skill. Now you know the difference.",
    },
    {
      fear: "I don't want to sell to my friends and family.",
      icon: "😬",
      color: "#F97316",
      reality: "You are not being asked to sell to friends. You are being equipped to share a solution with people who already have a problem. There is a difference between pestering and positioning. When you understand the Z2B model, you don't chase — you attract. People come to you because your life is changing. That is not selling. That is testimony.",
      truth: "The best builders never feel like salespeople. They feel like people who found something valuable and couldn't keep quiet.",
    },
    {
      fear: "I tried something like this before and it didn't work.",
      icon: "💔",
      color: "#9333EA",
      reality: "Most people who tried and failed did so without: proper education before execution, a community for support, a clear identity as an Entrepreneurial Consumer, and a structured 90-session journey. They were handed a product and told to hustle. Z2B does the opposite — it builds you first. The vehicle did not fail you. The system around the vehicle was missing.",
      truth: firstName + ", this is not a retry. This is a rebuild — from the foundation up.",
    },
    {
      fear: "I don't have time.",
      icon: "⏰",
      color: "#0EA5E9",
      reality: "The Z2B model is designed for employed people with limited time. You do not need to quit your job. You do not need 8 hours a day. You need 30 focused minutes and a smartphone. The system works through duplication — meaning your network works even when you don't. Time is not the constraint. Clarity and consistency are.",
      truth: "The question is not whether you have time. It is whether what you are spending your time on is building anything.",
    },
    {
      fear: "I don't have money to start.",
      icon: "💸",
      color: "#22C55E",
      reality: "Sessions 1 to 9 are completely free. You are not asked for money to learn. When you are ready to upgrade, Z2B membership is a once-off lifetime investment of R480 — not a monthly subscription, not a recurring fee. You pay once and you are in for life. More importantly: Z2B is designed to generate income before it asks you to invest anything. You learn first. You earn first. Then you decide.",
      truth: "The first investment Z2B asks for is not money. It is attention. You are already investing it.",
    },
    {
      fear: "My family will think I've joined a cult.",
      icon: "🏠",
      color: "#D4AF37",
      reality: "This is one of the most common fears — and the most human. The answer is not to argue. It is to produce results. When your account has extra income, when your stress reduces, when your vision becomes clear — the conversation changes. Don't recruit your family. Let your transformation recruit them. Z2B is a kingdom business. It is built on integrity, education, and stewardship — not hype.",
      truth: "Your greatest testimony will not be what you say about Z2B. It will be what Z2B does through you.",
    },
  ];

  const dissolvedCount = Object.values(dissolved).filter(Boolean).length;

  return (
    <div style={{
      background: "linear-gradient(135deg, #1A0010, #0D0020)",
      border: "2px solid #EF4444", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#FCA5A5", marginBottom: "4px" }}>
        🛡️ The Fear Audit — Every Objection Dissolved
      </div>
      <div style={{ fontSize: "13px", color: "rgba(252,165,165,0.6)", marginBottom: "6px", lineHeight: 1.6 }}>
        {firstName}, these are the six fears that stop most people from ever starting. Tap each one. Read the reality. Then decide from truth — not fear.
      </div>
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>
        {dissolvedCount}/6 fears dissolved
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {objections.map((obj, i) => {
          const isOpen = activeObj === i;
          const isDone = dissolved[i];
          return (
            <div key={i} style={{
              background: isDone ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.03)",
              border: `1.5px solid ${isDone ? "rgba(34,197,94,0.4)" : isOpen ? obj.color : "rgba(255,255,255,0.08)"}`,
              borderRadius: "12px", overflow: "hidden", transition: "all 0.2s",
            }}>
              {/* Header */}
              <div
                onClick={() => setActiveObj(isOpen ? null : i)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 16px", cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "20px" }}>{isDone ? "✅" : obj.icon}</span>
                <span style={{
                  fontSize: "14px", fontWeight: "bold", flex: 1,
                  color: isDone ? "#22C55E" : "#fff",
                }}>
                  {obj.fear}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
                  {isOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* Expanded */}
              {isOpen && (
                <div style={{ padding: "0 16px 16px" }}>
                  <div style={{
                    background: "rgba(0,0,0,0.3)", borderRadius: "10px",
                    padding: "14px", marginBottom: "12px",
                    borderLeft: `3px solid ${obj.color}`,
                  }}>
                    <div style={{ fontSize: "11px", color: obj.color, fontWeight: "bold", letterSpacing: "1px", marginBottom: "8px" }}>
                      THE REALITY
                    </div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.8 }}>
                      {obj.reality}
                    </div>
                  </div>
                  <div style={{
                    fontSize: "13px", color: "#D4AF37", fontStyle: "italic",
                    marginBottom: "12px", paddingLeft: "4px",
                  }}>
                    "{obj.truth}"
                  </div>
                  {!isDone && (
                    <button
                      onClick={() => { setDissolved(prev => ({ ...prev, [i]: true })); setActiveObj(null); }}
                      style={{
                        background: `linear-gradient(135deg, ${obj.color}99, ${obj.color})`,
                        color: "#fff", border: "none", borderRadius: "8px",
                        padding: "10px 20px", fontWeight: "bold", fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Fear Dissolved ✓
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {dissolvedCount === 6 && (
        <div style={{
          marginTop: "20px", background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.4)",
          borderRadius: "12px", padding: "18px",
        }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#22C55E", marginBottom: "8px" }}>
            {firstName}, all six fears are dissolved. 🛡️
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.8, marginBottom: "10px" }}>
            You did not arrive at Session 8 by accident. Eight sessions of education have been building this moment.
            You now have clarity where there was confusion, and truth where there was fear.
            The last session is not another lesson — it is an invitation.
          </div>
          <div style={{ fontSize: "12px", color: "#D4AF37", fontStyle: "italic" }}>
            🔥 Session 9 — Your Circle of Twelve is waiting. The harvest is almost ready.
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 9 — CIRCLE OF TWELVE ─────────────────────────────
function CircleOfTwelve({ firstName }: { firstName: string }) {
  const layers = [
    {
      key: "ignition",
      label: "Short-Term Destiny Helpers",
      range: "Start immediately",
      icon: "⚡",
      color: "#22C55E",
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.35)",
      desc: "Ready to walk with you NOW. Ignition partners — they help you implement, share learning and break fear barriers.",
      count: 4,
    },
    {
      key: "strategic",
      label: "Medium-Term Strategic Builders",
      range: "1 to 3 years",
      icon: "🏗️",
      color: "#0EA5E9",
      bg: "rgba(14,165,233,0.08)",
      border: "rgba(14,165,233,0.35)",
      desc: "Carry complementary capabilities. You will launch structured collaborations and combine skills with these people.",
      count: 4,
    },
    {
      key: "covenant",
      label: "Long-Term Covenant Partners",
      range: "5 to 10 years",
      icon: "🤝",
      color: "#D4AF37",
      bg: "rgba(212,175,55,0.08)",
      border: "rgba(212,175,55,0.35)",
      desc: "Destiny alliances. Business partnerships, investment alliances, property and legacy ventures. These are your tribe.",
      count: 4,
    },
  ];

  const [names, setNames] = React.useState<Record<string, string[]>>({
    ignition:  ["", "", "", ""],
    strategic: ["", "", "", ""],
    covenant:  ["", "", "", ""],
  });
  const [revealed, setRevealed] = React.useState(false);
  const [harvestReady, setHarvestReady] = React.useState(false);

  const updateName = (layer: string, idx: number, val: string) => {
    setNames(prev => {
      const updated = [...prev[layer]];
      updated[idx] = val;
      return { ...prev, [layer]: updated };
    });
  };

  const filledCount = Object.values(names).flat().filter(n => n.trim().length > 1).length;
  const allTwelveFilled = filledCount === 12;

  const handleReveal = () => {
    if (!allTwelveFilled) return;
    setRevealed(true);
    // Store in localStorage for builder dashboard
    try {
      localStorage.setItem("z2b_circle_of_twelve", JSON.stringify(names));
    } catch(e) {}
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #1A0A00, #1A0035)",
      border: "2px solid #D4AF37", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#D4AF37", marginBottom: "4px" }}>
        👑 Your Circle of Twelve
      </div>
      <div style={{ fontSize: "13px", color: "rgba(212,175,55,0.7)", marginBottom: "6px", lineHeight: 1.6 }}>
        {firstName}, before God gives a man land — He gives him people. Write 12 names across the three layers.
        Do not filter. Do not ask permission. Just write who comes to mind.
      </div>
      <div style={{
        fontSize: "12px", color: "rgba(255,255,255,0.4)",
        marginBottom: "20px", fontStyle: "italic",
      }}>
        "12 Tribes. 12 Disciples. 12 Foundations. Twelve is the number of organised expansion." — Z2B
      </div>

      {!revealed ? (
        <>
          {layers.map(layer => (
            <div key={layer.key} style={{
              background: layer.bg, border: `1.5px solid ${layer.border}`,
              borderRadius: "14px", padding: "16px", marginBottom: "14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span style={{ fontSize: "20px" }}>{layer.icon}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: layer.color }}>{layer.label}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{layer.range}</div>
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "12px", lineHeight: 1.6, paddingLeft: "30px" }}>
                {layer.desc}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[0,1,2,3].map(idx => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                      background: names[layer.key][idx].trim().length > 1 ? layer.color : "rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: "bold", color: "#000",
                    }}>
                      {names[layer.key][idx].trim().length > 1 ? "✓" : idx + 1}
                    </div>
                    <input
                      type="text"
                      value={names[layer.key][idx]}
                      onChange={e => updateName(layer.key, idx, e.target.value)}
                      placeholder={`Name ${idx + 1}`}
                      style={{
                        flex: 1, background: "rgba(0,0,0,0.3)",
                        border: `1px solid ${names[layer.key][idx].trim().length > 1 ? layer.color : "rgba(255,255,255,0.1)"}`,
                        borderRadius: "8px", padding: "8px 10px",
                        color: "#fff", fontSize: "13px", outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "3px",
                width: `${(filledCount / 12) * 100}%`,
                background: "linear-gradient(90deg, #22C55E, #D4AF37)",
                transition: "width 0.3s",
              }} />
            </div>
            <div style={{ fontSize: "13px", color: "#D4AF37", fontWeight: "bold", minWidth: "40px" }}>
              {filledCount}/12
            </div>
          </div>

          <button
            onClick={handleReveal}
            disabled={!allTwelveFilled}
            style={{
              background: allTwelveFilled ? "linear-gradient(135deg, #B8860B, #D4AF37)" : "rgba(255,255,255,0.08)",
              color: allTwelveFilled ? "#000" : "rgba(255,255,255,0.3)",
              border: "none", borderRadius: "10px", padding: "13px 32px",
              fontWeight: "bold", fontSize: "14px",
              cursor: allTwelveFilled ? "pointer" : "not-allowed",
            }}
          >
            {allTwelveFilled ? "👑 Seal My Circle →" : `${12 - filledCount} names remaining`}
          </button>
        </>
      ) : !harvestReady ? (
        // Circle sealed — harvest moment
        <div>
          <div style={{
            background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.4)",
            borderRadius: "12px", padding: "20px", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#D4AF37", marginBottom: "10px" }}>
              {firstName}, your Circle of Twelve is sealed. 👑
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              {layers.map(layer => (
                <div key={layer.key} style={{
                  background: layer.bg, border: `1px solid ${layer.border}`,
                  borderRadius: "10px", padding: "12px", textAlign: "center",
                }}>
                  <div style={{ fontSize: "18px", marginBottom: "4px" }}>{layer.icon}</div>
                  <div style={{ fontSize: "11px", color: layer.color, fontWeight: "bold", marginBottom: "6px" }}>
                    {layer.label.split(" ").slice(0,2).join(" ")}
                  </div>
                  {names[layer.key].map((n, i) => (
                    <div key={i} style={{ fontSize: "12px", color: "#fff", padding: "2px 0" }}>
                      {n.trim() || "—"}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}>
              These 12 people are seeds. Some will grow with you immediately. Some will take years to understand
              what you are building. Some will surprise you. Your role is not to convince them —
              it is to remain consistent until your results do the convincing.
            </div>
          </div>

          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "12px", padding: "16px", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#FCA5A5", marginBottom: "8px" }}>
              🔥 {firstName} — You Have Completed All 9 Free Sessions.
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}>
              You have done what most people never do. You sat down, learned, reflected, and built.
              You mapped your assets. You chose your identity. You built your vision. You dissolved your fears.
              You named your circle. The ground is not just broken — it is prepared.
            </div>
          </div>

          <button
            onClick={() => setHarvestReady(true)}
            style={{
              background: "linear-gradient(135deg, #7C2D12, #EF4444)",
              color: "#fff", border: "none", borderRadius: "10px",
              padding: "14px 32px", fontWeight: "bold", fontSize: "15px",
              cursor: "pointer", width: "100%",
            }}
          >
            🔥 I Am Ready — Show Me The Next Step
          </button>
        </div>
      ) : (
        // HARVEST READY — final screen
        <div style={{
          background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(147,51,234,0.1))",
          border: "2px solid #D4AF37", borderRadius: "12px", padding: "24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🏆</div>
          <div style={{ fontSize: "22px", fontWeight: "bold", color: "#D4AF37", marginBottom: "10px" }}>
            The Table Is Set, {firstName}.
          </div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.9, marginBottom: "20px" }}>
            Nine sessions. Nine mirrors. Nine steps of preparation.<br />
            You are no longer a spectator of the economy — you are being positioned as a builder within it.<br /><br />
            The Z2B TABLE BANQUET continues beyond Session 9 — with 81 more sessions covering
            platform ownership, income streams, digital assets, leadership, and legacy.
            But first — the person who invited you to this table has been notified.
            They have walked this journey with you from the first session.
            Your next conversation with them will be different. You are ready.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <a href="/vision-board" style={{
              display: "block", background: "linear-gradient(135deg, #B8860B, #D4AF37)",
              color: "#000", borderRadius: "10px", padding: "13px",
              fontWeight: "bold", fontSize: "14px", textDecoration: "none",
            }}>
              🏆 Complete My Vision Board
            </a>
            <a href="/pricing" style={{
              display: "block", background: "linear-gradient(135deg, #6B21A8, #9333EA)",
              color: "#fff", borderRadius: "10px", padding: "13px",
              fontWeight: "bold", fontSize: "14px", textDecoration: "none",
            }}>
              ⚡ Upgrade — Continue to Session 10
            </a>
          </div>
          <div style={{ marginTop: "16px", fontSize: "12px", color: "rgba(212,175,55,0.5)", fontStyle: "italic" }}>
            "You prepare a table before me in the presence of my enemies." — Psalm 23:5
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 7 — PERSONAL SWOT BUILDER ───────────────────────
function SwotBuilder({ firstName }: { firstName: string }) {
  const quadrants = [
    {
      key: "strengths", label: "STRENGTHS", icon: "💪", color: "#22C55E",
      bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.35)",
      prompt: "What do you do well? What have others praised you for? What skills has your job built in you?",
      placeholder: "e.g. I am consistent, good with people, I know how to manage a budget...",
    },
    {
      key: "weaknesses", label: "WEAKNESSES", icon: "🪞", color: "#EF4444",
      bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.35)",
      prompt: "What holds you back? What skills do you lack? What do you avoid? These are signals — not verdicts.",
      placeholder: "e.g. I struggle with follow-through, I avoid conflict, I don't manage time well...",
    },
    {
      key: "opportunities", label: "OPPORTUNITIES", icon: "🌱", color: "#D4AF37",
      bg: "rgba(212,175,55,0.08)", border: "rgba(212,175,55,0.35)",
      prompt: "What repeated expenses could be redirected? What needs do people around you have that are unmet?",
      placeholder: "e.g. My church community needs financial education, people in my area buy from far away...",
    },
    {
      key: "threats", label: "THREATS", icon: "⚠️", color: "#9333EA",
      bg: "rgba(147,51,234,0.08)", border: "rgba(147,51,234,0.35)",
      prompt: "What could derail your progress? What must you protect? What risks come from relying on one income?",
      placeholder: "e.g. My job is not secure, I have no savings buffer, health challenges, limited time...",
    },
  ];

  const [entries, setEntries] = React.useState<Record<string, string>>({
    strengths: "", weaknesses: "", opportunities: "", threats: "",
  });
  const [revealed, setRevealed] = React.useState(false);
  const [activeQuad, setActiveQuad] = React.useState<string>("strengths");

  const countItems = (text: string) =>
    text.split(/[,\n]/).filter(t => t.trim().length > 1).length;

  const allFilled = quadrants.every(q => entries[q.key].trim().length > 5);
  const totalItems = quadrants.reduce((sum, q) => sum + countItems(entries[q.key]), 0);

  const activeQ = quadrants.find(q => q.key === activeQuad)!;

  const insights: Record<string, string> = {
    strengths: "These are your launchpad. Every item you listed is a tool the Z2B system can activate immediately.",
    weaknesses: "You just named your growth map. In a community, your weaknesses become partnership opportunities — not disqualifiers.",
    opportunities: "These are income streams hiding in plain sight. You do not need a new idea — you need a new lens on what already exists.",
    threats: "Naming threats is how you neutralise them. Every threat you listed is an argument for building multiple income streams now.",
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #0D0020, #1A0035)",
      border: "2px solid #9333EA", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#C4B5FD", marginBottom: "4px" }}>
        🔎 Your Personal SWOT — A Mirror, Not a Test
      </div>
      <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.6)", marginBottom: "20px", lineHeight: 1.6 }}>
        {firstName}, a mirror does not judge — it simply shows you where you stand. Fill all four quadrants honestly. This is your strategy foundation.
      </div>

      {!revealed ? (
        <>
          {/* Tab selector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px", marginBottom: "16px" }}>
            {quadrants.map(q => (
              <button
                key={q.key}
                onClick={() => setActiveQuad(q.key)}
                style={{
                  background: activeQuad === q.key ? q.bg : "rgba(255,255,255,0.04)",
                  border: `2px solid ${activeQuad === q.key ? q.color : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "10px", padding: "8px 4px", cursor: "pointer",
                  color: activeQuad === q.key ? q.color : "rgba(255,255,255,0.5)",
                  fontSize: "11px", fontWeight: "bold", transition: "all 0.2s",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "16px", marginBottom: "2px" }}>{q.icon}</div>
                <div>{q.label}</div>
                {entries[q.key].trim().length > 5 && (
                  <div style={{ fontSize: "10px", color: q.color, marginTop: "2px" }}>
                    ✓ {countItems(entries[q.key])}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Active quadrant input */}
          <div style={{
            background: activeQ.bg, border: `1px solid ${activeQ.border}`,
            borderRadius: "12px", padding: "16px", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "13px", color: activeQ.color, fontWeight: "bold", marginBottom: "6px" }}>
              {activeQ.icon} {activeQ.label}
            </div>
            <div style={{ fontSize: "12px", color: "rgba(196,181,253,0.7)", marginBottom: "10px", lineHeight: 1.6, fontStyle: "italic" }}>
              {activeQ.prompt}
            </div>
            <textarea
              value={entries[activeQ.key]}
              onChange={e => setEntries(prev => ({ ...prev, [activeQ.key]: e.target.value }))}
              placeholder={activeQ.placeholder}
              rows={3}
              style={{
                width: "100%", background: "rgba(0,0,0,0.3)",
                border: `1px solid ${entries[activeQ.key].trim().length > 5 ? activeQ.color : "rgba(255,255,255,0.1)"}`,
                borderRadius: "8px", padding: "10px 12px",
                color: "#fff", fontSize: "13px", fontFamily: "inherit",
                resize: "none", outline: "none", lineHeight: 1.6,
                boxSizing: "border-box",
              }}
            />
            {entries[activeQ.key].trim().length > 5 && (
              <div style={{ fontSize: "11px", color: activeQ.color, marginTop: "4px" }}>
                ✓ {countItems(entries[activeQ.key])}{countItems(entries[activeQ.key]) !== 1 ? " items" : " item"} · {insights[activeQ.key]}
              </div>
            )}
          </div>

          {/* Progress + submit */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", color: "rgba(196,181,253,0.5)" }}>
              {quadrants.filter(q => entries[q.key].trim().length > 5).length}/4 quadrants completed
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {quadrants.map(q => (
                <div key={q.key} style={{
                  width: "24px", height: "6px", borderRadius: "3px",
                  background: entries[q.key].trim().length > 5 ? q.color : "rgba(255,255,255,0.1)",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
          </div>

          <button
            onClick={() => allFilled && setRevealed(true)}
            disabled={!allFilled}
            style={{
              background: allFilled ? "linear-gradient(135deg, #6B21A8, #9333EA)" : "rgba(255,255,255,0.08)",
              color: allFilled ? "#fff" : "rgba(255,255,255,0.3)",
              border: "none", borderRadius: "10px", padding: "12px 28px",
              fontWeight: "bold", fontSize: "14px",
              cursor: allFilled ? "pointer" : "not-allowed",
            }}
          >
            {allFilled ? "Reveal My Strategy →" : "Complete all 4 quadrants to continue"}
          </button>
        </>
      ) : (
        // Result — SWOT summary
        <div>
          <div style={{ fontSize: "17px", fontWeight: "bold", color: "#C4B5FD", marginBottom: "12px" }}>
            {firstName}, you just built a {totalItems}-point personal strategy map.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            {quadrants.map(q => (
              <div key={q.key} style={{
                background: q.bg, border: `1px solid ${q.border}`,
                borderRadius: "12px", padding: "14px",
              }}>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: q.color, marginBottom: "6px" }}>
                  {q.icon} {q.label} — {countItems(entries[q.key])} items
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                  {entries[q.key].split(/[,\n]/).filter(t => t.trim().length > 1).slice(0, 3).map((item, i) => (
                    <div key={i}>· {item.trim()}</div>
                  ))}
                  {countItems(entries[q.key]) > 3 && (
                    <div style={{ color: q.color, fontSize: "11px", marginTop: "2px" }}>
                      +{countItems(entries[q.key]) - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "12px", padding: "16px", marginBottom: "12px",
          }}>
            <div style={{ fontSize: "13px", color: "#D4AF37", fontStyle: "italic", lineHeight: 1.8 }}>
              "You do not need a business idea to move forward. You need awareness of what already exists.
              {firstName}, you now have that awareness. Your SWOT is your strategy — not a school exercise."
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "#22C55E", fontStyle: "italic" }}>
            🌱 Session 8 — The Vehicle is ready. Time to address the fears that have been holding you back.
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 6 — VISION BOARD GATE ────────────────────────────
function VisionGate({ firstName }: { firstName: string }) {
  const [started, setStarted] = React.useState(false);
  const [oneGoal, setOneGoal] = React.useState("");
  const [horizon, setHorizon] = React.useState<string | null>(null);
  const [committed, setCommitted] = React.useState(false);

  const horizons = [
    { key: "immediate", label: "Immediate Term", range: "Next 90 days", icon: "⚡", color: "#EF4444", desc: "What financial pressure do I need to relieve?" },
    { key: "medium",    label: "Medium Term",    range: "1 to 3 years", icon: "🌱", color: "#22C55E", desc: "What freedom do I want to experience?" },
    { key: "long",      label: "Long Term",      range: "5 to 10 years",icon: "🏆", color: "#D4AF37", desc: "What legacy do I want to leave?" },
  ];

  const isReady = horizon !== null && oneGoal.trim().length > 5;

  const handleCommit = () => {
    if (!isReady) return;
    setCommitted(true);
    // Save mini vision to localStorage for Vision Board page to pick up
    try {
      const existing = JSON.parse(localStorage.getItem("z2b_mini_vision") || "{}");
      existing[horizon!] = oneGoal.trim();
      localStorage.setItem("z2b_mini_vision", JSON.stringify(existing));
    } catch(e) {}
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #1A0035, #0D0020)",
      border: "2px solid #D4AF37", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      {/* Header */}
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#D4AF37", marginBottom: "4px" }}>
        🏆 Vision Before Execution — Your First Declaration
      </div>
      <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.7)", marginBottom: "20px", lineHeight: 1.6 }}>
        {firstName}, Z2B does not move forward without vision. Before Session 7 opens, you will write your first goal.
        This is not homework. This is your declaration.
      </div>

      {!started ? (
        // Intro card before they begin
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {horizons.map(h => (
              <div key={h.key} style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${h.color}40`,
                borderRadius: "12px", padding: "14px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "24px", marginBottom: "6px" }}>{h.icon}</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: h.color, marginBottom: "2px" }}>{h.label}</div>
                <div style={{ fontSize: "11px", color: "rgba(196,181,253,0.5)" }}>{h.range}</div>
              </div>
            ))}
          </div>
          <div style={{
            background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: "12px", padding: "16px", marginBottom: "18px",
          }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontStyle: "italic" }}>
              "Most people approach income reactively — asking what business they can start quickly.
              Z2B begins differently. Before tools. Before companies. Before income streams —
              we begin with <strong style={{ color: "#D4AF37" }}>structured vision.</strong>"
            </div>
          </div>
          <button
            onClick={() => setStarted(true)}
            style={{
              background: "linear-gradient(135deg, #6B21A8, #9333EA)",
              color: "#fff", border: "none", borderRadius: "10px",
              padding: "12px 28px", fontWeight: "bold", fontSize: "14px", cursor: "pointer",
            }}
          >
            I Am Ready To Declare My Vision →
          </button>
        </div>
      ) : !committed ? (
        // Goal writing interface
        <div>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#C4B5FD", marginBottom: "16px" }}>
            Step 1 — Choose your time horizon:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", marginBottom: "20px" }}>
            {horizons.map(h => (
              <div
                key={h.key}
                onClick={() => setHorizon(h.key)}
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  background: horizon === h.key ? `${h.color}18` : "rgba(255,255,255,0.03)",
                  border: `2px solid ${horizon === h.key ? h.color : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "12px", padding: "14px 16px", cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "22px" }}>{h.icon}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: horizon === h.key ? h.color : "#fff" }}>
                    {h.label} — {h.range}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(196,181,253,0.6)", marginTop: "2px" }}>{h.desc}</div>
                </div>
                {horizon === h.key && (
                  <div style={{ marginLeft: "auto", color: h.color, fontSize: "18px" }}>✓</div>
                )}
              </div>
            ))}
          </div>

          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#C4B5FD", marginBottom: "10px" }}>
            Step 2 — Write your goal in one sentence:
          </div>
          <textarea
            value={oneGoal}
            onChange={e => setOneGoal(e.target.value)}
            placeholder={
              horizon === "immediate" ? "e.g. I want to earn an extra R2,000/month to cover my grocery bill..."
              : horizon === "medium" ? "e.g. I want to own a reliable car and have R5,000/month in passive income..."
              : horizon === "long" ? "e.g. I want to own property and leave my children a financial foundation..."
              : "Choose a time horizon above first..."
            }
            rows={3}
            style={{
              width: "100%", background: "rgba(255,255,255,0.05)",
              border: `1px solid ${oneGoal.trim().length > 5 ? "#D4AF37" : "rgba(255,255,255,0.15)"}`,
              borderRadius: "10px", padding: "12px 14px",
              color: "#fff", fontSize: "13px", fontFamily: "inherit",
              resize: "none", outline: "none", lineHeight: 1.7,
              boxSizing: "border-box",
            }}
          />
          <div style={{ fontSize: "11px", color: "rgba(196,181,253,0.5)", marginTop: "6px", marginBottom: "16px" }}>
            {oneGoal.trim().length > 5
              ? "✓ Your vision is taking shape. This will be saved to your Vision Board."
              : "Be specific. The more specific your vision, the more powerful it becomes."}
          </div>

          <button
            onClick={handleCommit}
            disabled={!isReady}
            style={{
              background: isReady ? "linear-gradient(135deg, #B8860B, #D4AF37)" : "rgba(255,255,255,0.1)",
              color: isReady ? "#000" : "rgba(255,255,255,0.3)",
              border: "none", borderRadius: "10px", padding: "13px 32px",
              fontWeight: "bold", fontSize: "14px",
              cursor: isReady ? "pointer" : "not-allowed",
            }}
          >
            🏆 Declare My Vision
          </button>
        </div>
      ) : (
        // Committed state — vision locked in
        <div>
          <div style={{
            background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.4)",
            borderRadius: "12px", padding: "20px", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "11px", color: "#D4AF37", letterSpacing: "1px", marginBottom: "6px" }}>
              {firstName.toUpperCase()}&apos;S VISION — DECLARED
            </div>
            <div style={{
              fontSize: "16px", color: "#fff", fontStyle: "italic",
              lineHeight: 1.7, borderLeft: "3px solid #D4AF37", paddingLeft: "14px",
            }}>
              "{oneGoal}"
            </div>
            <div style={{ marginTop: "10px", fontSize: "12px", color: "rgba(196,181,253,0.6)" }}>
              {horizons.find(h => h.key === horizon)?.icon} {horizons.find(h => h.key === horizon)?.label} · {horizons.find(h => h.key === horizon)?.range}
            </div>
          </div>

          <div style={{
            background: "rgba(147,51,234,0.1)", border: "1px solid rgba(147,51,234,0.3)",
            borderRadius: "12px", padding: "16px", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "13px", color: "#C4B5FD", lineHeight: 1.8 }}>
              {firstName}, your Vision Board is now live at{" "}
              <a href="/vision-board" style={{ color: "#D4AF37", fontWeight: "bold" }}>
                your Vision Board
              </a>
              {" "}— where this goal has been pre-loaded. After Session 9, you will complete all 9 cells.
              For now, your declaration is made. The ground has been broken.
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "10px", padding: "12px 16px",
          }}>
            <span style={{ fontSize: "20px" }}>🌱</span>
            <div style={{ fontSize: "12px", color: "#22C55E", lineHeight: 1.6 }}>
              Your vision has been recorded. Session 7 is now unlocked — From SWOT to Opportunity.
              You are about to turn your reality into your strategy.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 5 — COMMUNITY PREVIEW ────────────────────────────
function CommunityPreview({ firstName }: { firstName: string }) {
  const [seatChosen, setSeatChosen] = React.useState<string | null>(null);

  const members = [
    { name: "Thandi M.", role: "Teacher, Soweto", tag: "Session 34", avatar: "👩🏾‍🏫", income: "R3,200/mo extra", joined: "4 months ago" },
    { name: "Sipho K.", role: "Security Guard, Joburg", tag: "Session 61", avatar: "👨🏿‍💼", income: "R6,800/mo extra", joined: "7 months ago" },
    { name: "Nomsa D.", role: "Admin Clerk, Pretoria", tag: "Session 19", avatar: "👩🏽‍💻", income: "R1,400/mo extra", joined: "2 months ago" },
    { name: "David L.", role: "Driver, Durban", tag: "Session 78", avatar: "👨🏾‍🚗", income: "R11,500/mo extra", joined: "11 months ago" },
    { name: "Precious N.", role: "Nurse, Cape Town", tag: "Session 45", avatar: "👩🏿‍⚕️", income: "R5,100/mo extra", joined: "6 months ago" },
    { name: "You", role: firstName + ", your seat is open", tag: "Session 1", avatar: "🪑", income: "Your journey begins", joined: "Today" },
  ];

  const tableValues = [
    { icon: "📚", label: "Education First", desc: "Every member learns before they earn" },
    { icon: "🤝", label: "Trust Before Transactions", desc: "Relationships are built before business" },
    { icon: "🌍", label: "Community Leverage", desc: "What one cannot do alone, many can do together" },
    { icon: "🔁", label: "Duplication Over Hustle", desc: "Systems work even when you sleep" },
  ];

  return (
    <div style={{
      background: "linear-gradient(135deg, #0D0020, #1A0035)",
      border: "2px solid #D4AF37", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#D4AF37", marginBottom: "4px" }}>
        🏛️ A Seat Has Been Reserved For You
      </div>
      <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.7)", marginBottom: "20px", lineHeight: 1.6 }}>
        {firstName}, the Z2B Table is already full of people just like you — employees who decided to stop watching and start building. Here is who is already seated:
      </div>

      {/* Member cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        {members.map((m, i) => {
          const isYou = m.name === "You";
          return (
            <div
              key={i}
              onClick={() => isYou && setSeatChosen("yes")}
              style={{
                background: isYou
                  ? seatChosen ? "rgba(212,175,55,0.15)" : "rgba(212,175,55,0.07)"
                  : "rgba(255,255,255,0.04)",
                border: isYou ? "2px dashed #D4AF37" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "14px",
                cursor: isYou ? "pointer" : "default",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "26px", marginBottom: "6px" }}>{m.avatar}</div>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: isYou ? "#D4AF37" : "#fff", marginBottom: "2px" }}>
                {m.name}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(196,181,253,0.6)", marginBottom: "6px" }}>{m.role}</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span style={{
                  background: isYou ? "rgba(212,175,55,0.2)" : "rgba(147,51,234,0.2)",
                  color: isYou ? "#D4AF37" : "#C4B5FD",
                  fontSize: "10px", padding: "2px 8px", borderRadius: "10px",
                }}>{m.tag}</span>
                <span style={{
                  background: "rgba(34,197,94,0.15)", color: "#22C55E",
                  fontSize: "10px", padding: "2px 8px", borderRadius: "10px",
                }}>{m.income}</span>
              </div>
              {isYou && !seatChosen && (
                <div style={{ marginTop: "8px", fontSize: "11px", color: "#D4AF37", fontStyle: "italic" }}>
                  👆 Tap to take your seat
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Table values */}
      <div style={{
        background: "rgba(0,0,0,0.3)", borderRadius: "12px",
        padding: "16px", marginBottom: "16px",
      }}>
        <div style={{ fontSize: "12px", color: "#D4AF37", fontWeight: "bold", letterSpacing: "1px", marginBottom: "12px" }}>
          WHAT THE TABLE STANDS FOR
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {tableValues.map((v, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{v.icon}</span>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", marginBottom: "2px" }}>{v.label}</div>
                <div style={{ fontSize: "11px", color: "rgba(196,181,253,0.6)", lineHeight: 1.5 }}>{v.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seat chosen response */}
      {seatChosen ? (
        <div style={{
          background: "rgba(212,175,55,0.1)",
          border: "1px solid rgba(212,175,55,0.4)",
          borderRadius: "12px", padding: "18px",
        }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#D4AF37", marginBottom: "8px" }}>
            {firstName}, your seat is confirmed. 🏆
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.8, marginBottom: "10px" }}>
            Every person at this table was once exactly where you are right now — reading, learning, wondering if this is real.
            The only difference between them and where you sit today is that they kept going.
            Session 6 is where your Vision Board begins. That is where everything becomes personal.
          </div>
          <div style={{ fontSize: "12px", color: "#D4AF37", fontStyle: "italic" }}>
            🌱 The ground is being prepared. Session 6 — Vision Before Execution — is waiting for you.
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.6)", fontStyle: "italic" }}>
            Tap your seat card above to claim your place at the table, {firstName}.
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 4 — HIDDEN ASSET AUDIT ───────────────────────────
function AssetAudit({ firstName }: { firstName: string }) {
  const categories = [
    {
      key: "skills",
      icon: "🛠️",
      label: "MY SKILLS",
      color: "#9333EA",
      border: "rgba(147,51,234,0.4)",
      placeholder: "e.g. Communication, Excel, Driving, Cooking, Teaching...",
      hint: "What do people come to you for? What do you do well at work or home?",
    },
    {
      key: "networks",
      icon: "🤝",
      label: "MY NETWORKS",
      color: "#0EA5E9",
      border: "rgba(14,165,233,0.4)",
      placeholder: "e.g. Church community, Work colleagues, School parents, WhatsApp groups...",
      hint: "Who do you have access to? Who trusts you?",
    },
    {
      key: "routines",
      icon: "⏰",
      label: "MY ROUTINES",
      color: "#22C55E",
      border: "rgba(34,197,94,0.4)",
      placeholder: "e.g. Early riser, Weekend free, Lunch breaks, School run...",
      hint: "When do you have predictable windows of time or energy?",
    },
    {
      key: "knowledge",
      icon: "🧠",
      label: "MY KNOWLEDGE",
      color: "#D4AF37",
      border: "rgba(212,175,55,0.4)",
      placeholder: "e.g. Industry experience, Local area knowledge, Parenting, Finance basics...",
      hint: "What do you know that others in your circle do not?",
    },
  ];

  const [entries, setEntries] = React.useState<Record<string, string>>({
    skills: "", networks: "", routines: "", knowledge: "",
  });
  const [revealed, setRevealed] = React.useState(false);

  const totalWords = Object.values(entries).join(" ").trim().split(/\s+/).filter(w => w.length > 0).length;
  const isReady = Object.values(entries).every(v => v.trim().length > 3);

  const countItems = (text: string) =>
    text.split(/[,\n]/).filter(t => t.trim().length > 1).length;

  const totalItems = Object.values(entries).reduce((sum, v) => sum + countItems(v), 0);

  return (
    <div style={{
      background: "linear-gradient(135deg, #0D0020, #1A0035)",
      border: "2px solid #D4AF37", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#D4AF37", marginBottom: "6px" }}>
        💎 Your Hidden Asset Audit
      </div>
      <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.7)", marginBottom: "20px", lineHeight: 1.6 }}>
        {firstName}, before you look for opportunity outside — look at what you already carry.
        Fill in at least 3 items in each category. Be honest. Be specific.
      </div>

      {categories.map(cat => (
        <div key={cat.key} style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "18px" }}>{cat.icon}</span>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: cat.color, letterSpacing: "1px" }}>
              {cat.label}
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "rgba(196,181,253,0.5)", marginBottom: "6px", paddingLeft: "26px" }}>
            {cat.hint}
          </div>
          <textarea
            value={entries[cat.key]}
            onChange={e => setEntries(prev => ({ ...prev, [cat.key]: e.target.value }))}
            placeholder={cat.placeholder}
            rows={2}
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)",
              border: `1px solid ${entries[cat.key].trim().length > 3 ? cat.color : "rgba(255,255,255,0.1)"}`,
              borderRadius: "10px", padding: "10px 12px",
              color: "#fff", fontSize: "13px", fontFamily: "inherit",
              resize: "none", outline: "none", lineHeight: 1.6,
              boxSizing: "border-box",
            }}
          />
          {entries[cat.key].trim().length > 3 && (
            <div style={{ fontSize: "11px", color: cat.color, marginTop: "3px", paddingLeft: "4px" }}>
              ✓ {countItems(entries[cat.key])}{countItems(entries[cat.key]) !== 1 ? " items" : " item"} identified
            </div>
          )}
        </div>
      ))}

      {!revealed ? (
        <button
          onClick={() => isReady && setRevealed(true)}
          disabled={!isReady}
          style={{
            marginTop: "8px",
            background: isReady ? "linear-gradient(135deg, #B8860B, #D4AF37)" : "rgba(255,255,255,0.1)",
            color: isReady ? "#000" : "rgba(255,255,255,0.3)",
            border: "none", borderRadius: "10px", padding: "12px 28px",
            fontWeight: "bold", fontSize: "14px",
            cursor: isReady ? "pointer" : "not-allowed",
          }}
        >
          {isReady ? "Reveal My Capital →" : "Fill in all 4 categories to continue"}
        </button>
      ) : (
        <div style={{
          marginTop: "16px", background: "rgba(212,175,55,0.08)",
          border: "1px solid rgba(212,175,55,0.35)",
          borderRadius: "12px", padding: "20px",
        }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#D4AF37", marginBottom: "8px" }}>
            {firstName}, you just mapped {totalItems} capital assets.
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.8, marginBottom: "14px" }}>
            Every item you wrote down is something a community-based business model can leverage.
            Your skills are your service. Your networks are your market. Your routines are your schedule.
            Your knowledge is your edge. You did not arrive here empty-handed.
            {totalItems >= 10
              ? " You are sitting on a goldmine of untapped capital. The only thing missing was the system to activate it."
              : totalItems >= 6
              ? " You have more than enough to begin. Most successful builders started with less than what you have listed here."
              : " Even these few items, when placed inside the right system, can generate your first income stream."}
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px",
          }}>
            {categories.map(cat => (
              <div key={cat.key} style={{
                background: "rgba(0,0,0,0.3)", borderRadius: "8px",
                padding: "10px 12px", borderLeft: `3px solid ${cat.color}`,
              }}>
                <div style={{ fontSize: "11px", color: cat.color, fontWeight: "bold", marginBottom: "2px" }}>
                  {cat.icon} {cat.label}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                  {countItems(entries[cat.key])}{countItems(entries[cat.key]) !== 1 ? " assets" : " asset"} identified
                </div>
              </div>
            ))}
          </div>
          <div style={{
            background: "rgba(0,0,0,0.3)", borderRadius: "10px",
            padding: "12px 16px", borderLeft: "3px solid #D4AF37",
          }}>
            <div style={{ fontSize: "13px", color: "#D4AF37", fontStyle: "italic", lineHeight: 1.7 }}>
              "You do not need a business idea to move forward. You need a new way of seeing yourself in the economy. You just took that step."
            </div>
          </div>
          <div style={{ marginTop: "12px", fontSize: "12px", color: "#22C55E", fontStyle: "italic" }}>
            🌱 Session 5 will show you the table where all these assets come together.
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 3 — IDENTITY SELECTOR ────────────────────────────
function IdentitySelector({ firstName }: { firstName: string }) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const [currentGoal, setCurrentGoal] = React.useState<number | null>(null);
  const [stage, setStage] = React.useState<"pick" | "goal" | "result">("pick");

  const identities = [
    {
      id: 0,
      icon: "👤",
      label: "The Consumer",
      color: "#6B7280",
      border: "rgba(107,114,128,0.4)",
      bg: "rgba(107,114,128,0.08)",
      desc: "I earn. I spend. My income goes to bills and lifestyle. I have no ownership in the value I create.",
      truth: "This is where most people start. There is no shame here — only awareness.",
    },
    {
      id: 1,
      icon: "⚡",
      label: "The Entrepreneurial Consumer",
      color: "#D4AF37",
      border: "rgba(212,175,55,0.5)",
      bg: "rgba(212,175,55,0.08)",
      desc: "I earn income AND I am beginning to redirect my spending toward systems that flow value back to me.",
      truth: "This is the missing identity. The one you were never taught. The one Z2B was built for.",
    },
    {
      id: 2,
      icon: "🚀",
      label: "The Entrepreneur",
      color: "#9333EA",
      border: "rgba(147,51,234,0.4)",
      bg: "rgba(147,51,234,0.08)",
      desc: "I build products, services or systems. I take on risk and operate under uncertainty in exchange for ownership.",
      truth: "You have taken the leap. Now Z2B will help you build the systems to sustain and scale it.",
    },
  ];

  const results: Record<string, { heading: string; body: string; challenge: string }> = {
    "0-0": {
      heading: "Awareness is the first step, " + firstName + ".",
      body: "You are honest — and that honesty is rare. Most people live as consumers without ever questioning it. You have just named your current reality. That is more powerful than it sounds. The Consumer identity is not a life sentence. It is a starting point. Z2B was built to move you from here.",
      challenge: "Your challenge: In the next 24 hours, identify ONE monthly expense that could potentially flow value back to you if redirected strategically.",
    },
    "0-1": {
      heading: firstName + ", you are closer than you think.",
      body: "You are currently a Consumer but your heart is already reaching toward the Entrepreneurial Consumer identity. That gap — between where you are and where you want to be — is exactly what this workshop closes. Session by session. Day by day.",
      challenge: "Your challenge: Write down what makes you feel that the Entrepreneurial Consumer identity is possible for you. That feeling is your seed.",
    },
    "0-2": {
      heading: "Big vision, " + firstName + ". Let us build the bridge.",
      body: "You are a Consumer today but you see yourself as a full Entrepreneur. That is a bold and worthy goal. Z2B recommends not skipping the Entrepreneurial Consumer stage — it builds the skills, income, and community you will need to sustain entrepreneurship long term.",
      challenge: "Your challenge: Before you build a business, build a network. That network becomes your first market.",
    },
    "1-1": {
      heading: firstName + ", you are already in motion.",
      body: "You have chosen the Entrepreneurial Consumer identity NOW and in the FUTURE. This is the power position. You are not waiting to quit your job. You are not gambling everything. You are building ownership strategically while your employment provides stability. This is exactly the Z2B way.",
      challenge: "Your challenge: Name ONE system you are currently building or redirecting income toward. If you cannot name it yet — that is what Sessions 4 to 9 will unlock.",
    },
    "1-2": {
      heading: "You are on the right path, " + firstName + ".",
      body: "You are an Entrepreneurial Consumer growing toward full Entrepreneurship. This is the natural Z2B progression. Build your consumer network first. Let it generate income. Let that income fund your entrepreneurial ambitions. Never burn the bridge that feeds you.",
      challenge: "Your challenge: What entrepreneurial idea are you already sitting on? Write it down. The next 6 sessions will show you how to test it without quitting your job.",
    },
    "2-2": {
      heading: firstName + ", the table is already yours.",
      body: "You are an Entrepreneur and you want to remain one. Z2B will help you scale what you have built by adding the Entrepreneurial Consumer model as a distribution and duplication engine. Your next level is not another hustle — it is a system that grows without you.",
      challenge: "Your challenge: How many people in your network are potential Entrepreneurial Consumers who could distribute your products or expand your reach? That number is your next growth target.",
    },
  };

  const getResult = () => {
    const key = selected + "-" + currentGoal;
    return results[key] || results["0-1"];
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #1A0035, #0D0020)",
      border: "2px solid #9333EA", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#C4B5FD", marginBottom: "6px" }}>
        🪪 Which Identity Are You Living Right Now?
      </div>
      <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.6)", marginBottom: "20px" }}>
        Be honest. This is not a test — it is a mirror.
      </div>

      {/* Stage 1 — Pick current identity */}
      {stage === "pick" && (
        <>
          {identities.map(id => (
            <div
              key={id.id}
              onClick={() => setSelected(id.id)}
              style={{
                background: selected === id.id ? id.bg : "rgba(255,255,255,0.03)",
                border: `2px solid ${selected === id.id ? id.color : "rgba(255,255,255,0.08)"}`,
                borderRadius: "14px", padding: "16px 18px", marginBottom: "12px",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                <span style={{ fontSize: "22px" }}>{id.icon}</span>
                <span style={{ fontSize: "15px", fontWeight: "bold", color: id.color }}>{id.label}</span>
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, paddingLeft: "34px" }}>
                {id.desc}
              </div>
            </div>
          ))}
          <button
            onClick={() => selected !== null && setStage("goal")}
            disabled={selected === null}
            style={{
              marginTop: "8px",
              background: selected !== null ? "linear-gradient(135deg, #6B21A8, #9333EA)" : "rgba(255,255,255,0.1)",
              color: selected !== null ? "#fff" : "rgba(255,255,255,0.3)",
              border: "none", borderRadius: "10px", padding: "12px 28px",
              fontWeight: "bold", fontSize: "14px",
              cursor: selected !== null ? "pointer" : "not-allowed",
            }}
          >
            This Is Me Today →
          </button>
        </>
      )}

      {/* Stage 2 — Pick goal identity */}
      {stage === "goal" && (
        <>
          <div style={{ fontSize: "14px", color: "#C4B5FD", marginBottom: "16px", fontWeight: "bold" }}>
            Now — which identity do you want to grow INTO in the next 12 months?
          </div>
          {identities.map(id => (
            <div
              key={id.id}
              onClick={() => setCurrentGoal(id.id)}
              style={{
                background: currentGoal === id.id ? id.bg : "rgba(255,255,255,0.03)",
                border: `2px solid ${currentGoal === id.id ? id.color : "rgba(255,255,255,0.08)"}`,
                borderRadius: "14px", padding: "14px 18px", marginBottom: "10px",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>{id.icon}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: id.color }}>{id.label}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{id.truth}</div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => currentGoal !== null && setStage("result")}
            disabled={currentGoal === null}
            style={{
              marginTop: "8px",
              background: currentGoal !== null ? "linear-gradient(135deg, #B8860B, #D4AF37)" : "rgba(255,255,255,0.1)",
              color: currentGoal !== null ? "#000" : "rgba(255,255,255,0.3)",
              border: "none", borderRadius: "10px", padding: "12px 28px",
              fontWeight: "bold", fontSize: "14px",
              cursor: currentGoal !== null ? "pointer" : "not-allowed",
            }}
          >
            Show Me My Path →
          </button>
        </>
      )}

      {/* Stage 3 — Personalised result */}
      {stage === "result" && (
        <div style={{
          background: "rgba(212,175,55,0.07)",
          border: "1px solid rgba(212,175,55,0.3)",
          borderRadius: "12px", padding: "20px",
        }}>
          <div style={{ fontSize: "17px", fontWeight: "bold", color: "#D4AF37", marginBottom: "10px" }}>
            {getResult().heading}
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.8, marginBottom: "16px" }}>
            {getResult().body}
          </div>
          <div style={{
            background: "rgba(0,0,0,0.3)", borderRadius: "10px",
            padding: "14px 16px", marginBottom: "12px",
            borderLeft: "3px solid #D4AF37",
          }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px", letterSpacing: "1px" }}>YOUR 24-HOUR CHALLENGE</div>
            <div style={{ fontSize: "13px", color: "#fff", lineHeight: 1.7 }}>{getResult().challenge}</div>
          </div>
          <div style={{ fontSize: "12px", color: "#D4AF37", fontStyle: "italic" }}>
            🌱 The seed has been planted. Session 4 will show you the assets you already own.
          </div>
        </div>
      )}
    </div>
  );
}

// ── SESSION 2 — MONTH CHECK QUIZ ─────────────────────────────
function MonthCheckQuiz({ firstName }: { firstName: string }) {
  const [selected, setSelected] = React.useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const expenses = [
    { label: "Rent / Bond", emoji: "🏠" },
    { label: "Transport / Petrol", emoji: "🚗" },
    { label: "Groceries", emoji: "🛒" },
    { label: "School fees / Kids", emoji: "🎒" },
    { label: "Electricity / Water", emoji: "💡" },
    { label: "Data / Airtime", emoji: "📱" },
    { label: "Insurance", emoji: "🛡️" },
    { label: "Clothing accounts", emoji: "👗" },
    { label: "Medical / Pharmacy", emoji: "💊" },
    { label: "Entertainment / DStv", emoji: "📺" },
  ];

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const totalEstimate = selectedCount * 1200; // rough R1,200 avg per category

  return (
    <div style={{
      background: "linear-gradient(135deg, #0D1F0D, #0A2010)",
      border: "2px solid #22C55E", borderRadius: "16px",
      padding: "24px", margin: "24px 0",
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#22C55E", marginBottom: "6px" }}>
        💸 Does This Sound Like Your Month?
      </div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "20px" }}>
        Tick every expense that leaves your account before month-end:
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        {expenses.map((exp, i) => (
          <div
            key={i}
            onClick={() => !submitted && setSelected(prev => ({ ...prev, [i]: !prev[i] }))}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: selected[i] ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${selected[i] ? "#22C55E" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "10px", padding: "10px 12px", cursor: submitted ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{
              width: "20px", height: "20px", borderRadius: "5px", flexShrink: 0,
              background: selected[i] ? "#22C55E" : "rgba(255,255,255,0.1)",
              border: `2px solid ${selected[i] ? "#22C55E" : "rgba(255,255,255,0.3)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: "bold", color: "#000",
            }}>
              {selected[i] ? "✓" : ""}
            </div>
            <span style={{ fontSize: "13px", color: "#fff" }}>{exp.emoji} {exp.label}</span>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={selectedCount === 0}
          style={{
            background: selectedCount > 0 ? "linear-gradient(135deg, #15803D, #22C55E)" : "rgba(255,255,255,0.1)",
            color: selectedCount > 0 ? "#000" : "rgba(255,255,255,0.4)",
            border: "none", borderRadius: "10px", padding: "12px 28px",
            fontWeight: "bold", fontSize: "14px",
            cursor: selectedCount > 0 ? "pointer" : "not-allowed",
          }}
        >
          Show Me My Reality
        </button>
      ) : (
        <div style={{
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.4)",
          borderRadius: "12px", padding: "20px",
        }}>
          <div style={{ fontSize: "22px", fontWeight: "bold", color: "#22C55E", marginBottom: "8px" }}>
            {firstName}, you ticked {selectedCount} out of 10 expenses.
          </div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, marginBottom: "12px" }}>
            That is roughly <strong style={{ color: "#22C55E" }}>R{totalEstimate.toLocaleString()}+</strong> flowing
            OUT of your account every month — to companies you will never own a share of.
            {selectedCount >= 7
              ? " You are not spending recklessly. You are funding the economy without participating in its rewards."
              : selectedCount >= 4
              ? " Every rand you spend makes someone else wealthy. The question is — when does it start making YOU wealthy?"
              : " Even a few of these categories represent thousands of rands leaving your hands every month with no return."}
          </div>
          <div style={{
            background: "rgba(0,0,0,0.3)", borderRadius: "10px",
            padding: "14px 16px", marginBottom: "12px",
          }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>The question Z2B asks:</div>
            <div style={{ fontSize: "15px", color: "#D4AF37", fontWeight: "bold", fontStyle: "italic" }}>
              "What if even ONE of these monthly expenses could flow value BACK to you?"
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "#22C55E", fontStyle: "italic" }}>
            Continue to Session 3 — you are about to discover the identity that changes everything.
          </div>
        </div>
      )}
    </div>
  );
}

function WorkshopInner() {
  const searchParams = useSearchParams();
  // ── Email gate — set on first visit, persists in localStorage ──
  const [workshopEmail, setWorkshopEmail] = useState<string | null>(() => {
    try { return localStorage.getItem("z2b_workshop_email") || null; } catch { return null; }
  });
  const [view, setView]                     = useState<ViewType>("home");
  const [progress, setProgress]             = useState<ProgressMap>(createInitialProgress);
  const [currentSection, setCurrentSection] = useState<number | null>(null);
  const [answers, setAnswers]               = useState<Record<number, number>>({});
  const [submitted, setSubmitted]           = useState(false);
  const [score, setScore]                   = useState<number | null>(null);
  const [activityTicked, setActivityTicked] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [showShareCard, setShowShareCard]   = useState(false);
  const [showAudio, setShowAudio]           = useState(false);
  // ── ADDITION 2a: userId + referralCode state ──
  const [userId, setUserId]                 = useState<string | null>(null);
  const [builderRef, setBuilderRef]         = useState<string | null>(null);
  // ── Welcome overlay state ──
  const [showWelcome, setShowWelcome]       = useState(false);
  const [inviterName, setInviterName]       = useState("");
  const [urlRef, setUrlRef]                 = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── COACH MANLAW STATE ──
  const [manlawOpen, setManlawOpen]           = useState(false);
  const [manlawInput, setManlawInput]         = useState("");
  const [manlawMessages, setManlawMessages]   = useState<{role:"user"|"manlaw", text:string}[]>([]);
  const [manlawLoading, setManlawLoading]     = useState(false);
  const manlawEndRef = useRef<HTMLDivElement>(null);
  const [manlawMemberName, setManlawMemberName] = useState<string | null>(null);
  const [referredBy, setReferredBy]             = useState<string | null>(null);

  // Capture ?ref= referral code from URL
  useEffect(() => {
    const ref = searchParams ? searchParams.get("ref") : null;
    if (ref) {
      setReferredBy(ref);
      try { localStorage.setItem("z2b_ref", ref); } catch(e) {}
    } else {
      try {
        const stored = localStorage.getItem("z2b_ref");
        if (stored) setReferredBy(stored);
      } catch(e) {}
    }
  }, [searchParams]);
  const [manlawAskedName, setManlawAskedName]   = useState(false);

  const section        = currentSection != null ? SECTIONS.find((s) => s.id === currentSection) ?? null : null;
  const completedCount = (Object.values(progress) as SectionProgress[]).filter((p) => p.completed).length;
  const freeCompleted  = SECTIONS.filter((s) => s.free && progress[s.id]?.completed).length;

  // ── ADDITION 2b: Load saved progress from Supabase on mount ──
  useEffect(() => {
    // Check URL for referral code and show welcome overlay
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      setUrlRef(refCode);
      // Fetch builder name
      supabase
        .from("profiles")
        .select("full_name")
        .eq("referral_code", refCode)
        .single()
        .then(({ data }) => {
          if (data?.full_name) {
            setInviterName(data.full_name);
            setShowWelcome(true);
          }
        });
    }

    const loadProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // guest — use in-memory progress only
        setUserId(user.id);

        // Fetch builder's referral code for share links
        const { data: profileData } = await supabase
          .from("profiles")
          .select("referral_code, full_name")
          .eq("id", user.id)
          .single();
        if (profileData?.referral_code) setBuilderRef(profileData.referral_code);

        // Fetch member first name for Coach Manlaw personalisation
        if (profileData?.full_name) {
          const firstName = profileData.full_name.trim().split(" ")[0];
          setManlawMemberName(firstName);
        }
        const { data, error } = await supabase
          .from("workshop_progress")
          .select("*")
          .eq("user_id", user.id);
        if (error || !data) return;
        setProgress((prev) => {
          const updated = { ...prev };
          data.forEach((row: any) => {
            updated[row.section_id] = {
              read:         row.read,
              answers:      {},
              activityDone: row.activity_done,
              completed:    row.completed,
              score:        row.score,
            };
          });
          return updated;
        });
      } catch (err) {
        console.error("Workshop progress load error:", err);
      }
    };
    loadProgress();
  }, []);

  // ---- scroll detection ----
  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 40) setScrolledToBottom(true);
  };

  // ---- open a section ----
  const openSection = (id: number) => {
    const sec = SECTIONS.find((s) => s.id === id);
    if (!sec) return;
    if (!sec.free) { setView("paywall"); return; }
    if (id > 1 && !progress[id - 1]?.completed) return;
    setCurrentSection(id);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setActivityTicked(progress[id]?.activityDone ?? false);
    setScrolledToBottom(progress[id]?.read ?? false);
    setView("section");
    window.scrollTo(0, 0);
  };

  const isSectionUnlocked = (id: number): boolean => {
    const sec = SECTIONS.find((s) => s.id === id);
    if (!sec || !sec.free) return false;
    if (id === 1) return true;
    return progress[id - 1]?.completed ?? false;
  };

  // ---- quiz ----
  const handleAnswer = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev: Record<number, number>) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    if (!section || Object.keys(answers).length < 5) return;
    let correct = 0;
    section.questions.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    setScore(correct);
    setSubmitted(true);
  };

  // ── ADDITION 3: handleComplete saves to Supabase ──
  const handleComplete = async () => {
    if (!scrolledToBottom || score == null || !activityTicked || currentSection == null) return;
    setProgress((prev: ProgressMap) => ({
      ...prev,
      [currentSection]: { read: true, answers, activityDone: true, completed: true, score },
    }));
    // Save to Supabase if logged in
    if (userId) {
      try {
        await supabase
          .from("workshop_progress")
          .upsert(
            {
              user_id:       userId,
              section_id:    currentSection,
              read:          true,
              activity_done: true,
              completed:     true,
              score:         score,
              completed_at:  new Date().toISOString(),
              updated_at:    new Date().toISOString(),
            },
            { onConflict: "user_id,section_id" }
          );

        // ── GroundBreaker milestone hooks ──────────────────────────
        // Upsert prospect milestone row on Session 1
        if (currentSection === 1) {
          const ref = localStorage.getItem("z2b_ref") || null;
          await supabase.from("prospect_milestones").upsert(
            { user_id: userId, referred_by: ref, session_1_started_at: new Date().toISOString() },
            { onConflict: "user_id" }
          );
        }
        // Session 3 — Seed alert
        if (currentSection === 3) {
          await supabase.from("prospect_milestones")
            .update({ session_3_completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("user_id", userId);
        }
        // Session 6 — Vision alert
        if (currentSection === 6) {
          await supabase.from("prospect_milestones")
            .update({ session_6_completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("user_id", userId);
        }
        // Session 9 — Harvest Ready alert
        if (currentSection === 9) {
          await supabase.from("prospect_milestones")
            .update({ session_9_completed_at: new Date().toISOString(), harvest_ready: true, updated_at: new Date().toISOString() })
            .eq("user_id", userId);
        }
        // ──────────────────────────────────────────────────────────

      } catch (err) {
        console.error("Workshop progress save error:", err);
      }
    }
    setView("results");
    // Auto-open Coach Manlaw after section complete
    if (section) {
      setTimeout(() => openManlawAfterSection(section.title, currentSection), 800);
    }
  };

  // ── COACH MANLAW: auto-open after section completion ──
  const openManlawAfterSection = (sectionTitle: string, sectionId: number) => {
    const openingPrompt = `You have just completed Session ${sectionId} — "${sectionTitle}". Coach Manlaw wants to check in with you.`;
    setManlawMessages([{ role: "manlaw", text: openingPrompt }]);
    setManlawOpen(true);
    setTimeout(() => callManlaw(
      `The member just completed Session ${sectionId} titled "${sectionTitle}". Ask them how this session landed for them. Use your full coaching voice — be specific to this section, not generic. Keep your opening response to 3-4 sentences maximum.`,
      []
    ), 400);
  };

  // ── COACH MANLAW: core API call ──
  const callManlaw = async (userMessage: string, history: {role:"user"|"manlaw", text:string}[]) => {
    setManlawLoading(true);
    const sec = currentSection != null ? SECTIONS.find(s => s.id === currentSection) : null;

    const memberName = manlawMemberName;
    const systemPrompt = `You are Coach Manlaw — the personal AI business coach of Z2B Table Banquet, created by Rev Mokoro Manana, Founder of Zero2Billionaires.

YOUR IDENTITY
You are not a chatbot. You are not a customer service agent. You are a wise, direct, faith-aware business mentor who has sat at the table with people who started with nothing and built legacies. You coach with depth, precision, and genuine care for the person in front of you.

YOUR MISSION
To transform employees and consumers into Entrepreneurial Consumers — people who redirect their spending into systems, build networks with purpose, and create legacies that outlive them. You guide each member through the Z2B 4-Leg Blueprint: Mindset (Copper), Systems (Silver), Relationships (Gold), Legacy (Platinum).

YOUR FIVE COACHING LAWS
LAW 1 — VALUE AT SCALE: Wealth is a reward for solving problems at scale. Redirect members from "how do I earn more" to "what problem can I solve for more people."
LAW 2 — REMARKABILITY: Being good is invisible. Being safe is fatal. Challenge members to ask what makes their presence, message, and invitation impossible to ignore. Average thinking is the one thing you will never tolerate.
LAW 3 — STEWARDSHIP: Before more is given, faithfulness with what exists must be demonstrated. Connect every action back to faithful stewardship.
LAW 4 — SYSTEMS OVER HUSTLE: If income stops when they stop working, they have a job not a business. Always move members toward building scalable systems.
LAW 5 — TRIBE BEFORE MARKET: Help members find their specific tribe — the people already looking for them — and serve that tribe so deeply that revenue becomes inevitable.

YOUR VOICE
- Wise mentor, not a cheerleader. Affirm growth, not effort for its own sake.
- Faith-aware, not preachy. Honour kingdom principles when relevant. Plant seeds, never sermons.
- Direct, not harsh. Tell the whole truth with warmth and precision.
- Hopeful, not fake. Ground hope in evidence and action — never empty positivity.
- Globally minded. South Africa is the launchpad, not the limit.
${memberName ? `- The member's name is ${memberName}. Use their name naturally — not in every sentence, but enough that they feel seen and known. Greet them by name in your first response.` : "- You do not yet know this member's name. Focus on coaching first. After your opening response, warmly ask for their name so you can address them personally."}

WHAT YOU NEVER DO
- Never give generic advice that could apply to anyone. Every response must feel written for this specific person.
- Never validate mediocrity. Always point toward where they could be.
- Never end without a question or a challenge. Every conversation must move forward.
- Never use filler phrases like "Great question!" or "Absolutely!"
- Never mention names of external authors, speakers, or thought leaders.
- Keep responses focused — 3 to 5 sentences for follow-ups, slightly longer for opening check-ins.
- Never use roleplay action descriptions — no asterisk actions like "*nods*" or "*clears throat*". Speak directly. Your words carry the warmth — no stage directions needed.

CURRENT CONTEXT
${sec ? `The member is on Session ${sec.id} — "${sec.title}" (${sec.subtitle}). Section theme: ${sec.content.substring(0, 200)}...` : "The member is engaging with the Z2B Workshop."}`;

    // Build clean alternating message history for Anthropic
    const rawHistory = history.filter(m => m.text && m.text.trim().length > 0);
    const messages: {role:"user"|"assistant", content:string}[] = [];
    for (const m of rawHistory) {
      const role = m.role === "user" ? "user" : "assistant";
      // Anthropic requires alternating roles — skip consecutive same roles
      if (messages.length > 0 && messages[messages.length - 1].role === role) continue;
      messages.push({ role, content: m.text });
    }
    // Always end with the new user message
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      messages[messages.length - 1].content = userMessage;
    } else {
      messages.push({ role: "user", content: userMessage });
    }

    try {
      // ── Call via Next.js API route to avoid CORS ──
      const response = await fetch("/api/coach-manlaw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, systemPrompt }),
      });
      const data = await response.json();
      const reply = data.reply || "I am here with you. Take a breath and tell me what is on your mind.";
      setManlawMessages(prev => [...prev, { role: "manlaw", text: reply }]);

      // Save to Supabase if logged in
      if (userId && currentSection) {
        try {
          await supabase.from("coach_manlaw_sessions").insert({
            user_id: userId,
            section_id: currentSection,
            member_message: userMessage,
            manlaw_response: reply,
            created_at: new Date().toISOString(),
          });
        } catch(e) { /* silent — table may not exist yet */ }
      }
    } catch (err) {
      setManlawMessages(prev => [...prev, { role: "manlaw", text: "I am still here. Something interrupted our connection — try sending your message again." }]);
    } finally {
      setManlawLoading(false);
      setTimeout(() => manlawEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const sendManlawMessage = () => {
    if (!manlawInput.trim() || manlawLoading) return;
    const userMsg = manlawInput.trim();
    // If member is a guest and Manlaw asked for their name, capture it
    if (!manlawMemberName && manlawAskedName) {
      const possibleName = userMsg.split(" ")[0];
      if (possibleName.length > 1 && possibleName.length < 30) {
        setManlawMemberName(possibleName);
      }
    }
    const updated = [...manlawMessages, { role: "user" as "user"|"manlaw", text: userMsg }];
    setManlawMessages(updated);
    setManlawInput("");
    callManlaw(userMsg, manlawMessages);
  };

  // ---- Mirror Moment Quiz State ----
  const [mirrorAnswers, setMirrorAnswers] = useState<Record<number, boolean | null>>({});
  const [mirrorSubmitted, setMirrorSubmitted] = useState(false);
  const mirrorQuestions = [
    "My salary is gone before the next one arrives.",
    "I work hard but my income never seems to grow.",
    "I feel stuck between staying employed and the risk of starting something.",
    "I have dreams but responsibility makes them feel dangerous.",
    "I smile at work but privately wonder: Is this really it?",
  ];

  const mirrorScore = Object.values(mirrorAnswers).filter(v => v === true).length;

  // ---- render content with **bold** support + personalisation + mirror moment ----
  const renderContent = (text: string) => {
    const firstName = manlawMemberName || "Builder";
    // Replace placeholders
    const processed = text
      .replace("[[PERSONAL_OPENING]]",
        `**Welcome, ${firstName}. This session was written for you.**

What you are about to read is not theory. It is a mirror. It describes the life of millions of employed South Africans who work hard, pay their bills, and still quietly wonder if this is all there is. Read slowly. Be honest with yourself. Nothing here is meant to shame you — everything here is meant to free you.`)
      .replace("[[MIRROR_MOMENT]]", "[[MIRROR_MOMENT]]"); // handled separately below

    return processed.split("\n\n").map((para, i) => {
      if (para === "[[OBJECTION_DISSOLVER]]") {
        return <ObjectionDissolver key={i} firstName={firstName} />;
      }

      if (para === "[[CIRCLE_OF_TWELVE]]") {
        return <CircleOfTwelve key={i} firstName={firstName} />;
      }

      if (para === "[[SWOT_BUILDER]]") {
        return <SwotBuilder key={i} firstName={firstName} />;
      }

      if (para === "[[VISION_GATE]]") {
        return <VisionGate key={i} firstName={firstName} />;
      }

      if (para === "[[COMMUNITY_PREVIEW]]") {
        return <CommunityPreview key={i} firstName={firstName} />;
      }

      if (para === "[[ASSET_AUDIT]]") {
        return <AssetAudit key={i} firstName={firstName} />;
      }

      if (para === "[[IDENTITY_SELECTOR]]") {
        return <IdentitySelector key={i} firstName={firstName} />;
      }

      if (para === "[[MONTH_CHECK]]") {
        return <MonthCheckQuiz key={i} firstName={firstName} />;
      }

      if (para === "[[MIRROR_MOMENT]]") {
        return (
          <div key={i} style={{
            background: "linear-gradient(135deg, #1A0035, #0D0020)",
            border: "2px solid #D4AF37", borderRadius: "16px",
            padding: "24px", margin: "24px 0",
          }}>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#D4AF37", marginBottom: "6px" }}>
              🪞 Mirror Moment
            </div>
            <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.7)", marginBottom: "20px" }}>
              Be honest. Tick every statement that reflects your current reality:
            </div>
            {mirrorQuestions.map((q, qi) => (
              <div key={qi} style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                marginBottom: "14px", cursor: "pointer",
              }}
                onClick={() => !mirrorSubmitted && setMirrorAnswers(prev => ({ ...prev, [qi]: !prev[qi] }))}
              >
                <div style={{
                  width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0, marginTop: "1px",
                  background: mirrorAnswers[qi] ? "#D4AF37" : "rgba(255,255,255,0.1)",
                  border: `2px solid ${mirrorAnswers[qi] ? "#D4AF37" : "rgba(255,255,255,0.3)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: "bold", color: "#000",
                }}>
                  {mirrorAnswers[qi] ? "✓" : ""}
                </div>
                <div style={{ fontSize: "14px", color: "#fff", lineHeight: 1.6 }}>{q}</div>
              </div>
            ))}
            {!mirrorSubmitted ? (
              <button
                onClick={() => setMirrorSubmitted(true)}
                style={{
                  marginTop: "12px", background: "linear-gradient(135deg, #B8860B, #D4AF37)",
                  color: "#000", border: "none", borderRadius: "10px",
                  padding: "10px 28px", fontWeight: "bold", fontSize: "14px", cursor: "pointer",
                }}
              >
                See My Result
              </button>
            ) : (
              <div style={{
                marginTop: "16px", background: "rgba(212,175,55,0.1)",
                border: "1px solid rgba(212,175,55,0.4)", borderRadius: "12px", padding: "16px",
              }}>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#D4AF37", marginBottom: "8px" }}>
                  {mirrorScore >= 4
                    ? `${firstName}, this workshop was built for exactly where you are.`
                    : mirrorScore >= 2
                    ? `${firstName}, you are already questioning the system. That awareness is your first asset.`
                    : `${firstName}, you are further along than most. This workshop will sharpen what you already sense.`}
                </div>
                <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.8)", lineHeight: 1.7 }}>
                  {mirrorScore >= 4
                    ? "You ticked " + mirrorScore + " out of 5. You are not alone. Millions of employed South Africans live exactly this reality. The difference between those who stay here and those who escape is not luck — it is positioning. That is what this workshop changes."
                    : mirrorScore >= 2
                    ? "You ticked " + mirrorScore + " out of 5. You feel the friction. The next 8 sessions will show you exactly why that friction exists and what to do about it."
                    : "You ticked " + mirrorScore + " out of 5. Your foundation is more stable than most. Now it is time to build leverage on top of it."}
                </div>
                <div style={{ marginTop: "12px", fontSize: "12px", color: "#D4AF37", fontStyle: "italic" }}>
                  Continue reading below. Session 2 will show you exactly why this happens. 
                </div>
              </div>
            )}
          </div>
        );
      }
      if (para.startsWith("**") && para.endsWith("**")) {
        return <h3 key={i} style={S.sectionH3}>{para.replace(/\*\*/g, "")}</h3>;
      }
      const formatted = para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return <p key={i} style={S.para} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  // ============================================================
  // ── Email gate — show before anything else ──
  if (!workshopEmail) {
    return (
      <WorkshopEmailGate
        onEnter={(email) => {
          setWorkshopEmail(email);
          // Also pre-fill manlawMemberName from localStorage if available
          const savedName = typeof window !== "undefined"
            ? localStorage.getItem("z2b_workshop_first_name") || ""
            : "";
          if (savedName) setManlawMemberName(savedName);
        }}
      />
    );
  }

  // RENDER VIEWS
  // ============================================================
  // ── Welcome overlay rendered on top of any view ──
  const welcomeOverlay = showWelcome && inviterName && urlRef ? (
    <WelcomeOverlay
      builderName={inviterName}
      builderRef={urlRef}
      sectionId={currentSection ?? 1}
      sectionTitle={currentSection ? (SECTIONS.find(s => s.id === currentSection)?.title ?? "Workshop") : "Workshop"}
      onClose={() => setShowWelcome(false)}
    />
  ) : null;

  if (view === "home") return (
    <>
      {welcomeOverlay}
      <HomeView setView={setView} completedCount={completedCount} freeCompleted={freeCompleted} />
    </>
  );
  if (view === "paywall") return <PaywallView setView={setView} />;

  if (view === "results" && section) return (
    <div style={S.page}>
      {showShareCard && (
        <ShareCard
          sectionId={currentSection!}
          sectionTitle={section.title}
          score={score ?? 0}
          builderRef={builderRef}
          onClose={() => setShowShareCard(false)}
        />
      )}
      <div style={S.resultCard}>
        <div style={{ fontSize: "64px", marginBottom: "8px", animation: "bounce 0.6s" }}>🏆</div>
        <div style={{ fontSize: "22px", marginBottom: "12px", letterSpacing: "6px" }}>🎊 🎉 🎊</div>
        <h2 style={S.resultTitle}>Session {currentSection} Complete!</h2>
        <p style={S.resultSub}>{section.title}</p>
        <div style={S.scoreCircle}>
          <span style={{ fontSize: "28px", fontWeight: "bold" }}>{score}/5</span>
        </div>
        <div style={{ fontSize: "28px", margin: "8px 0 4px" }}>
          {score === 5 ? "⭐⭐⭐⭐⭐" : score != null && score >= 3 ? "⭐⭐⭐" : "⭐⭐"}
        </div>
        <p style={S.scoreLabel}>
          {score === 5
            ? "🔥 Perfect Score! Outstanding Builder!"
            : score != null && score >= 3
            ? "✅ Well Done, Builder! Keep going!"
            : "📚 Good effort — review the section again for deeper understanding."}
        </p>
        <div style={{ background: "#D97706", color: "#fff", borderRadius: "20px", padding: "6px 20px", fontSize: "12px", fontWeight: "bold", display: "inline-block", marginBottom: "20px" }}>
          Day {currentSection} of 90 · {Math.round(((currentSection ?? 0) / 90) * 100)}% Complete
        </div>
        <div style={{ background: "#F3E8FF", border: "2px solid #C4B5FD", borderRadius: "14px", padding: "16px", marginBottom: "20px" }}>
          <p style={{ fontSize: "14px", fontWeight: "bold", color: "#6B21A8", margin: "0 0 6px" }}>
            🚀 Challenge Your Friends!
          </p>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 12px" }}>
            Share your win on WhatsApp, Facebook & TikTok — and dare them to start their free workshop
          </p>
          <button style={{ ...S.btnGold, width: "100%", padding: "12px" }} onClick={() => setShowShareCard(true)}>
            🎉 Share My Achievement Card
          </button>
        </div>
        {/* ── UPGRADE NUDGE after Sessions 3, 6 and 9 ── */}
        {[3, 6, 9].includes(currentSection ?? 0) && (
          <div style={{
            background: "linear-gradient(135deg, #1A0035, #2D0060)",
            border: "2px solid #D4AF37",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>
              {currentSection === 3 ? "🔓" : currentSection === 6 ? "🏆" : "🚀"}
            </div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#D4AF37", marginBottom: "8px" }}>
              {currentSection === 3 && "You've completed your first milestone!"}
              {currentSection === 6 && "Your Vision Board is unlocked — now unlock the full journey!"}
              {currentSection === 9 && "You've finished the FREE preview — your transformation is just beginning!"}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(196,181,253,0.85)", marginBottom: "16px", lineHeight: 1.6 }}>
              {currentSection === 3 && "Sessions 4–90 are waiting. Every session builds on the last. Upgrade now and keep the momentum going."}
              {currentSection === 6 && "You've seen vision and strategy. Sessions 7–90 cover systems, income streams, and legacy building. Don't stop here."}
              {currentSection === 9 && "90 sessions. One transformation. Builders who complete all 90 sessions earn lifetime commissions and community access. Pull up your chair."}
            </div>
            <a
              href="/pricing"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #B8860B, #D4AF37)",
                color: "#000",
                padding: "12px 32px",
                borderRadius: "10px",
                fontWeight: "bold",
                fontSize: "14px",
                textDecoration: "none",
                letterSpacing: "0.5px",
              }}
            >
              ⬆️ See Membership Plans
            </a>
            <div style={{ marginTop: "10px", fontSize: "11px", color: "rgba(196,181,253,0.5)" }}>
              Once-off lifetime membership from R480 — pay once, earn forever
            </div>
          </div>
        )}

        <div style={S.resultBtnRow}>
          {currentSection != null && currentSection < 9 && (
            <button style={S.btnGold} onClick={() => { setShowShareCard(false); openSection(currentSection + 1); }}>
              Next Session →
            </button>
          )}
          <button style={S.btnOutline} onClick={() => setView("workshop")}>
            Back to Workshop
          </button>
          <button style={S.backBtn} onClick={() => setView("home")}>
            🏠 Home
          </button>
        </div>
        {/* ── COACH MANLAW PANEL ── */}
        <div style={{
          background: "#0D0020", border: "2px solid #9333EA",
          borderRadius: "20px", padding: "0", marginBottom: "24px",
          overflow: "hidden", boxShadow: "0 0 40px rgba(147,51,234,0.3)",
        }}>
          {/* Header */}
          <div
            style={{ background: "linear-gradient(135deg, #6B21A8, #9333EA)", padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
            onClick={() => setManlawOpen(o => !o)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(212,175,55,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🧠</div>
              <div>
                <div style={{ color: "#D4AF37", fontWeight: "bold", fontSize: "15px", letterSpacing: "1px" }}>Coach Manlaw</div>
                <div style={{ color: "rgba(196,181,253,0.8)", fontSize: "11px" }}>Your AI Business Coach · Z2B Intelligence</div>
              </div>
            </div>
            <div style={{ color: "#D4AF37", fontSize: "20px" }}>{manlawOpen ? "▼" : "▲"}</div>
          </div>

          {manlawOpen && (
            <div style={{ padding: "0" }}>
              {/* Messages */}
              <div style={{ maxHeight: "320px", overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {manlawMessages.length === 0 && (
                  <div style={{ textAlign: "center", color: "rgba(196,181,253,0.5)", fontSize: "13px", padding: "20px" }}>
                    Coach Manlaw is preparing your coaching session...
                  </div>
                )}
                {manlawMessages.map((msg, i) => (
                  <div key={i} style={{
                    display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row",
                    gap: "10px", alignItems: "flex-start",
                  }}>
                    {msg.role === "manlaw" && (
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #6B21A8, #9333EA)", border: "1px solid #D4AF37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🧠</div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "80%" }}>
                      <div style={{
                        padding: "12px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: msg.role === "user" ? "linear-gradient(135deg, #9333EA, #7C3AED)" : "rgba(255,255,255,0.07)",
                        border: msg.role === "manlaw" ? "1px solid rgba(212,175,55,0.3)" : "none",
                        color: "#fff", fontSize: "14px", lineHeight: 1.7,
                      }}>
                        {msg.text}
                      </div>
                      {msg.role === "manlaw" && (
                        <ManlawVoice text={msg.text} />
                      )}
                    </div>
                  </div>
                ))}
                {manlawLoading && (
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #6B21A8, #9333EA)", border: "1px solid #D4AF37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🧠</div>
                    <div style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 4px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(212,175,55,0.3)", color: "rgba(196,181,253,0.7)", fontSize: "14px" }}>
                      Coach Manlaw is thinking<span style={{ animation: "pulse 1s infinite" }}>...</span>
                    </div>
                  </div>
                )}
                <div ref={manlawEndRef} />
              </div>

              {/* Suggested prompts */}
              {manlawMessages.length <= 2 && !manlawLoading && (
                <div style={{ padding: "0 16px 12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["How does this connect to my vision?", "I am struggling with this concept.", "What action should I take today?"].map((prompt, i) => (
                    <button key={i} onClick={() => { setManlawInput(prompt); }}
                      style={{ background: "rgba(147,51,234,0.2)", border: "1px solid rgba(147,51,234,0.5)", borderRadius: "20px", padding: "6px 14px", color: "rgba(196,181,253,0.9)", fontSize: "12px", cursor: "pointer" }}>
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div style={{ padding: "12px 16px 16px", borderTop: "1px solid rgba(147,51,234,0.3)", display: "flex", gap: "10px" }}>
                <input
                  value={manlawInput}
                  onChange={e => setManlawInput((e.target as HTMLInputElement).value)}
                  onKeyDown={e => { if (e.key === "Enter") sendManlawMessage(); }}
                  placeholder="Respond to Coach Manlaw..."
                  style={{
                    flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(147,51,234,0.5)",
                    borderRadius: "12px", padding: "10px 16px", color: "#fff", fontSize: "14px", outline: "none",
                  }}
                />
                <button
                  onClick={sendManlawMessage}
                  disabled={manlawLoading || !manlawInput.trim()}
                  style={{
                    background: "linear-gradient(135deg, #D4AF37, #B8860B)", border: "none",
                    borderRadius: "12px", padding: "10px 18px", color: "#000", fontWeight: "bold",
                    fontSize: "14px", cursor: manlawLoading ? "not-allowed" : "pointer", opacity: manlawLoading ? 0.5 : 1,
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <a
            href="https://app.z2blegacybuilders.co.za/pricing"
            style={{ fontSize: "13px", color: "#6B21A8", fontWeight: "bold", textDecoration: "none", borderBottom: "2px solid #C4B5FD", paddingBottom: "2px" }}
          >
            ⬆️ Ready to unlock all 90 sessions? View Pricing →
          </a>
        </div>
      </div>
    </div>
  );

  if (view === "workshop") return (
    <div style={S.page}>
      <div style={S.workshopHeader}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
          <button style={S.backBtn} onClick={() => setView("home")}>← Home</button>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <a href="/vision-board" style={{ background: "linear-gradient(135deg, #B8860B, #D4AF37)", color: "#000", border: "none", padding: "7px 14px", borderRadius: "8px", fontWeight: "bold", fontSize: "12px", cursor: "pointer", textDecoration: "none" }}>🏆 Vision Board</a>
            <a href="/pricing" style={{ background: "linear-gradient(135deg, #6B21A8, #9333EA)", color: "#fff", border: "none", padding: "7px 14px", borderRadius: "8px", fontWeight: "bold", fontSize: "12px", cursor: "pointer", textDecoration: "none" }}>⬆️ Upgrade</a>
            <a href="/" style={{ background: "transparent", color: "#6B21A8", border: "1px solid #6B21A8", padding: "7px 14px", borderRadius: "8px", fontWeight: "bold", fontSize: "12px", cursor: "pointer", textDecoration: "none" }}>🏠 Home</a>
          </div>
        </div>
        <h1 style={S.workshopTitle}>The Entrepreneurial Consumer Workshop</h1>
        <p style={S.workshopSub}>90-Day Transformation Journey • 1 Session Per Day</p>
        <div style={S.progressBar}>
          <div style={{ ...S.progressFill, width: `${(completedCount / 90) * 100}%` }} />
        </div>
        <p style={S.progressText}>{completedCount}/90 Sessions Completed</p>
      </div>
      <div style={S.sectionGrid}>
        {SECTIONS.map((sec) => {
          const done     = progress[sec.id]?.completed ?? false;
          const unlocked = isSectionUnlocked(sec.id);
          const isNext   = sec.free && !done && unlocked;
          return (
            <div
              key={sec.id}
              style={{
                ...S.sectionCard,
                ...(done    ? S.cardDone   : {}),
                ...(!sec.free ? S.cardLocked : {}),
                ...(isNext  ? S.cardNext   : {}),
                cursor: (unlocked || done) ? "pointer" : "default",
              }}
              onClick={() => {
                if (!sec.free) { setView("paywall"); return; }
                if (unlocked || done) openSection(sec.id);
              }}
            >
              <div style={S.cardNum}>{done ? "✓" : !sec.free ? "🔒" : sec.id}</div>
              <div style={S.cardInfo}>
                <div style={S.cardTitle}>{sec.title}</div>
                <div style={S.cardSub}>{sec.subtitle}</div>
                {sec.free && <span style={S.freeBadge}>FREE</span>}
                {done && <span style={S.doneBadge}>✓ Done · {progress[sec.id]?.score}/5</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (view === "section" && section) return (
    <div style={S.page}>
      <div style={S.sectionTopBar}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button style={S.backBtn} onClick={() => setView("home")}>🏠 Home</button>
          <button style={S.backBtn} onClick={() => setView("workshop")}>← Workshop</button>
        </div>
        <span style={S.sectionBadge}>Day {section.id} of 90</span>
        {section.free && <span style={S.freeBadge}>FREE</span>}
      </div>

      <div style={S.sectionHero}>
        <div style={S.sectionNum}>Session {section.id}</div>
        <h1 style={S.sectionTitle}>{section.title}</h1>
        <p style={S.sectionSubtitle}>{section.subtitle}</p>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto 8px", padding: "0 20px", display: "flex", justifyContent: "flex-end" }}>
        <button
          style={{ ...S.backBtn, background: showAudio ? "#1E1B2E" : "#F3E8FF", color: showAudio ? "#C4B5FD" : "#6B21A8", border: showAudio ? "1.5px solid #6B21A8" : "1.5px solid #C4B5FD" }}
          onClick={() => setShowAudio(!showAudio)}
        >
          🎙️ {showAudio ? "Hide Audio" : "Listen to Session"}
        </button>
      </div>

      {showAudio && <AudioPlayer text={section.content} sectionTitle={section.title} />}

      <div style={S.contentCard} ref={contentRef} onScroll={handleScroll}>
        <div>{renderContent(section.content)}</div>
        {!scrolledToBottom && (
          <div style={S.scrollHint}>↓ Read to the bottom to unlock the questions</div>
        )}
      </div>

      {scrolledToBottom && (
        <>
          <div style={S.activityCard}>
            <div style={S.activityHeader}>📋 Your Transformation Activity</div>
            <p style={S.activityText}>{section.activity}</p>
            <label style={S.checkLabel}>
              <input
                type="checkbox"
                checked={activityTicked}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActivityTicked(e.target.checked)}
                style={S.checkbox}
              />
              <span>
                <strong>I am true to myself — I have completed this activity.</strong> I understand that this workshop transforms those who do the work, not those who skip it. My results will reflect my honesty here.
              </span>
            </label>
            <p style={{ fontSize: "12px", color: "#92400E", fontStyle: "italic", marginTop: "12px", borderTop: "1px solid #FCD34D", paddingTop: "10px" }}>
              "The seeds you plant in private determine the harvest you reap in public." — Rev Mokoro Manana
            </p>
          </div>

          <div style={S.quizCard}>
            <div style={S.quizHeader}>📝 Comprehension Check — 5 Questions</div>
            <p style={S.quizSub}>Answer all 5 questions to proceed to the next section.</p>

            {section.questions.map((q, qi) => (
              <div key={qi} style={S.question}>
                <p style={S.qText}><strong>Q{qi + 1}:</strong> {q.q}</p>
                {q.options.map((opt, oi) => {
                  let btnStyle: CSSProperties = { ...S.optionBtn };
                  if (submitted) {
                    if (oi === q.answer)        btnStyle = { ...S.optionBtn, ...S.optionCorrect };
                    else if (answers[qi] === oi) btnStyle = { ...S.optionBtn, ...S.optionWrong   };
                  } else if (answers[qi] === oi) {
                    btnStyle = { ...S.optionBtn, ...S.optionSelected };
                  }
                  return (
                    <button key={oi} style={btnStyle} onClick={() => handleAnswer(qi, oi)}>
                      <span style={S.optionLetter}>{["A", "B", "C", "D"][oi]}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            ))}

            {!submitted && (
              <button
                style={{ ...S.btnGold, opacity: Object.keys(answers).length < 5 ? 0.5 : 1 }}
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < 5}
              >
                Submit Answers
              </button>
            )}

            {submitted && (
              <div style={S.scoreBox}>
                <p style={S.scoreResult}>
                  Your Score: <strong>{score}/5</strong> —{" "}
                  {score === 5 ? "🏆 Perfect!" : score != null && score >= 3 ? "✅ Well Done!" : "📚 Review and try again"}
                </p>
                {score != null && score >= 3 && activityTicked && (
                  <button style={S.btnGold} onClick={handleComplete}>
                    Mark Session Complete &amp; Continue →
                  </button>
                )}
                {score != null && score < 3 && (
                  <button style={S.btnOutline} onClick={() => { setAnswers({}); setSubmitted(false); setScore(null); }}>
                    Try Again
                  </button>
                )}
                {score != null && score >= 3 && !activityTicked && (
                  <p style={S.hint}>☝️ Please tick the activity checkbox above to proceed.</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return null;
}

export default function WorkshopPage() {
  return (
    <React.Suspense fallback={<div style={{ background: "#0A0015", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37", fontSize: "18px" }}>Loading Workshop...</div>}>
      <WorkshopInner />
    </React.Suspense>
  );
}