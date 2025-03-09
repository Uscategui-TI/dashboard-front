'use client';

import React from 'react';
import PhoneNumberForm from './number';

const Page: React.FC = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <PhoneNumberForm />
        </div>
    );
};

export default Page;


