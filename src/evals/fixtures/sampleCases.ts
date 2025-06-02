import { EvalCase } from '../types';

export const sampleEvalCases: EvalCase[] = [
  {
    id: 'basic-login',
    name: 'Basic Login User Story',
    input: 'As a user, I want to be able to log in to my account so that I can access my dashboard.',
    tags: ['login', 'authentication', 'basic'],
  },
  {
    id: 'short-story',
    name: 'Minimal Valid User Story',
    input: 'As a customer, I want to view my order history so that I can track my purchases.',
    tags: ['edge-case', 'minimal'],
  },
  {
    id: 'complex-story',
    name: 'Complex Multi-aspect Story',
    input: 'As an admin, I want to manage user accounts including creating, editing, deleting users and assigning roles so that I can maintain proper access control and user management.',
    tags: ['complex', 'multiple-requirements'],
  },
  {
    id: 'ecommerce-checkout',
    name: 'E-commerce Checkout',
    input: 'As a shopper, I want to complete my purchase securely so that I can receive my items.',
    tags: ['ecommerce', 'security'],
  },
  {
    id: 'mobile-notification',
    name: 'Mobile Push Notification',
    input: 'As a mobile app user, I want to receive push notifications about important updates so that I stay informed about relevant activities.',
    tags: ['mobile', 'notifications'],
  },
  {
    id: 'reporting-dashboard',
    name: 'Analytics Dashboard',
    input: 'As a business analyst, I want to generate custom reports with various filters and export options so that I can analyze business performance.',
    tags: ['analytics', 'reporting'],
  },
  {
    id: 'social-sharing',
    name: 'Social Media Integration',
    input: 'As a content creator, I want to share my posts directly to social media platforms so that I can reach a wider audience.',
    tags: ['social', 'integration'],
  },
];