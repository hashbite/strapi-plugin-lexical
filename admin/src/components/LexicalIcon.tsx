import React from 'react';
import { IconProps } from './ icons/icon.types';

export const LexicalIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ width = '30', height = '23', color = 'currentColor', className, ...props }, forwardedRef) => (
    <svg
      ref={forwardedRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="16"
      height="16"
      className={className}
      {...props}
    >
      <rect width={width} height={height} x=".5" y="4.5" fill="#EAF5FF" stroke="#B8E1FF" rx="2.5" />
      <path fill="#76b6ff" d="M13.204 14.77H9.476V13.56h3.728z" />
      <path d="M17.78 14.77h-3.728V13.56h3.728z" />
      <path
        fill="#76b6ff"
        d="M20.153 14.77h-1.525V13.56h1.525zM15.577 16.709H9.476v-1.212h6.101zM20.153 16.709h-3.729v-1.212h3.73z"
      />
      <path d="M13.204 18.648H9.476v-1.212h3.728z" />
      <path fill="#76b6ff" d="M17.78 18.648h-3.728v-1.212h3.728z" />
      <path d="M20.153 18.648h-1.525v-1.212h1.525z" />
      <path d="M24.56 9.318v1.211h-1.865v11.148h1.865v1.212h-5.254v-1.212H21V10.529h-1.695V9.318Zm-4.407 1.817v1.212H7.781v7.512h12.372v1.212H6.086v-9.936Zm5.932 0v9.936h-2.542V19.86h.847v-7.512h-.847v-1.212Z" />
    </svg>
  )
);

LexicalIcon.displayName = 'LexicalIcon';
