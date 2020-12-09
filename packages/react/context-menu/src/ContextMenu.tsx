import * as React from 'react';
import { composeEventHandlers, createContext, extendComponent } from '@interop-ui/react-utils';
import { forwardRefWithAs } from '@interop-ui/react-polymorphic';
import { getPartDataAttrObj, makeRect } from '@interop-ui/utils';
import * as MenuPrimitive from '@interop-ui/react-menu';

import type { Point, MeasurableElement } from '@interop-ui/utils';

/* -------------------------------------------------------------------------------------------------
 * ContextMenu
 * -----------------------------------------------------------------------------------------------*/

const CONTEXT_MENU_NAME = 'ContextMenu';

type ContextMenuContextValue = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  anchorPointRef: React.MutableRefObject<Point>;
  anchorRef: React.MutableRefObject<MeasurableElement | null>;
};

const [ContextMenuContext, useContextMenuContext] = createContext<ContextMenuContextValue>(
  CONTEXT_MENU_NAME + 'Context',
  CONTEXT_MENU_NAME
);

const ContextMenu: React.FC = (props) => {
  const { children } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const anchorPointRef = React.useRef<Point>({ x: 0, y: 0 });
  const anchorRef = React.useRef({
    getBoundingClientRect: () => makeRect({ width: 0, height: 0 }, anchorPointRef.current),
  });
  const context = React.useMemo(() => ({ isOpen, setIsOpen, anchorPointRef, anchorRef }), [isOpen]);

  return <ContextMenuContext.Provider value={context}>{children}</ContextMenuContext.Provider>;
};

ContextMenu.displayName = CONTEXT_MENU_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'ContextMenuTrigger';
const TRIGGER_DEFAULT_TAG = 'div';

const ContextMenuTrigger = forwardRefWithAs<typeof TRIGGER_DEFAULT_TAG>((props, forwardedRef) => {
  const { as: Comp = TRIGGER_DEFAULT_TAG, onClick, ...triggerProps } = props;
  const context = useContextMenuContext(TRIGGER_NAME);

  return (
    <Comp
      {...getPartDataAttrObj(TRIGGER_NAME)}
      ref={forwardedRef}
      {...triggerProps}
      onContextMenu={composeEventHandlers(triggerProps.onContextMenu, (event) => {
        event.preventDefault();
        const point = { x: event.clientX, y: event.clientY };
        context.setIsOpen(true);
        context.anchorPointRef.current = point;
      })}
    />
  );
});

ContextMenuTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * ContextMenuPopper
 * -----------------------------------------------------------------------------------------------*/

const POPPER_NAME = 'ContextMenuPopper';

type ContextMenuPopperOwnProps = {
  anchorRef?: React.ComponentProps<typeof MenuPrimitive.Root>['anchorRef'];
  trapFocus: never;
  onCloseAutoFocus: never;
  onOpenAutoFocus: never;
  onDismiss: never;
};

const ContextMenuPopper = forwardRefWithAs<typeof MenuPrimitive.Root, ContextMenuPopperOwnProps>(
  (props, forwardedRef) => {
    const {
      anchorRef,
      disableOutsidePointerEvents = true,
      disableOutsideScroll = true,
      shouldPortal = true,
      ...popperProps
    } = props;
    const context = useContextMenuContext(POPPER_NAME);
    return (
      <MenuPrimitive.Root
        ref={forwardedRef}
        {...popperProps}
        isOpen={context.isOpen}
        onIsOpenChange={context.setIsOpen}
        style={{
          ...popperProps.style,
          // re-namespace exposed popper custom property
          ['--interop-ui-context-menu-popper-transform-origin' as any]: 'var(--interop-ui-popper-transform-origin)',
        }}
        side="bottom"
        align="start"
        anchorRef={context.anchorRef}
        trapFocus
        disableOutsidePointerEvents={disableOutsidePointerEvents}
        disableOutsideScroll={disableOutsideScroll}
        shouldPortal={shouldPortal}
        onDismiss={() => context.setIsOpen(false)}
      />
    );
  }
);

ContextMenuPopper.displayName = POPPER_NAME;

/* -----------------------------------------------------------------------------------------------*/

const ContextMenuGroup = extendComponent(MenuPrimitive.Group, 'ContextMenuGroup');
const ContextMenuLabel = extendComponent(MenuPrimitive.Label, 'ContextMenuLabel');
const ContextMenuItem = extendComponent(MenuPrimitive.Item, 'ContextMenuItem');
const ContextMenuCheckboxItem = extendComponent(
  MenuPrimitive.CheckboxItem,
  'ContextMenuCheckboxItem'
);
const ContextMenuRadioGroup = extendComponent(MenuPrimitive.RadioGroup, 'ContextMenuRadioGroup');
const ContextMenuRadioItem = extendComponent(MenuPrimitive.RadioItem, 'ContextMenuRadioItem');
const ContextMenuItemIndicator = extendComponent(
  MenuPrimitive.ItemIndicator,
  'ContextMenuItemIndicator'
);
const ContextMenuSeparator = extendComponent(MenuPrimitive.Separator, 'ContextMenuSeparator');

/* -----------------------------------------------------------------------------------------------*/

const Root = ContextMenu;
const Trigger = ContextMenuTrigger;
const Popper = ContextMenuPopper;
const MenuGroup = ContextMenuGroup;
const MenuLabel = ContextMenuLabel;
const MenuItem = ContextMenuItem;
const MenuCheckboxItem = ContextMenuCheckboxItem;
const MenuRadioGroup = ContextMenuRadioGroup;
const MenuRadioItem = ContextMenuRadioItem;
const MenuItemIndicator = ContextMenuItemIndicator;
const MenuSeparator = ContextMenuSeparator;

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPopper,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuItemIndicator,
  ContextMenuSeparator,
  //
  Root,
  Trigger,
  Popper,
  MenuGroup,
  MenuLabel,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuItemIndicator,
  MenuSeparator,
};