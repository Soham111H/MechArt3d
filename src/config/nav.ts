// src/config/nav.ts
// Single source of truth for all navigation data.
// Add/remove industries, materials, or resources here — the navbar, pages, sitemap all read from this.

import {
  Rocket, Car, Heart, Shield, Cpu, Factory, Bot, Package, GraduationCap,
} from "lucide-react";

// ── APPLICATIONS ────────────────────────────────────────────────────────────
export const applications = [
  {
    slug: "aerospace",
    name: "Aerospace",
    icon: Rocket,
    description: "Precision components for flight-critical applications with tight tolerances.",
    benefits: [
      "Ultra-tight dimensional tolerances for flight-critical parts",
      "Lightweight titanium & aluminum structures with complex geometries",
      "Rapid prototyping cuts development cycles from months to days",
      "Full material traceability and documentation support",
    ],
    useCases: [
      "Satellite brackets & housings",
      "UAV/drone structural frames",
      "Wind-tunnel test models",
      "Cabin interior components",
      "Ground support equipment fixtures",
    ],
    materials: ["metal", "plastic"],
    heroTagline: "Precision manufacturing for every altitude.",
  },
  {
    slug: "automotive",
    name: "Automotive",
    icon: Car,
    description: "From concept models to functional end-use parts for vehicles of every type.",
    benefits: [
      "Rapid concept and functional prototype production",
      "Tooling, jigs & fixtures with significant cost savings vs. traditional machining",
      "Complex fluid-channel parts impossible by conventional methods",
      "Low-volume production runs without tooling investment",
    ],
    useCases: [
      "Intake manifolds & ducting",
      "Dashboard & trim prototypes",
      "Custom bracket fabrication",
      "Wind-tunnel aerodynamics models",
      "EV battery housing components",
    ],
    materials: ["metal", "plastic"],
    heroTagline: "Drive innovation from concept to road.",
  },
  {
    slug: "medical-healthcare",
    name: "Medical & Healthcare",
    icon: Heart,
    description: "Biocompatible parts, surgical guides, and patient-specific medical devices.",
    benefits: [
      "Biocompatible materials meeting ISO 10993 standards",
      "Patient-specific implants and surgical planning models",
      "Sterile-compatible surface finishes available",
      "Fast-turnaround for custom orthotic and prosthetic devices",
    ],
    useCases: [
      "Surgical planning anatomical models",
      "Custom prosthetics & orthotics",
      "Medical device housings",
      "Lab equipment fixtures",
      "Dental models & guides",
    ],
    materials: ["plastic"],
    heroTagline: "Engineering solutions that improve lives.",
  },
  {
    slug: "defense-military",
    name: "Defense & Military",
    icon: Shield,
    description: "Mission-critical components manufactured with rigorous quality controls.",
    benefits: [
      "Secure, on-demand parts production without long supply chains",
      "High-strength materials rated for extreme environmental conditions",
      "Complex geometries for weight reduction in field equipment",
      "Rapid replacement parts for legacy systems",
    ],
    useCases: [
      "UAV/drone airframe components",
      "Weapon system brackets & housings",
      "Training aids and simulation hardware",
      "Night-vision & optic mounts",
      "Ruggedized enclosures",
    ],
    materials: ["metal", "plastic"],
    heroTagline: "Built for the toughest missions on earth.",
  },
  {
    slug: "electronics",
    name: "Electronics",
    icon: Cpu,
    description: "Custom enclosures, PCB fixtures, and connectors for electronics development.",
    benefits: [
      "Tight-tolerance housings for PCBs and modules",
      "EMI shielding structures with conductive filaments",
      "Rapid iteration for product form-factor validation",
      "Low-volume custom connector and cable management parts",
    ],
    useCases: [
      "Custom PCB enclosures",
      "Sensor mounts & housings",
      "Test jigs & fixtures",
      "Antenna brackets",
      "Cable management assemblies",
    ],
    materials: ["plastic"],
    heroTagline: "From schematic to enclosure, faster than ever.",
  },
  {
    slug: "industrial-manufacturing",
    name: "Industrial & Manufacturing",
    icon: Factory,
    description: "End-use tooling, jigs, fixtures, and production-grade parts at scale.",
    benefits: [
      "Replace expensive CNC-machined tooling at a fraction of the cost",
      "On-demand spare parts to keep production lines running",
      "Custom ergonomic tools tailored to your workflow",
      "Complex internal geometries impossible with subtractive methods",
    ],
    useCases: [
      "Assembly jigs & fixtures",
      "End-of-arm tooling (EOAT)",
      "Custom machine guards",
      "Low-volume end-use parts",
      "Mold patterns and masters",
    ],
    materials: ["metal", "plastic"],
    heroTagline: "Keep your production line running without compromise.",
  },
  {
    slug: "robotics-automation",
    name: "Robotics & Automation",
    icon: Bot,
    description: "Lightweight structural components and gripper tooling for robotic systems.",
    benefits: [
      "Ultra-lightweight structural frames maximize payload capacity",
      "Custom gripper fingers tailored to part geometry",
      "Rapid iteration enables fast robot design evolution",
      "Integrated channels for pneumatics and cable routing",
    ],
    useCases: [
      "Robot arm links & brackets",
      "Custom end-effector tooling",
      "Sensor & camera mounts",
      "Wheeled robot chassis",
      "Collaborative robot safety guards",
    ],
    materials: ["plastic"],
    heroTagline: "Lightweight. Strong. Ready to automate.",
  },
  {
    slug: "consumer-products",
    name: "Consumer Products",
    icon: Package,
    description: "Concept models, functional prototypes, and short-run production for consumer goods.",
    benefits: [
      "Validate product form, fit and function before tooling investment",
      "Photo-realistic concept models for marketing and investor demos",
      "Short-run production without minimum order quantities",
      "Wide material and colour selection for premium finishes",
    ],
    useCases: [
      "Product concept and appearance models",
      "Ergonomic user testing prototypes",
      "Packaging inserts & retail displays",
      "Consumer electronics housings",
      "Wearables & accessories",
    ],
    materials: ["plastic"],
    heroTagline: "From napkin sketch to shelf-ready product.",
  },
  {
    slug: "education-research",
    name: "Education & Research",
    icon: GraduationCap,
    description: "Physical learning aids, research apparatus, and experimental hardware.",
    benefits: [
      "Cost-effective physical models for complex scientific concepts",
      "Rapid fabrication of custom research apparatus",
      "Enables hands-on STEM learning at any scale",
      "Open-source design compatibility for collaborative projects",
    ],
    useCases: [
      "Anatomy & molecular structure models",
      "Wind-tunnel and fluid dynamics models",
      "Custom lab equipment holders",
      "Robotics competition components",
      "Engineering student project parts",
    ],
    materials: ["plastic"],
    heroTagline: "Making knowledge tangible.",
  },
];

