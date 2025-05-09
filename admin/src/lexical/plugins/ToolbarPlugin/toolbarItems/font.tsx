/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from 'react';
import { useIntl } from 'react-intl';

import { $patchStyleText } from '@lexical/selection';
import { $getSelection, LexicalEditor } from 'lexical';
import { useCallback } from 'react';

import DropDown, { DropDownItem } from '../../../ui/DropDown';

import { dropDownActiveClass } from '../codeLessUtils';

export function FontDropDown({
  editor,
  value,
  options,
  style,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: string;
  options: string[];
  style: string;
  disabled?: boolean;
}): JSX.Element {
  const { formatMessage } = useIntl();

  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style]
  );

  const buttonAriaLabel = formatMessage(
    {
      id: `lexical.plugin.toolbar.font.button.title`,
      defaultMessage: 'Formatting options for font {property}',
    },
    { property: style === 'font-family' ? 'family' : 'size' }
  );

  return (
    <DropDown
      disabled={disabled}
      buttonClassName={'toolbar-item ' + style}
      buttonLabel={value}
      buttonIconClassName={style === 'font-family' ? 'icon block-type font-family' : ''}
      buttonAriaLabel={buttonAriaLabel}
    >
      {options.map((option) => (
        <DropDownItem
          className={`item ${dropDownActiveClass(value === option)} ${
            style === 'font-size' ? 'fontsize-item' : ''
          }`}
          onClick={() => handleClick(option)}
          key={option}
          style={{ fontFamily: style === 'font-family' ? option : 'inherit' }}
        >
          <span className="text">{option}</span>
        </DropDownItem>
      ))}
    </DropDown>
  );
}
