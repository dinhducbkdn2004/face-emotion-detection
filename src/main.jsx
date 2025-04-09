import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'react-toastify/dist/ReactToastify.css';
import store from './store';
import App from './App';
import './index.css';
import { UserProvider } from './components/account/UserContext';
import { ThemeProvider } from './components/theme/ThemeContext';
import ToastWrapper from './components/toasts/ToastWrapper';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <ThemeProvider>
                    <UserProvider>
                        <ToastWrapper>
                            <App />
                        </ToastWrapper>
                    </UserProvider>
                </ThemeProvider>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);