// ── MATERIALS ────────────────────────────────────────────────────────────────
export const metalMaterials = [
  { name: "Stainless Steel 316L", strength: "★★★★★", weight: "Heavy", heatResistance: "900°C", cost: "$$$$", bestFor: "Medical, marine, food-grade" },
  { name: "Aluminum AlSi10Mg", strength: "★★★☆☆", weight: "Light", heatResistance: "300°C", cost: "$$$", bestFor: "Aerospace, automotive, heat sinks" },
  { name: "Titanium Ti64", strength: "★★★★★", weight: "Medium", heatResistance: "600°C", cost: "$$$$$", bestFor: "Aerospace, medical implants" },
  { name: "Tool Steel H13", strength: "★★★★★", weight: "Heavy", heatResistance: "600°C", cost: "$$$$", bestFor: "Tooling, dies, moulds" },
  { name: "Inconel 625", strength: "★★★★★", weight: "Heavy", heatResistance: "1200°C", cost: "$$$$$", bestFor: "Turbines, jet engines, defence" },
];

export const plasticMaterials = [
  { name: "PLA", strength: "★★☆☆☆", flexibility: "Rigid", finish: "Excellent", cost: "$", bestFor: "Prototypes, models, décor" },
  { name: "ABS", strength: "★★★☆☆", flexibility: "Semi-rigid", finish: "Good", cost: "$", bestFor: "Functional prototypes, electronics" },
  { name: "PETG", strength: "★★★☆☆", flexibility: "Semi-rigid", finish: "Good", cost: "$$", bestFor: "Food-safe parts, medical" },
  { name: "Resin (SLA)", strength: "★★☆☆☆", flexibility: "Brittle", finish: "Outstanding", cost: "$$$", bestFor: "Miniatures, dental, jewellery" },
  { name: "Nylon (PA12)", strength: "★★★★☆", flexibility: "Flexible", finish: "Moderate", cost: "$$$", bestFor: "Hinges, clips, tough parts" },
  { name: "TPU", strength: "★★★☆☆", flexibility: "Very Flexible", finish: "Good", cost: "$$", bestFor: "Grips, seals, wearables" },
];

