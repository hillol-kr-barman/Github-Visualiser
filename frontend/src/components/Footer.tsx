import { Link } from 'react-router-dom'
import { socials } from './siteData/socials'

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.07)] mt-auto">
      <div className="mx-auto max-w-[900px] px-8 py-6 flex items-center justify-between flex-wrap gap-4">
        <p className="text-[0.78rem] text-[#6b7685] m-0">
          &copy; {new Date().getFullYear()}{' '}
          <Link to="/about" className="text-[#9aa3b0] hover:text-[#00d4dc] transition-colors no-underline">
            Hillol Barman
          </Link>
          {' '}· Software Engineering Portfolio
        </p>
        <div className="flex items-center gap-4">
          {socials.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="text-[#6b7685] hover:text-[#00d4dc] transition-colors flex no-underline hover:no-underline"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon aria-hidden="true" width={18} height={18} />
            </a>
          ))}
          <Link
            to="/about"
            className="text-[0.78rem] text-[#6b7685] bg-[#161a1e] border border-[rgba(255,255,255,0.07)] rounded-[5px] px-[10px] py-[4px] hover:border-[#00d4dc] hover:text-[#00d4dc] transition-colors no-underline hover:no-underline"
          >
            About
          </Link>
        </div>
      </div>
    </footer>
  )
}
