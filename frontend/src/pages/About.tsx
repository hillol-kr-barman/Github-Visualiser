import { ProjectCard } from '@hillolbarman/ui'
import type { Project } from '@hillolbarman/ui'

const skills = [
  { name: 'JavaScript', dot: '#f7df1e' },
  { name: 'TypeScript', dot: '#3178c6' },
  { name: 'React', dot: '#61dafb' },
  { name: 'Tailwind CSS', dot: '#06b6d4' },
  { name: 'Python', dot: '#3776ab' },
  { name: 'FastAPI', dot: '#009688' },
  { name: 'Node.js', dot: '#68a063' },
  { name: 'Supabase', dot: '#3ecf8e' },
  { name: 'PostgreSQL', dot: '#336791' },
  { name: 'REST APIs', dot: '#00d4dc' },
  { name: 'Git / GitHub', dot: '#e8274b' },
  { name: 'AWS', dot: '#ff9900' },
  { name: 'Stripe', dot: '#635bff' },
  { name: 'Monaco Editor', dot: '#0078d4' },
]

const projects: Project[] = [
  {
    id: 1,
    title: 'Lazymate',
    content: 'Portfolio site and code playground — polished landing page, project showcase, About/CV section, a logged-in code editor, newsletter signup, and Stripe-powered support tiers.',
    projectTechstack: 'React 19, FastAPI, Supabase, Stripe, Monaco Editor, Tailwind CSS 4',
    imageSrc: 'https://opengraph.githubassets.com/0/hillol-kr-barman/lazymate',
    gitLink: 'https://lazymate.dev',
  },
  {
    id: 2,
    title: 'Git Visualiser',
    content: 'Interactive commit-graph explorer for GitHub repositories. Visualises branches, parent relationships, and recent activity — read-only, OAuth-backed.',
    projectTechstack: 'React, TypeScript, React Flow, Supabase, FastAPI',
    imageSrc: 'https://opengraph.githubassets.com/0/hillol-kr-barman/Github-Visualiser',
    gitLink: 'https://github.com/hillol-kr-barman/Github-Visualiser',
  },
]

