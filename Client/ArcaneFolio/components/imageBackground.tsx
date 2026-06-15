import React from 'react';

type Props = {
  children: React.ReactNode;
};

const ImageBackgroundWrapper = ({ children }: Props) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B1120',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
};

export default ImageBackgroundWrapper;
