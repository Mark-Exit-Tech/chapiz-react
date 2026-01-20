'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => {
  const internalRef = React.useRef<HTMLDivElement>(null);
  const [isRTL, setIsRTL] = React.useState(false);

  React.useEffect(() => {
    // Check if we're in an RTL context
    const checkRTL = () => {
      let element = internalRef.current?.parentElement;
      while (element) {
        const dir = element.getAttribute('dir');
        if (dir === 'rtl') {
          setIsRTL(true);
          return;
        }
        if (dir === 'ltr') {
          setIsRTL(false);
          return;
        }
        element = element.parentElement;
      }
      // Check document direction as fallback
      const docDir = document.documentElement.dir || document.body.dir;
      setIsRTL(docDir === 'rtl');
    };

    checkRTL();
  }, []);

  // Override align based on RTL detection if align is explicitly 'start'
  const finalAlign = align === 'start' && isRTL ? 'end' : align;

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={(node) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          (internalRef as any).current = node;
        }}
        align={finalAlign}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 shadow-md outline-hidden',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
