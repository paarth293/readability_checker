import './style.css';
import { setupApp } from './ui/app';

const appElement = document.getElementById('app');
if (appElement) {
  setupApp(appElement);
}
