/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from 'react';

import { LexicalEditor } from 'lexical';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import Button from '../../ui/Button';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import { INSERT_LAYOUT_COMMAND } from './LayoutPlugin';

const LAYOUTS = [
  {
    label: 'lexical.plugin.layout.columns.two.equal',
    defaultMessage: '2 columns (equal width)',
    value: '1fr 1fr',
  },
  {
    label: 'lexical.plugin.layout.columns.two.split',
    defaultMessage: '2 columns (25% - 75%)',
    value: '1fr 3fr',
  },
  {
    label: 'lexical.plugin.layout.columns.three.equal',
    defaultMessage: '3 columns (equal width)',
    value: '1fr 1fr 1fr',
  },
  {
    label: 'lexical.plugin.layout.columns.three.split',
    defaultMessage: '3 columns (25% - 50% - 25%)',
    value: '1fr 2fr 1fr',
  },
  {
    label: 'lexical.plugin.layout.columns.four.equal',
    defaultMessage: '4 columns (equal width)',
    value: '1fr 1fr 1fr 1fr',
  },
];

export default function InsertLayoutDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const { formatMessage } = useIntl();
  const [layout, setLayout] = useState(LAYOUTS[0].value);
  const selectedLayout = LAYOUTS.find((item) => item.value === layout);
  const buttonLabel = selectedLayout
    ? formatMessage({
        id: selectedLayout.label,
        defaultMessage: selectedLayout.defaultMessage,
      })
    : '';

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, layout);
    onClose();
  };

  return (
    <>
      <DropDown buttonClassName="toolbar-item dialog-dropdown" buttonLabel={buttonLabel}>
        {LAYOUTS.map(({ label, defaultMessage, value }) => (
          <DropDownItem key={value} className="item" onClick={() => setLayout(value)}>
            <span className="text">{formatMessage({ id: label, defaultMessage })}</span>
          </DropDownItem>
        ))}
      </DropDown>
      <Button onClick={onClick}>
        {formatMessage({
          id: 'lexical.plugin.layout.button.insert',
          defaultMessage: 'Insert',
        })}
      </Button>
    </>
  );
}
