import {AriaSelectProps} from '@react-types/select';
import {ButtonContext} from './Button';
import {createContext, HTMLAttributes, ReactNode, useContext, useRef, useState} from 'react';
import {HiddenSelect, useSelect} from 'react-aria';
import {LabelContext} from './Label';
import {ListBoxContext, ListBoxProps} from './ListBox';
import {PopoverContext} from './Popover';
import {Provider, RenderProps, useRenderProps, useSlot} from './utils';
import React from 'react';
import {SelectState, useSelectState} from 'react-stately';
import {useCollection} from './Collection';

interface SelectValueContext {
  state: SelectState<unknown>,
  valueProps: HTMLAttributes<HTMLElement>
}

const SelectContext = createContext<SelectValueContext>(null);

export function Select<T extends object>(props: AriaSelectProps<T>) {
  let [listBoxProps, setListBoxProps] = useState<ListBoxProps<any>>({children: []});

  let {portal, collection} = useCollection(listBoxProps);
  let state = useSelectState({
    ...props,
    collection
  });

  // Get props for child elements from useSelect
  let ref = useRef();
  let [labelRef, label] = useSlot();
  let {
    labelProps,
    triggerProps,
    valueProps,
    menuProps
  } = useSelect({...props, label}, state, ref);

  return (
    <Provider
      values={[
        [SelectContext, {state, valueProps}],
        [LabelContext, {...labelProps, ref: labelRef, elementType: 'span'}],
        [ButtonContext, {...triggerProps, ref}],
        [PopoverContext, {state, triggerRef: ref, preserveChildren: true}],
        [ListBoxContext, {state, setListBoxProps, ...menuProps}]
      ]}>
      {props.children}
      {portal}
      <HiddenSelect
        state={state}
        triggerRef={ref}
        label={props.label}
        name={props.name} />
    </Provider>
  );
}

interface SelectValueProps extends Omit<HTMLAttributes<HTMLElement>, keyof RenderProps<unknown>>, RenderProps<{selectedItem: ReactNode}> {}

export function SelectValue(props: SelectValueProps) {
  let {state, valueProps} = useContext(SelectContext);
  let renderProps = useRenderProps({
    ...props,
    defaultChildren: state.selectedItem?.rendered || 'Select an item',
    values: {
      selectedItem: state.selectedItem?.rendered
    }
  });

  return (
    <span {...valueProps} {...renderProps} />
  );
}
