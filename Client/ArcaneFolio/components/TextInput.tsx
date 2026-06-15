import React from 'react';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
    label?: string;
    errorText?: string;
    icon?: string;
    onIconPress?: () => void;
    onChangeText?: (value: string) => void;
    secureTextEntry?: boolean;
}

const TextInput = ({ errorText, icon, onIconPress, onChangeText, secureTextEntry, label, type, ...props }: Props) => {
    return (
        <label style={styles.container}>
            {label ? <span style={styles.label}>{label}</span> : null}
            <span style={styles.inputWrap}>
                <input
                    {...props}
                    type={secureTextEntry ? 'password' : type || 'text'}
                    aria-invalid={Boolean(errorText)}
                    onChange={(event) => onChangeText?.(event.target.value)}
                    style={styles.input}
                />
                {icon ? (
                    <button type="button" onClick={onIconPress} aria-label={secureTextEntry ? 'Show password' : 'Hide password'} style={styles.iconButton}>
                        {secureTextEntry ? 'Show' : 'Hide'}
                    </button>
                ) : null}
            </span>
            {errorText ? <span style={styles.error}>{errorText}</span> : null}
        </label>

    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'block',
        margin: '8px 0',
        width: '100%',
    }, 
    label: {
        color: '#231F20',
        display: 'block',
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 6,
    },
    inputWrap: {
        display: 'flex',
        gap: 8,
        width: '100%',
    },
    input: {
        border: '1px solid #231F20',
        borderRadius: 8,
        flex: 1,
        height: 50,
        width: '100%',
        fontSize: 18,
        padding: '0 12px',
    },
    iconButton: {
        border: '1px solid #231F20',
        borderRadius: 8,
        background: '#fff',
        color: '#231F20',
        cursor: 'pointer',
        minWidth: 60,
        padding: '0 10px',
    },
    error: { 
        display: 'block',
        color: 'red',
        fontSize: 13,
        marginTop: 4,
    }
};

export default TextInput;
