import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import React, { useEffect, useMemo, useState } from 'react';

import CircleProgress from '../../../components/CircleProgress';
import { useCharacterLimit } from '../../hooks/useCharacterLimit';

import { useIntl } from 'react-intl';
import './index.css';

let textEncoderInstance: null | TextEncoder = null;

function textEncoder(): null | TextEncoder {
  if (window.TextEncoder === undefined) {
    return null;
  }

  if (textEncoderInstance === null) {
    textEncoderInstance = new window.TextEncoder();
  }

  return textEncoderInstance;
}

function utf8Length(text: string) {
  const currentTextEncoder = textEncoder();

  if (currentTextEncoder === null) {
    // http://stackoverflow.com/a/5515960/210370
    const m = encodeURIComponent(text).match(/%[89ABab]/g);
    return text.length + (m ? m.length : 0);
  }

  return currentTextEncoder.encode(text).length;
}

interface WordCountPluginProps {
  limit?: number;
  charset: 'UTF-8' | 'UTF-16';
}

const WordCountPlugin: React.FC<WordCountPluginProps> = ({ limit, charset = 'UTF-16' }) => {
  const { formatMessage } = useIntl();
  const [editor] = useLexicalComposerContext();
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [remainingCharacters, setRemainingCharacters] = useState(limit);

  const characterLimitProps = useMemo(
    () => ({
      remainingCharacters: setRemainingCharacters,
      strlen: (text: string) => {
        if (charset === 'UTF-8') {
          return utf8Length(text);
        } else if (charset === 'UTF-16') {
          return text.length;
        } else {
          throw new Error('Unrecognized charset');
        }
      },
    }),
    [charset]
  );

  if (limit !== undefined) {
    useCharacterLimit(editor, limit, characterLimitProps);
  }

  useEffect(() => {
    const updateCounts = () => {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const text = root.getTextContent();

        const words = text.match(/\b\w+\b/g)?.length || 0;
        const chars = text.length;

        setWordCount(words);
        setCharCount(chars);
      });
    };

    updateCounts();

    const removeListener = editor.registerUpdateListener(updateCounts);

    return () => removeListener();
  }, [editor]);

  return (
    <div className="word-count-plugin">
      {limit !== undefined ? (
        <CircleProgress
          percentage={(charCount / limit) * 100}
          count={charCount}
          label={formatMessage({
            id: 'lexical.plugin.word-count.characters.label',
            defaultMessage: 'Characters',
          })}
        />
      ) : (
        <span>
          {formatMessage(
            {
              id: 'lexical.plugin.word-count.characters.count',
              defaultMessage: '{count} characters',
            },
            { count: charCount }
          )}
        </span>
      )}
      <span>
        {formatMessage(
          { id: 'lexical.plugin.word-count.words.count', defaultMessage: '{count} words' },
          { count: wordCount }
        )}
      </span>
    </div>
  );
};

export default WordCountPlugin;
