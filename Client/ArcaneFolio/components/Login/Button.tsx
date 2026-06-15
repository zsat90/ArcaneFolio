import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    mode?: 'contained' | 'outlined' | 'text' | string;
    icon?: string;
    onPress?: React.MouseEventHandler<HTMLButtonElement>;
}

const ICON_MAP: Record<string, string> = {
    login: 'Log in',
    'account-plus': 'Add account',
    'library-books': 'Library',
    book: 'Book',
};

const Buttons = ({ mode = 'contained', icon, children, style, type = 'button', onPress, onClick, ...props }: Props) => {
    const iconLabel = icon ? ICON_MAP[icon] : null;
    const buttonStyle: React.CSSProperties = {
        width: '100%',
        minHeight: 44,
        border: mode === 'outlined' ? '1px solid rgba(255,255,255,0.45)' : '1px solid transparent',
        borderRadius: 8,
        backgroundColor: mode === 'text' ? 'transparent' : '#4A6FA5',
        color: '#fff',
        cursor: 'pointer',
        fontSize: 16,
        fontWeight: 700,
        padding: '10px 16px',
        ...style as React.CSSProperties,
    };

    return (
        <button type={type} {...props} onClick={onClick || onPress} style={buttonStyle}>
            {iconLabel ? <span className="sr-only">{iconLabel}</span> : null}
            {children}
        </button>
    );
};

export default Buttons;