// ── RESOURCES ────────────────────────────────────────────────────────────────
export const resourceServices = [
  {
    slug: "new-product-development",
    name: "New Product Development",
    tagline: "From concept to market-ready product — faster.",
    description: "We partner with inventors, startups, and enterprises to turn early-stage ideas into manufacturable, validated products using 3D printing as the design accelerator.",
    whatIs: "New Product Development (NPD) is the structured process of transforming a concept or market need into a physical product that is ready for production and sales. At MechArt 3D, we integrate 3D printing into every stage of this process to dramatically cut time-to-market.",
    process: [
      { step: 1, title: "Discovery & Brief", desc: "We understand your vision, target user, constraints, and success criteria through a detailed intake session." },
      { step: 2, title: "Concept Design", desc: "Our design team creates initial CAD concepts and renders for your review and feedback." },
      { step: 3, title: "Rapid Prototyping", desc: "We 3D print multiple iterations quickly, enabling fast physical testing and refinement." },
      { step: 4, title: "Design for Manufacturing", desc: "We optimise the design for your chosen production method — injection moulding, CNC, or continued additive manufacturing." },
      { step: 5, title: "Final Validation", desc: "Functional prototypes are tested against performance criteria, then handed off with full documentation." },
    ],
    benefits: [
      "Cut development timelines by up to 60% vs traditional methods",
      "De-risk tooling investment with validated prototypes first",
      "Iterate on real physical models, not just screens",
      "One partner from sketch to shelf — no coordination overhead",
    ],
  },
  {
    slug: "reverse-engineering",
    name: "Reverse Engineering",
    tagline: "Recreate what exists. Improve what doesn't.",
    description: "We digitise legacy parts, worn components, or competitor products into accurate CAD models — ready for reproduction, improvement, or integration into modern systems.",
    whatIs: "Reverse Engineering is the process of analysing an existing physical part to extract its design data — dimensions, geometry, material properties — and recreate it as a digital model. This is essential for legacy part reproduction, competitive benchmarking, and design improvement.",
    process: [
      { step: 1, title: "Part Receipt & Assessment", desc: "We receive your physical part and assess its complexity, condition, and best scanning approach." },
      { step: 2, title: "3D Scanning", desc: "We capture a full 3D scan of the part using structured-light scanning for sub-millimetre accuracy." },
      { step: 3, title: "Mesh Processing", desc: "Raw scan data is processed into a clean, watertight mesh model." },
      { step: 4, title: "Parametric CAD Creation", desc: "We convert the mesh into an editable parametric CAD model (STEP/IGES) ready for engineering." },
      { step: 5, title: "Validation & Delivery", desc: "The CAD model is dimensionally validated against the original part and delivered with inspection report." },
    ],
    benefits: [
      "Reproduce discontinued or unavailable parts on-demand",
      "Improve on legacy designs without starting from scratch",
      "Full dimensional accuracy reports included",
      "Delivered as STEP, IGES, or native CAD format of your choice",
    ],
  },
  {
    slug: "design-guidelines",
    name: "Design Guidelines",
    tagline: "Design smarter. Print better.",
    description: "Our expert team provides design-for-additive-manufacturing (DfAM) consultations and detailed guidelines to help your engineering team get the most out of 3D printing.",
    whatIs: "Design for Additive Manufacturing (DfAM) is the practice of designing parts specifically to leverage the unique capabilities of 3D printing — complex geometries, lightweight lattices, integrated assemblies — while avoiding the common pitfalls that lead to print failures or poor quality.",
    process: [
      { step: 1, title: "Design Review", desc: "We analyse your existing CAD files and flag areas where additive design principles can be applied or improved." },
      { step: 2, title: "Material Recommendation", desc: "We recommend the optimal material and process for your functional and aesthetic requirements." },
      { step: 3, title: "Geometry Optimisation", desc: "We apply DfAM principles — wall thickness, overhang angles, support strategy, infill patterns — to your design." },
      { step: 4, title: "Test Print & Validation", desc: "We produce test prints to validate the optimised design before committing to full production." },
      { step: 5, title: "Documentation", desc: "We deliver a full design guideline document your team can apply to future projects." },
    ],
    benefits: [
      "Reduce print failures and material waste significantly",
      "Unlock geometries impossible by traditional manufacturing",
      "Faster design cycles with clear, documented print rules",
      "Upskill your in-house team for long-term independence",
    ],
  },
];

