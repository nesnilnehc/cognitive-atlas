/**
 * Illustration Configuration Source
 * Defines the semantic structure and visual metaphors for cognitive models.
 * Used by scripts/generate-illustrations.mjs to render SVGs.
 */
export const ILLUSTRATION_CONFIG = {
  // ==========================================================================================
  // P0: Classic Diagrams (Manual SVG preferred, fallback to high-fidelity template)
  // ==========================================================================================
  "Maslow's Hierarchy": {
    tier: "P0",
    template: "pyramid",
    labels: ["Self-actualization", "Esteem", "Love", "Safety", "Physiological"],
    color: "accent1"
  },
  "BCG Matrix": {
    tier: "P0",
    template: "matrix_2x2",
    labels: ["Star", "Question Mark", "Cash Cow", "Dog"],
    axisLabels: ["Market Growth", "Market Share"],
    color: "accent2"
  },
  "Porter's Five Forces": {
    tier: "P0",
    template: "radial_5",
    labels: ["Supplier Power", "Buyer Power", "Competitive Rivalry", "Threat of Substitution", "Threat of New Entry"],
    color: "accent3"
  },
  "SWOT": {
    tier: "P0",
    template: "matrix_2x2",
    labels: ["Strengths", "Weaknesses", "Opportunities", "Threats"],
    axisLabels: ["Internal", "External"],
    color: "accent4"
  },
  "Eisenhower Matrix": {
    tier: "P0",
    template: "matrix_2x2",
    labels: ["Do First", "Schedule", "Delegate", "Don't Do"],
    axisLabels: ["Urgent", "Important"],
    color: "accent1"
  },
  "PDCA": {
    tier: "P0",
    template: "loop_cycle",
    labels: ["Plan", "Do", "Check", "Act"],
    color: "accent2"
  },
  "5 Whys": {
    tier: "P0",
    template: "chain_vertical",
    stepCount: 5,
    labels: ["Why?", "Why?", "Why?", "Why?", "Root Cause"],
    color: "accent3"
  },
  "AIDA": {
    tier: "P0",
    template: "funnel",
    labels: ["Attention", "Interest", "Desire", "Action"],
    color: "accent4"
  },
  "OODA Loop": {
    tier: "P0",
    template: "loop_cycle",
    labels: ["Observe", "Orient", "Decide", "Act"],
    color: "accent1"
  },
  "Fishbone Diagram": {
    tier: "P0",
    template: "fishbone",
    labels: ["People", "Methods", "Machines", "Materials", "Environment", "Effect"],
    color: "accent2"
  },
  "Diffusion of Innovation": {
    tier: "P0",
    template: "curve_bell",
    labels: ["Innovators", "Early Adopters", "Early Majority", "Late Majority", "Laggards"],
    color: "accent4"
  },

  // ==========================================================================================
  // P1: Metaphor Visuals (Icon + Structure)
  // ==========================================================================================
  "Swiss Cheese Model": {
    tier: "P1",
    template: "shield_layers", // Metaphor: Shield/Defense
    labels: ["Layer 1", "Layer 2", "Layer 3", "Failure"],
    showMetaphor: "shield",
    color: "accent1"
  },
  "Flywheel": {
    tier: "P1",
    template: "loop_cycle", // Metaphor: Momentum
    labels: ["Attract", "Engage", "Delight"],
    showMetaphor: "rocket",
    color: "accent2"
  },
  "Black Swan": {
    tier: "P1",
    template: "curve_fat_tail", // Metaphor: Rare Event
    labels: ["Normal Distribution", "Fat Tail"],
    showMetaphor: "swan",
    color: "accent3"
  },
  "Iceberg Model": {
    tier: "P1",
    template: "iceberg",
    labels: ["Events", "Patterns", "Structures", "Mental Models"],
    showMetaphor: "iceberg",
    color: "accent4"
  },
  "Long Tail": {
    tier: "P1",
    template: "curve_power_law",
    labels: ["Head", "Long Tail"],
    showMetaphor: "dinosaur_tail",
    color: "accent1"
  },
  "First Principles": {
    tier: "P1",
    template: "tree_roots",
    labels: ["Fundamental Truths", "Reasoning"],
    showMetaphor: "roots",
    color: "accent2"
  },
  "Pareto Principle": {
    tier: "P1",
    template: "bar_80_20",
    labels: ["20% Causes", "80% Effects"],
    showMetaphor: "scale",
    color: "accent3"
  },
  "Blue Ocean Strategy": {
    tier: "P1",
    template: "chart_value_curve",
    labels: ["Red Ocean", "Blue Ocean"],
    showMetaphor: "ocean",
    color: "accent4"
  },
  "Hedgehog Concept": {
    tier: "P1",
    template: "venn_3",
    labels: ["Passion", "Best At", "Economic Engine"],
    showMetaphor: "hedgehog",
    color: "accent1"
  },
  "Network Effects": {
    tier: "P1",
    template: "network_mesh",
    labels: ["Users", "Value"],
    showMetaphor: "network",
    color: "accent2"
  },

  // ==========================================================================================
  // P2: Structural Models (Standard Templates + Terms)
  // ==========================================================================================
  // Analysis & Logic
  "PREP": { tier: "P2", template: "flow_linear", labels: ["Point", "Reason", "Example", "Point"] },
  "PEEL": { tier: "P2", template: "flow_linear", labels: ["Point", "Evidence", "Explain", "Link"] },
  "STAR": { tier: "P2", template: "flow_linear", labels: ["Situation", "Task", "Action", "Result"] },
  "SCQA": { tier: "P2", template: "flow_linear", labels: ["Situation", "Complication", "Question", "Answer"] },
  "FABE": { tier: "P2", template: "flow_linear", labels: ["Feature", "Advantage", "Benefit", "Evidence"] },
  "4MAT": { tier: "P2", template: "matrix_2x2", labels: ["Why", "What", "How", "If"] },
  "PAS": { tier: "P2", template: "flow_linear", labels: ["Problem", "Agitate", "Solution"] },
  "Hero's Journey": { tier: "P2", template: "steps_up", labels: ["Call", "Trials", "Abyss", "Return"] },
  "Elevator Pitch": { tier: "P2", template: "flow_linear", labels: ["Who", "Problem", "Value", "Ask"] },
  "Yes And": { tier: "P2", template: "flow_linear", labels: ["Listen", "Yes", "And"] },
  "MECE": { tier: "P2", template: "tree_branch", labels: ["Mutually Exclusive", "Collectively Exhaustive"] },
  "5W1H": { tier: "P2", template: "star_6", labels: ["Who", "What", "When", "Where", "Why", "How"] },
  "9-Grid Thinking": { tier: "P2", template: "grid_3x3", labels: ["视角1", "视角2", "视角3", "视角4", "视角5", "视角6", "视角7", "视角8", "视角9"] },
  "Issue Tree": { tier: "P2", template: "tree_branch", labels: ["Problem", "Sub-issue 1", "Sub-issue 2"] },
  "Decision Tree": { tier: "P2", template: "flow_tree", labels: ["Decision", "Chance", "Outcome"] },
  "ORID": { tier: "P2", template: "funnel", labels: ["Objective", "Reflective", "Interpretive", "Decisional"] },
  "Abstraction Ladder": { tier: "P2", template: "ladder", labels: ["Abstract (Why)", "Concrete (How)"] },
  "Logical Levels": { tier: "P2", template: "pyramid", labels: ["Environment", "Behavior", "Capability", "Values", "Identity", "Spirit"] },
  
  // Strategy & Business
  "PESTLE": { tier: "P2", template: "hex_6", labels: ["Political", "Economic", "Social", "Technological", "Legal", "Environmental"] },
  "Generic Strategies": { tier: "P2", template: "matrix_2x2", labels: ["Cost Leadership", "Differentiation", "Cost Focus", "Diff Focus"] },
  "VRIO": { tier: "P2", template: "flow_gate", labels: ["Value", "Rarity", "Imitability", "Organization"] },
  "Ansoff Matrix": { tier: "P2", template: "matrix_2x2", labels: ["Market Pen.", "Product Dev.", "Market Dev.", "Diversification"] },
  "Core Competence": { tier: "P2", template: "tree_roots", labels: ["Core Skills", "End Products"] },
  "Business Model Canvas": { tier: "P2", template: "grid_3x3", labels: ["Key Partners", "Activities", "Resources", "Value Prop", "Relations", "Channels", "Segments", "Cost", "Revenue"] },
  "Value Proposition Canvas": { tier: "P2", template: "venn_2", labels: ["Customer Profile", "Value Map"] },
  "AARRR": { tier: "P2", template: "funnel", labels: ["Acquisition", "Activation", "Retention", "Revenue", "Referral"] },
  "SCAMPER": { tier: "P2", template: "list_checklist", labels: ["Substitute", "Combine", "Adapt", "Modify", "Put to use", "Eliminate", "Reverse"] },
  "TRIZ": { tier: "P2", template: "matrix_grid", labels: ["Contradiction", "Principles"] },
  "MVP": { tier: "P2", template: "pyramid_slice", labels: ["Functional", "Reliable", "Usable", "Emotional"] },
  
  // Management & Execution
  "JTBD": { tier: "P2", template: "flow_gate", labels: ["Job", "Struggle", "Progress"] },
  "Lean Startup": { tier: "P2", template: "loop_cycle", labels: ["Build", "Measure", "Learn"] },
  "Design Thinking": { tier: "P2", template: "flow_linear", labels: ["Empathize", "Define", "Ideate", "Prototype", "Test"] },
  "Minimum Viable Product": { tier: "P2", template: "pyramid_slice", labels: ["Core", "Reliable", "Usable", "Delight"] },
  "OKR": { tier: "P2", template: "tree_branch", labels: ["Objective", "Key Result 1", "Key Result 2", "Key Result 3"] },
  "KPI": { tier: "P2", template: "gauge", labels: ["Target", "Actual"] },
  "RACI": { tier: "P2", template: "matrix_grid", labels: ["Responsible", "Accountable", "Consulted", "Informed"] },
  "Tuckman Model": { tier: "P2", template: "steps_up", labels: ["Forming", "Storming", "Norming", "Performing", "Adjourning"] },
  "Kotter's 8 Steps": { tier: "P2", template: "steps_up", labels: ["Urgency", "Coalition", "Vision", "Communicate", "Empower", "Short-wins", "Consolidate", "Anchor"] },
  "Situational Leadership": { tier: "P2", template: "matrix_2x2", labels: ["Directing", "Coaching", "Supporting", "Delegating"] },
  "360 Feedback": { tier: "P2", template: "radar", labels: ["Self", "Manager", "Peer", "Direct Report"] },
  "P.A.R.A.": { tier: "P2", template: "stack_folders", labels: ["Projects", "Areas", "Resources", "Archives"] },
  "FMEA": { tier: "P2", template: "table", labels: ["Severity", "Occurrence", "Detection", "RPN"] },
  "Chaos Engineering": { tier: "P2", template: "loop_cycle", labels: ["Steady State", "Hypothesis", "Fault Injection", "Verify"] },
  "Red Teaming": { tier: "P2", template: "arrows_opposing", labels: ["Attack", "Defense"] },
  
  // Decision & Finance
  "Expected Value": { tier: "P2", template: "formula", labels: ["Probability", "Value"] },
  "RICE": { tier: "P2", template: "formula_fraction", labels: ["(Reach * Impact * Confidence)", "Effort"] },
  "Cost-Benefit Analysis": { tier: "P2", template: "scale_balance", labels: ["Costs", "Benefits"] },
  "Pros and Cons": { tier: "P2", template: "list_compare", labels: ["Pros", "Cons"] },
  "Regret Minimization": { tier: "P2", template: "timeline_future", labels: ["Age 80", "Current Decision"] },
  "Game Theory": { tier: "P2", template: "matrix_payoff", labels: ["Player A", "Player B"] },
  "Prisoner's Dilemma": { tier: "P2", template: "matrix_2x2", labels: ["Cooperate", "Defect"] },
  "Nash Equilibrium": { tier: "P2", template: "point_intersect", labels: ["Optimal Strategy"] },
  "Tragedy of the Commons": { tier: "P2", template: "loop_reinforce", labels: ["Individual Gain", "Collective Loss"] },
  "Incentive Design": { tier: "P2", template: "flow_linear", labels: ["Incentive", "Motivation", "Behavior"] },
  "Fogg Behavior Model": { tier: "P2", template: "chart_curve", labels: ["Motivation", "Ability", "Trigger"] },
  
  // Learning & Cognition
  "Bloom's Taxonomy": { tier: "P2", template: "pyramid", labels: ["Create", "Evaluate", "Analyze", "Apply", "Understand", "Remember"] },
  "Feynman Technique": { tier: "P2", template: "loop_cycle", labels: ["Study", "Teach", "Gap Fill", "Simplify"] },
  "Spaced Repetition": { tier: "P2", template: "chart_forgetting", labels: ["Review 1", "Review 2", "Review 3"] },
  "Ebbinghaus Forgetting Curve": { tier: "P2", template: "chart_decay", labels: ["Retention", "Time"] },
  "Dreyfus Model": { tier: "P2", template: "steps_up", labels: ["Novice", "Advanced Beginner", "Competent", "Proficient", "Expert"] },
  "Deliberate Practice": { tier: "P2", template: "target_zone", labels: ["Comfort", "Learning", "Panic"] },
  "Double Loop Learning": { tier: "P2", template: "loop_double", labels: ["Action", "Result", "Assumptions"] },
  "Growth Mindset": { tier: "P2", template: "list_compare", labels: ["Fixed", "Growth"] },
  "Cognitive Bias": { tier: "P2", template: "brain_map", labels: ["System 1", "System 2"] },
  "Meta-Cognition": { tier: "P2", template: "loop_reflection", labels: ["Thinking about Thinking"] },
  
  // System Thinking
  "Second-Order Thinking": { tier: "P2", template: "chain_consequence", labels: ["Action", "Result", "Future Result"] },
  "Systems Thinking": { tier: "P2", template: "network_nodes", labels: ["Elements", "Interconnections", "Purpose"] },
  "Occam's Razor": { tier: "P2", template: "filter_simple", labels: ["Complexity", "Simplicity"] },
  "Hanlon's Razor": { tier: "P2", template: "filter_simple", labels: ["Malice", "Stupidity"] },
  "Inversion": { tier: "P2", template: "mirror", labels: ["Forward", "Backward"] },
  "Antifragility": { tier: "P2", template: "chart_convex", labels: ["Fragile", "Robust", "Antifragile"] },
  "Mental Models Latticework": { tier: "P2", template: "grid_connected", labels: ["Model A", "Model B", "Model C"] },
  "Feedback Loop": { tier: "P2", template: "loop_figure8", labels: ["Balancing", "Reinforcing"] },
  "Leverage Points": { tier: "P2", template: "lever", labels: ["Force", "Fulcrum", "Result"] },
  "Dialectics": { tier: "P2", template: "spiral_up", labels: ["Thesis", "Antithesis", "Synthesis"] },
  "Paradox Thinking": { tier: "P2", template: "symbol_yin_yang", labels: ["Force A", "Force B"] },
  "Complex Adaptive Systems": { tier: "P2", template: "swarm", labels: ["Agents", "Simple Rules", "Emergence"] },
  "Entropy": { tier: "P2", template: "chart_decay", labels: ["Order", "Time"] },
  "Emergence": { tier: "P2", template: "network_nodes", labels: ["Local Rules", "Interactions", "Global Pattern"] }
};
