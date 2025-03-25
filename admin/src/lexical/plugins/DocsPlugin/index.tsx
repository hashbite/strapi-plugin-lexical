/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from 'react';
import { useIntl } from 'react-intl';

export default function DocsPlugin(): JSX.Element {
  const { formatMessage } = useIntl();

  return (
    <a target="__blank" href="https://lexical.dev/docs/intro">
      <button
        id="docs-button"
        className="editor-dev-button"
        title={formatMessage({
          id: 'lexical.plugin.docs.button.title',
          defaultMessage: 'Lexical Docs',
        })}
      />
    </a>
  );
}
