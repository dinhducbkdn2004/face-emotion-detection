import React from 'react';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    className = '',
    disabled = false,
    onClick,
    fullWidth = false,
    ...props
}) => {
    const baseStyles =
        'py-2 px-4 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';

    const variantStyles = {
        primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
        secondary:
            'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white',
        success:
            'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white',
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
        outline:
            'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <button
            type={type}
            className={`${baseStyles} ${variantStyles[variant]} ${widthClass} ${disabledClass} ${className}`}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
