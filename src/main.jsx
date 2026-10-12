import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { profile, research, publications, courses, media } from './content';
import './styles.css';

const pages = [ ['about', 'About'], ['research', 'Research'], ['teaching', 'Teaching'], ['publication', 'Publication'], ['media-engagement', 'Media engagement'] ];
const currentPage = () => pages.some(([id]) => id === window.location.hash.slice(1)) ? window.location.hash.slice(1) : 'about';
const Arrow = ({ external = false }) => <span aria-hidden="true">{external ? '↗' : '→'}</span>;
const Email = ({ children = profile.email }) => <a className="text-link" href={`mailto:${profile.email}`}>{children} <Arrow /></a>;

function About() {
  return <div className="about-grid">
    <aside className="portrait-column">
      <img className="portrait" src={`${import.meta.env.BASE_URL}marie-robin.jpg`} alt={profile.name} width="3413" height="5120" fetchPriority="high" />
      <div className="portrait-caption"><span>Harvard University</span><span>Cambridge, Massachusetts</span></div>
      <div className="contact-block"><span className="eyebrow">Get in touch</span><Email /></div>
    </aside>
    <article className="about-copy">
      <p className="eyebrow">About</p>
      <h1>{profile.name}</h1>
      <p className="appointment">{profile.role}<br /><span>{profile.institution}</span></p>
      <div className="short-rule" />
      <p className="intro">{profile.introduction}</p>
      <div className="prose">{profile.about.map(p => <p key={p}>{p}</p>)}</div>
      <a className="text-link research-link" href="#research">Explore my research <Arrow /></a>
    </article>
  </div>;
}

function PageLayout({ label, title, titleClass, children, aside }) {
  return <div className="inner-grid"><aside className="section-aside"><p className="eyebrow">{label}</p>{aside}</aside><article className="page-content"><h1 className={titleClass}>{title}</h1>{children}</article></div>;
}

function Research() {
  return <PageLayout label="Research" title={<em>« {research.title}: {research.subtitle} »</em>} titleClass="thesis-title" aside={<><p className="aside-title">Current book project</p><p>France & its Empire<br />North Africa<br />Southeast Asia</p></>}>
    <div className="prose research-prose">{research.paragraphs.map(p => <p key={p}>{p}</p>)}</div>
    <a className="text-link" href="#publication">View publications <Arrow /></a>
  </PageLayout>;
}

function Teaching() {
  return <PageLayout label="Teaching" title="Teaching" titleClass="sr-only" aside={<><p className="aside-title">Teaching experience</p><p>Columbia University<br />Barnard College</p></>}>
    <p className="intro smaller">I served as a teaching assistant and guest lecturer for a variety of courses at Columbia University and Barnard College.</p>
    <h2 className="list-heading">Courses</h2>
    <ul className="course-list">{courses.map((course, i) => <li key={course}><span className="course-number" aria-hidden="true">0{i + 1}</span><span>{course}</span></li>)}</ul>
    <div className="teaching-note"><p className="eyebrow">Earlier teaching</p><p>I began developing my teaching skills in 2019 as a history and geography teacher for the French Ministry of Education.</p></div>
  </PageLayout>;
}

function Publications() {
  return <PageLayout label="Publication" title="Publications" aside={<><p className="aside-title">Scholarly writing</p><p>Journal articles<br />Book chapters</p></>}>
    <div className="publication-list">{publications.map(item => <section className="publication" key={item.title}><div className="entry-meta"><span className={item.year === 'Forthcoming' ? 'status' : ''}>{item.year}</span><span>{item.type}</span></div><h2>{item.title}</h2><p><em>{item.venue}</em>{item.detail && <><br />{item.detail}</>}</p></section>)}</div>
  </PageLayout>;
}

function Media() {
  return <PageLayout label="Media engagement" title="Beyond the academy" aside={<><p className="aside-title">Public engagement</p><p>Conversations, essays<br />& cultural collaborations</p><div className="aside-contact"><span className="eyebrow">For enquiries</span><Email>Get in touch</Email></div></>}>
    <div className="media-list">{media.map(item => <section className="media-entry" key={item.title}><p className="eyebrow">{item.type}</p><h2>{item.title}</h2><p className="media-venue">{item.title === 'Noubia: Against Erasure' ? <>Mohamed Bourouissa. <em>Pour Noubia</em></> : item.venue}</p>{item.detail && <p className="media-detail">{item.detail}</p>}<div className="media-links">{item.links.map(link => <a key={link.url} className="text-link" href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<Arrow external /><span className="sr-only"> (opens in a new tab)</span></a>)}</div></section>)}</div>
  </PageLayout>;
}

function App() {
  const [page, setPage] = useState(currentPage);
  const [menuOpen, setMenuOpen] = useState(false);
  const main = useRef(null);
  useEffect(() => {
    const navigate = () => {
      setPage(currentPage());
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
      requestAnimationFrame(() => main.current?.focus({ preventScroll: true }));
    };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  useEffect(() => { document.title = page === 'about' ? `${profile.name} | Historian & Harvard Postdoctoral Fellow` : `${pages.find(([id]) => id === page)[1]} | ${profile.name}`; }, [page]);
  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') { setMenuOpen(false); document.querySelector('.menu-toggle')?.focus(); } };
    if (menuOpen) window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [menuOpen]);
  const content = { about: <About />, research: <Research />, teaching: <Teaching />, publication: <Publications />, 'media-engagement': <Media /> };
  return <>
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); main.current?.focus(); }}>Skip to content</a>
    <header className="site-header"><div className="header-inner">
      <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}<span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
      <nav id="main-navigation" className={menuOpen ? 'navigation is-open' : 'navigation'} aria-label="Main navigation">{pages.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={page === id ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
    </div></header>
    <main id="main-content" ref={main} tabIndex="-1" key={page}>{content[page]}</main>
    <footer className="site-footer"><div><a href="#about" className="footer-name">{profile.name}</a><span>Historian of modern France & its Empire</span></div><Email /></footer>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