// ── NAV DROPDOWN STRUCTURE (for Navbar/MobileMenu) ────────────────────────
export const navStructure = [
  {
    label: "Applications",
    href: "/applications",
    type: "mega" as const,
    items: applications.map(a => ({
      label: a.name,
      href: `/applications/${a.slug}`,
      icon: a.icon,
      description: a.description,
    })),
  },
  {
    label: "Products",
    href: "/products",
    type: "dropdown" as const,
    items: [
      { label: "By Category",   href: "/products",      description: "Browse our full product catalogue" },
      { label: "Custom",        href: "/custom-design", description: "Submit reference images & ideas for a quote" },
      { label: "Instant Quote", href: "/instant-quote", description: "Upload STL/OBJ and get an instant price" },
    ],
  },
  {
    label: "Material Guide",
    href: "/material-guide",
    type: "dropdown" as const,
    items: [
      { label: "Metal", href: "/material-guide/metal", description: "Stainless steel, titanium, aluminium & more" },
      { label: "Plastic", href: "/material-guide/plastic", description: "PLA, PETG, Resin, Nylon, TPU & more" },
    ],
  },
  {
    label: "About Us",
    href: "/about",
    type: "link" as const,
    items: [],
  },
  {
    label: "Resources",
    href: "/resources",
    type: "dropdown" as const,
    items: [
      { label: "New Product Development", href: "/resources/new-product-development", description: "End-to-end product creation" },
      { label: "Reverse Engineering", href: "/resources/reverse-engineering", description: "Digitise and recreate existing parts" },
      { label: "Design Guidelines", href: "/resources/design-guidelines", description: "DfAM best practices and consultation" },
      { label: "Instant STL Quote", href: "/instant-quote", description: "Get a price estimate in seconds" },
      { label: "Blog", href: "/blog", description: "Tips, guides & industry insights" },
      { label: "FAQs", href: "/faq", description: "Common questions answered" },
      { label: "Contact", href: "/contact", description: "Get in touch with our team" },
    ],
  },
];
