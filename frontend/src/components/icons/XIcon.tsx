import { ComponentProps, forwardRef } from 'react';

const XIcon = forwardRef<SVGSVGElement, ComponentProps<'svg'> & { title?: string }>(
  ({ className, title, ...props }, ref) => {
    const labelled = Boolean(title);
    return (
      <svg
        ref={ref}
        fill="currentColor"
        viewBox="0 0 256 256"
        className={className}
        aria-hidden={labelled ? undefined : true}
        role={labelled ? 'img' : undefined}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
      </svg>
    );
  }
);

XIcon.displayName = "XIcon";

export default XIcon;