export default function About() {
  return (
    <main className="mx-auto max-w-[800px] px-4 sm:px-8 pt-8 sm:pt-12 pb-20 w-full">
      {/* Page header */}
      <div className="mb-10">
        <p className="font-mono text-[0.72rem] text-accent uppercase tracking-[0.08em] mb-3">
          About the developer
        </p>
        <h1 className="text-[clamp(1.7rem,5vw,3rem)] font-bold tracking-[-0.03em] leading-[1.05] text-text mb-3">
          Hillol Barman
        </h1>
        <p className="text-[1rem] text-muted m-0">
          Building tools that make code more visible — and occasionally, things that are just fun to use.
        </p>
      </div>

      {/* Profile */}
      <section className="grid grid-cols-1 min-[480px]:grid-cols-[100px_1fr] gap-6 sm:gap-8 items-start mb-10">
        {/* Avatar */}
        <div className="relative flex items-center justify-center size-[100px]">
          <div
            className="absolute inset-0 rounded-full"
            style={{ border: '1.5px dashed rgba(0,212,220,0.25)', animation: 'spin 20s linear infinite' }}
          />
          <div className="size-[84px] rounded-full bg-surface-strong border-2 border-border flex items-center justify-center shrink-0">
            <span className="font-bold text-[1.8rem] text-accent tracking-[-0.03em]">HB</span>
          </div>
        </div>

        {/* Info */}
        <div>
          <h2 className="text-[1.5rem] font-bold tracking-[-0.02em] text-text mb-1">
            Hillol Barman
          </h2>
          <p className="font-mono text-[0.9rem] text-accent mb-3">
            @hillol-kr-barman · Software Engineer
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://lazymate.dev"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-surface border border-border rounded-[5px] px-2.5 py-1 text-[0.78rem] text-[#6b7685] hover:border-accent hover:text-accent transition-colors no-underline"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              lazymate.dev
            </a>
            <a
              href="https://github.com/hillol-kr-barman"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-surface border border-border rounded-[5px] px-2.5 py-1 text-[0.78rem] text-[#6b7685] hover:border-accent hover:text-accent transition-colors no-underline"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/hillolbarman/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-surface border border-border rounded-[5px] px-2.5 py-1 text-[0.78rem] text-[#6b7685] hover:border-accent hover:text-accent transition-colors no-underline"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.85-3.037-1.853 0-2.136 1.447-2.136 2.942v5.664H9.354V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.602 0 4.267 2.371 4.267 5.455v6.286h-.007ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.114 20.452H3.558V9h3.556v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
              </svg>
              LinkedIn
            </a>
            <a
              href="https://lazymate.dev/HillolBarman_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-surface border border-border rounded-[5px] px-2.5 py-1 text-[0.78rem] text-[#6b7685] hover:border-accent hover:text-accent transition-colors no-underline"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
              </svg>
              Resume PDF
            </a>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="mb-10">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#6b7685] mb-4">Bio</p>
        <p className="text-[0.95rem] text-muted leading-[1.8] m-0">
          I'm <strong className="text-text font-semibold">Hillol Barman</strong>, a software
          engineer who likes to build things that are genuinely useful — developer tools,
          portfolio experiments, and anything with an interesting UI challenge.{' '}
          My main project right now is <strong className="text-text font-semibold">Lazymate</strong>,
          a portfolio site and in-browser code playground built with{' '}
          <strong className="text-text font-semibold">React 19</strong>,{' '}
          <strong className="text-text font-semibold">FastAPI</strong>, and{' '}
          <strong className="text-text font-semibold">Supabase</strong>.
          I also built <strong className="text-text font-semibold">Git Visualiser</strong> to
          explore commit-graph rendering and read-only GitHub integrations.
        </p>
      </section>

      <hr className="border-0 h-px bg-border my-10" />

      {/* Technologies */}
      <section className="mb-10">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#6b7685] mb-4">Technologies</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center gap-1.5 bg-surface border border-border rounded-[5px] px-3 py-2 hover:border-[rgba(255,255,255,0.15)] hover:text-text transition-colors cursor-default group"
            >
              <span className="size-[6px] rounded-full shrink-0" style={{ backgroundColor: skill.dot }} />
              <span className="font-mono text-[0.75rem] text-muted group-hover:text-text transition-colors">
                {skill.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-0 h-px bg-border my-10" />

      {/* Projects */}
      <section className="mb-10">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#6b7685] mb-4">Projects</p>
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} variant="list" />
          ))}
        </div>
      </section>

      <hr className="border-0 h-px bg-border my-10" />

      {/* Contact */}
      <section>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#6b7685] mb-4">Contact</p>
        <p className="text-[0.88rem] text-[#6b7685] leading-[1.7] mb-6">
          Open to new opportunities, collaborations, and interesting projects. Reach out via email
          or connect on LinkedIn — I typically respond within a day or two.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <a
            href="mailto:hillolbarman@yahoo.com"
            className="flex items-center gap-2 bg-accent text-[#0a0c0d] font-semibold text-[0.85rem] px-[18px] py-[10px] rounded-[5px] hover:opacity-88 hover:-translate-y-px transition-all no-underline"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            Send email
          </a>
          <a
            href="https://github.com/hillol-kr-barman"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-transparent border border-border text-muted text-[0.85rem] px-[18px] py-[10px] rounded-[5px] hover:border-accent hover:text-accent transition-colors no-underline"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
            </svg>
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/hillolbarman/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-transparent border border-border text-muted text-[0.85rem] px-[18px] py-[10px] rounded-[5px] hover:border-accent hover:text-accent transition-colors no-underline"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.85-3.037-1.853 0-2.136 1.447-2.136 2.942v5.664H9.354V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.602 0 4.267 2.371 4.267 5.455v6.286h-.007ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.114 20.452H3.558V9h3.556v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"/>
            </svg>
            LinkedIn
          </a>
        </div>
      </section>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}
