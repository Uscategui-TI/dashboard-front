// components/Loader.tsx
import React from 'react';
import styles from './Loader.module.css';

interface LoaderProps {
    fullScreen?: boolean;
    text?: string;
}

export const BasicLoader: React.FC<LoaderProps> = ({ fullScreen = true, text }) => {
    const loaderContent = (
        <div className="flex flex-col items-center justify-center space-y-3">
        <span className={styles.loader}></span>
        {text && <p className="text-white text-sm">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
        <div className="fixed inset-0 z-30 flex items-center justify-center backdrop-blur-[1px] bg-black/50">
            {loaderContent}
        </div>
        );
    }

    return loaderContent;
};

