/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from 'react';
import { useIntl } from 'react-intl';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Button from '../ui/Button';
import KatexRenderer from './KatexRenderer';

import './KatexEquationAlterer.css';

type Props = {
  initialEquation?: string;
  onConfirm: (equation: string, inline: boolean) => void;
};

export default function KatexEquationAlterer({
  onConfirm,
  initialEquation = '',
}: Props): JSX.Element {
  const { formatMessage } = useIntl();
  const [editor] = useLexicalComposerContext();
  const [equation, setEquation] = useState<string>(initialEquation);
  const [inline, setInline] = useState<boolean>(true);

  const onClick = useCallback(() => {
    onConfirm(equation, inline);
  }, [onConfirm, equation, inline]);

  const onCheckboxChange = useCallback(() => {
    setInline(!inline);
  }, [setInline, inline]);

  return (
    <>
      <div className="KatexEquationAlterer_defaultRow">
        {formatMessage({
          id: 'lexical.ui.katex.inline.label',
          defaultMessage: 'Inline',
        })}
        <input type="checkbox" checked={inline} onChange={onCheckboxChange} />
      </div>
      <div className="KatexEquationAlterer_defaultRow">
        {formatMessage({
          id: 'lexical.ui.katex.equation.label',
          defaultMessage: 'Equation',
        })}
      </div>
      <div className="KatexEquationAlterer_centerRow">
        {inline ? (
          <input
            onChange={(event) => {
              setEquation(event.target.value);
            }}
            value={equation}
            className="KatexEquationAlterer_textArea"
            aria-label={formatMessage({
              id: 'lexical.ui.katex.equation.input.aria',
              defaultMessage: 'Enter inline equation',
            })}
          />
        ) : (
          <textarea
            onChange={(event) => {
              setEquation(event.target.value);
            }}
            value={equation}
            className="KatexEquationAlterer_textArea"
            aria-label={formatMessage({
              id: 'lexical.ui.katex.equation.textarea.aria',
              defaultMessage: 'Enter block equation',
            })}
          />
        )}
      </div>
      <div className="KatexEquationAlterer_defaultRow">
        {formatMessage({
          id: 'lexical.ui.katex.visualization.label',
          defaultMessage: 'Visualization',
        })}
      </div>
      <div className="KatexEquationAlterer_centerRow">
        <ErrorBoundary onError={(e) => editor._onError(e)} fallback={null}>
          <KatexRenderer equation={equation} inline={false} onDoubleClick={() => null} />
        </ErrorBoundary>
      </div>
      <div className="KatexEquationAlterer_dialogActions">
        <Button onClick={onClick}>
          {formatMessage({
            id: 'lexical.ui.katex.confirm.button',
            defaultMessage: 'Confirm',
          })}
        </Button>
      </div>
    </>
  );
}
