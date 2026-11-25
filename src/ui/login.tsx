import { hydrateRoot } from 'react-dom/client';
import { LoginPage } from './login-page.tsx';
import { requireElement } from './dom.ts';
import './login.css';
import './buttons.css';

hydrateRoot(requireElement('#root'), <LoginPage />);
