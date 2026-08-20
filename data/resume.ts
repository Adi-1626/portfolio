// ─────────────────────────────────────────────────────────────
// data/resume.ts — Single source of truth for portfolio content
// Source: Resume_Aug26.pdf (Aditya Nitin Gawali)
// Rule: any field not in the resume is omitted, never invented.
// ─────────────────────────────────────────────────────────────

export type StatusDot = "available" | "open" | "unavailable";

export interface ResumeData {
  name: string;
  headline: string;
  location: string;
  status: { label: string; dot: StatusDot };
  summary: string;
  about: string;
  education: {
    institution: string;
    degree: string;
    dateRange: string;
    details: string;
  }[];
  experience: {
    org: string;
    title: string;
    location: string;
    dateRange: string;
    current: boolean;
    bullets: string[];
  }[];
  projects: {
    name: string;
    description: string;
    stack: string[];
    date: string;
    links?: { repo?: string; demo?: string };
  }[];
  skills: { [category: string]: string[] };
  contact: {
    email: string;
    phone: string;
    links: {
      github: string;
      linkedin: string;
      resume: string;
    };
  };
}

export const resume: ResumeData = {
  name: "Aditya Nitin Gawali",
  headline: "AI/ML & Backend Engineer",
  location: "Pune, Maharashtra, India",
  status: { label: "Open to Opportunities", dot: "open" },

  summary:
    "AI/ML-focused Computer Engineering student with experience building AI agents, ML applications, REST APIs, and cloud-backed systems using Python, LLMs, and AWS.",

  about:
    "I'm a Computer Engineering student at NBN Sinhgad Technical Institutes Campus with a deep focus on AI/ML and backend systems. I've built AI agents, machine learning pipelines, and production REST APIs — and I'm currently contributing to a real-world health-tech product as an AI Research & Backend Integration Intern. I enjoy working at the intersection of applied ML and scalable backend architecture, and I'm experienced with cloud infrastructure on AWS, mobile development with React Native, and database systems including Firebase and SQLite.",

  education: [
    {
      institution: "NBN Sinhgad Technical Institutes Campus",
      degree: "B.E. in Computer Engineering",
      dateRange: "July 2024 – Present",
      details: "CGPA: 8.38/10",
    },
    {
      institution: "Sou. Venutai Chavan Polytechnic",
      degree: "Diploma in Computer Technology",
      dateRange: "June 2021 – June 2024",
      details: "Percentage: 88.51%",
    },
  ],

  experience: [
    {
      org: "Sectfit Healthtech Pvt. Ltd.",
      title: "AI Research & Backend Integration Intern",
      location: "Pune, Maharashtra, India",
      dateRange: "May 2026 – Present",
      current: true,
      bullets: [
        "Developed AI agents and backend workflows for a health-tech application using REST APIs, Firebase, CRUD operations, and real-time data flows.",
        "Played a key role in migrating the production application from FlutterFlow to React Native + TypeScript, translating Figma/FlutterFlow designs into reusable TSX components.",
        "Implemented backend-connected application logic using Node.js, Express, REST APIs, Firestore, Zustand, and TanStack Query, focusing on performance, scalability, and optimization.",
      ],
    },
    {
      org: "Sanyu Infotech Pvt. Ltd.",
      title: "AWS Intern",
      location: "Remote",
      dateRange: "Jan 2026 – Feb 2026",
      current: false,
      bullets: [
        "Built an AI-powered cloud storage platform using Amazon Rekognition that auto-tags images by visual content, reducing image search time by ~90%.",
        "Deployed the platform on AWS using EC2, S3, RDS, Auto Scaling, Load Balancing, and Elastic Beanstalk.",
      ],
    },
    {
      org: "Infeanet Digital Marketing & Web Media",
      title: "Android Developer Intern",
      location: "Remote",
      dateRange: "June 2023 – July 2023",
      current: false,
      bullets: [
        "Delivered 2 production Android apps: a multi-engine web browser and an AI chatbot integrating the ChatGPT API.",
        "Integrated REST APIs and Firebase for real-time data synchronization across both applications.",
      ],
    },
  ],

  projects: [
    {
      name: "Clickbait Clarifier",
      description:
        "LightGBM + Llama 3.1 ensemble with a Flask REST API detecting YouTube clickbait using video metadata and transcripts. A Chrome Extension delivers real-time ML inference directly in the browser.",
      stack: ["Python", "LightGBM", "Llama 3.1", "Flask", "Chrome Extension"],
      date: "Feb 2026",
      links: { repo: "https://github.com/Adi-1626/AntiClickbait" },
    },
    {
      name: "Omnichat",
      description:
        "Python CLI chat application using the Cerebras API with real-time streaming, dynamic model switching, and persistent SQLite conversation history.",
      stack: ["Python", "Cerebras API", "SQLite"],
      date: "Feb 2026",
      links: { repo: "https://github.com/Adi-1626/OmniChat" },
    },
    {
      name: "Retail POS & Invoice System",
      description:
        "PySide6 desktop point-of-sale application with SQLite, GST-compliant PDF invoice generation, inventory tracking, and analytics dashboards.",
      stack: ["Python", "PySide6", "SQLite"],
      date: "May 2024",
      links: { repo: "https://github.com/Adi-1626/VendorVault" },
    },
  ],

  skills: {
    Languages: ["Python", "C++", "Java", "TypeScript"],
    "AI / ML": [
      "Machine Learning",
      "LightGBM",
      "Llama 3.1",
      "ChatGPT API",
      "Cerebras API",
      "AI Agents",
    ],
    Backend: [
      "Node.js",
      "Express",
      "Flask",
      "FastAPI",
      "REST APIs",
      "CRUD",
      "API Integration",
    ],
    "Cloud / Mobile": [
      "AWS",
      "React Native",
      "Firebase",
      "Zustand",
      "TanStack Query",
      "GitHub Actions",
    ],
    "Data / Production": [
      "Firestore",
      "SQLite",
      "Firebase Auth",
      "FCM",
      "Firebase Storage",
      "Sentry",
      "Crashlytics",
      "Git",
    ],
  },

  contact: {
    email: "adityagawali16@gmail.com",
    phone: "+91 8830933987",
    links: {
      github: "https://github.com/Adi-1626",
      linkedin: "https://www.linkedin.com/in/aditya-gawali-b13a50265/",
      resume: "/resume.pdf",
    },
  },
};
