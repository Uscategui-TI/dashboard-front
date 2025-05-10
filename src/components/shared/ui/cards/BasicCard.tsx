interface BasicCardProps {
    children: React.ReactNode;
    noPadding?: boolean;
  }
  
  export const BasicCard = ({ children, noPadding = false }: BasicCardProps) => {
    return (
      <div
        className={`relative rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${
          noPadding ? "" : "px-5 pt-5 sm:px-6 sm:pt-6"
        }`}
      >
        {children}
      </div>
    );
  };
  