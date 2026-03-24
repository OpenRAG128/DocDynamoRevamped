import React from "react";
import {
  FaUserShield,
  FaChartLine,
  FaGavel,
  FaClipboardCheck,
  FaTasks,
  FaCoins,
  FaSearchDollar,
  FaHandshake,
  FaGraduationCap,
  FaFlask,
  FaRocket,
} from "react-icons/fa";

export const personas = [
  {
    id: "CO",
    label: "Compliance Officer",
    icon: <FaUserShield />,
    description: "RegTech & Regulatory Intelligence",
    prompts: [
      "What are new KYC norms for digital lenders?",
      "Summarise PMLA obligations for NBFCs",
      "What changed in latest RBI circular?",
    ],
  },
  {
    id: "RA",
    label: "Risk & Credit Analyst",
    icon: <FaChartLine />,
    description: "Underwriting & Credit Intelligence",
    prompts: [
      "What is debt-to-income ratio from this statement?",
      "List all contingent liabilities disclosed",
      "Summarise auditor concerns in this report",
    ],
  },
  {
    id: "LC",
    label: "Legal & Contract Counsel",
    icon: <FaGavel />,
    description: "Contract Analysis & Clause Extraction",
    prompts: [
      "What are all events of default in this agreement?",
      "List prepayment penalty clauses",
      "Summarise litigation risks in this DRHP",
    ],
  },
  {
    id: "IA",
    label: "Internal Auditor",
    icon: <FaClipboardCheck />,
    description: "Audit Readiness & Control Verification",
    prompts: [
      "Which controls are flagged as deficient?",
      "What management actions are outstanding?",
      "List all observations from last audit cycle",
    ],
  },
  {
    id: "PM",
    label: "Product & Strategy Manager",
    icon: <FaTasks />,
    description: "Market & Regulatory Research",
    prompts: [
      "What does RBI sandbox allow for P2P lenders?",
      "Summarise NPCI's latest UPI policy changes",
      "What are risk disclosures in competitor DRHP?",
    ],
  },
  {
    id: "CF",
    label: "CFO / Finance Controller",
    icon: <FaCoins />,
    description: "Financial Reporting & Treasury",
    prompts: [
      "What are key variance drivers vs last quarter?",
      "Summarise investor rights in this term sheet",
      "What ESOP vesting schedule is defined here?",
    ],
  },
  {
    id: "FI",
    label: "Fraud & AML Investigator",
    icon: <FaSearchDollar />,
    description: "Transaction & Pattern Intelligence",
    prompts: [
      "What triggers are defined for SAR filing?",
      "List all red flags found in this investigation",
      "What FATF guidance applies to crypto exchanges?",
    ],
  },
  {
    id: "IR",
    label: "Investor Relations / VC Analyst",
    icon: <FaHandshake />,
    description: "Investment & Due Diligence Intelligence",
    prompts: [
      "What are top 5 risk factors in this DRHP?",
      "Summarise use of IPO proceeds",
      "What revenue model is described in data room?",
    ],
  },
  {
    id: "ST",
    label: "Student",
    icon: <FaGraduationCap />,
    description: "Academic Research & FinTech Learning",
    prompts: [
      "Explain the key concepts covered in this research paper",
      "What are the limitations identified by the author?",
      "How does this paper define digital financial inclusion?",
    ],
  },
  {
    id: "RS",
    label: "Researcher",
    icon: <FaFlask />,
    description: "Policy Analysis & Academic Intelligence",
    prompts: [
      "What are the core policy recommendations in this report?",
      "Compare the regulatory frameworks described across countries",
      "What datasets were used in this research?",
    ],
  },
  {
    id: "FO",
    label: "Founder / Startup Leader",
    icon: <FaRocket />,
    description: "Business Strategy & Fundraising Intelligence",
    prompts: [
      "Summarise the anti-dilution clauses in this SHA",
      "What market size estimates are cited in this report?",
      "List all founder obligations defined in this agreement?",
    ],
  },
];
