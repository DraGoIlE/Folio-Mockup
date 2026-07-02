// Data dummy. Nanti kalau Rehanu udah selesai bikin User Service asli
// (nyambung ke PostgreSQL), file ini nggak kepake lagi.

const candidates = [
  {
    id: "cand-1",
    name: "Anisa Putri",
    skills: ["JavaScript", "React", "Node.js"],
    experience_years: 2,
    expected_salary: 8000000,
    cv_url: "https://example.com/cv/anisa.pdf",
  },
  {
    id: "cand-2",
    name: "Budi Santoso",
    skills: ["Python", "Django", "PostgreSQL"],
    experience_years: 4,
    expected_salary: 12000000,
    cv_url: "https://example.com/cv/budi.pdf",
  },
  {
    id: "cand-3",
    name: "Citra Dewi",
    skills: ["Go", "gRPC", "Kubernetes"],
    experience_years: 3,
    expected_salary: 15000000,
    cv_url: "https://example.com/cv/citra.pdf",
  },
  {
    id: "cand-4",
    name: "Dimas Prayoga",
    skills: ["JavaScript", "Vue", "CSS"],
    experience_years: 1,
    expected_salary: 6000000,
    cv_url: "https://example.com/cv/dimas.pdf",
  },
];

const jobs = [
  {
    id: "job-1",
    hrd_id: "hrd-1",
    company_name: "PT Teknologi Maju",
    title: "Frontend Developer",
    description: "Membangun UI web pakai React",
    required_skills: ["JavaScript", "React"],
    salary_min: 7000000,
    salary_max: 10000000,
  },
  {
    id: "job-2",
    hrd_id: "hrd-2",
    company_name: "Startup Cepat",
    title: "Backend Engineer",
    description: "Develop API pakai Python/Django",
    required_skills: ["Python", "Django"],
    salary_min: 10000000,
    salary_max: 14000000,
  },
  {
    id: "job-3",
    hrd_id: "hrd-1",
    company_name: "PT Teknologi Maju",
    title: "Platform Engineer",
    description: "Kelola infra microservices",
    required_skills: ["Go", "gRPC", "Kubernetes"],
    salary_min: 13000000,
    salary_max: 18000000,
  },
];

module.exports = { candidates, jobs };
