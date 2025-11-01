import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

export const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isPointer, setIsPointer] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });

            // Check if hovering over clickable element
            const target = e.target as HTMLElement;
            const isClickable =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.onclick !== null ||
                target.style.cursor === 'pointer' ||
                window.getComputedStyle(target).cursor === 'pointer';

            setIsPointer(isClickable);
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Hide default cursor
        document.body.style.cursor = 'none';

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.style.cursor = 'auto';
        };
    }, []);

    return (
        <>
            {/* Main cursor dot */}
            <div
                style={{
                    position: 'fixed',
                    left: position.x,
                    top: position.y,
                    width: isPointer ? 16 : 12,
                    height: isPointer ? 16 : 12,
                    borderRadius: '50%',
                    backgroundColor: isPointer ? '#3b82f6' : '#fff',
                    pointerEvents: 'none',
                    transform: 'translate(-50%, -50%)',
                    transition: 'width 0.2s, height 0.2s, background-color 0.2s',
                    zIndex: 9999,
                    mixBlendMode: 'difference',
                }}
            />

            {/* Cursor ring */}
            <div
                style={{
                    position: 'fixed',
                    left: position.x,
                    top: position.y,
                    width: isPointer ? 48 : 40,
                    height: isPointer ? 48 : 40,
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    pointerEvents: 'none',
                    transform: 'translate(-50%, -50%)',
                    transition: 'width 0.3s, height 0.3s',
                    zIndex: 9998,
                    mixBlendMode: 'difference',
                }}
            />
        </>
    );
};
