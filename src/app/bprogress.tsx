'use client';
 
import { ProgressProvider } from '@bprogress/next/app';
 
const BProgress = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider 
      height="4px"
      color="#daff00"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};
 
export default BProgress;