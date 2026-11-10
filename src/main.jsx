import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import { pages } from './pages.js';
import './styles.css';

// Preserve bookmarks from the original hash-based site.
const legacy = pages.find(page => `#${page.id}` === location.hash);
if (legacy && location.pathname === '/') {
  location.replace(legacy.path + location.search);
} else {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const page = pages.find(page => (page.path.replace(/\/$/, '') || '/') === path);
  const root = document.getElementById('root');
  if (page) {
    const app = <App page={page.id} />;
    if (root.hasChildNodes()) hydrateRoot(root, app);
    else createRoot(root).render(app);
  } else {
    root.innerHTML = '<main><h1>Page not found</h1><p><a href="/">Return to the homepage</a></p></main>';
  }
}
