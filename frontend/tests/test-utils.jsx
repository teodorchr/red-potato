import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext.jsx';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n/index.js';

// Custom wrapper that includes all providers
const AllProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </I18nextProvider>
    </BrowserRouter>
  );
};

// Custom render function that wraps component with all providers
const customRender = (ui, options) =>
  render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Override the default render with our custom one
export { customRender as render };
