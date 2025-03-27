import React from 'react';
import Header from '@/components/layout/Header';
const Layout = ({ children }) => {
    return (
        <div>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
