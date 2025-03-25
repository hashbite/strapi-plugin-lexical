import * as React from 'react';
import { useIntl } from 'react-intl';

import {
  Box,
  Button,
  Field,
  Modal,
  Radio,
  Table,
  Tabs,
  Tbody,
  Td,
  Tr,
  Typography,
} from '@strapi/design-system';

import {
  unstable_useContentManagerContext as useContentManagerContext,
  useFetchClient,
} from '@strapi/strapi/admin';

const highlightText = (text: string, q: string): React.ReactElement => {
  if (!q.trim().length) return <>{text}</>;

  const regex = new RegExp(`(${q})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === q.toLowerCase() ? <strong key={index}>{part}</strong> : part
      )}
    </>
  );
};

const linkRegex =
  /^(https?|ftp|mailto|tel|ws|wss|sms|geo|maps|whatsapp|facetime|facetime-audio|skype|sip|sips):\/\/?/i;

const LinkModal = ({
  fieldName,
  currentValue,
  setValue,
  open,
  setOpen,
}: {
  fieldName: string;
  currentValue: string;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { locale, formatMessage } = useIntl();
  const { get } = useFetchClient();
  const { model } = useContentManagerContext();

  const currentType = React.useMemo(
    () => (currentValue.startsWith('strapi://') ? 'internal' : 'external'),
    [currentValue]
  );
  const defaultTab = React.useMemo(
    () => (currentType === 'external' && currentValue.length ? 'external' : 'internal'),
    [currentValue, currentType]
  );

  const [activeTab, setActiveTab] = React.useState(defaultTab);

  const [searchResults, setSearchResults] = React.useState<
    { documentId: string; id: number; label: string; collectionName: string }[]
  >([]);
  const [q, setQ] = React.useState<string>('');

  // Prepopulate with already selected item
  React.useEffect(() => {
    const loadCurrentSelected = async (currentSelectedItem: string) => {
      try {
        const resultCurrentItem = await get(`/lexical/get/${currentSelectedItem}`);
        if (resultCurrentItem.data) {
          setSearchResults([resultCurrentItem.data]);
          return;
        }
      } catch (err) {
        console.log('Failed to load selected item:');
        console.error(err);
      }
      setSearchResults([]);
    };
    if (currentValue.startsWith('strapi://')) {
      loadCurrentSelected(currentValue.replace('strapi://', ''));
    }
  }, [currentValue]);

  const handleSearch = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const userQuery = e.target.value.trim();
    if (userQuery.length) {
      setQ(userQuery);
      try {
        const resultSearchLinkables = await get(
          `/lexical/search/${model}/${fieldName}?q=${userQuery}&locale=${locale}`
        );
        if (resultSearchLinkables.status && resultSearchLinkables.status !== 200) {
          throw new Error(`Search failed:\n${JSON.stringify(resultSearchLinkables.data, null, 2)}`);
        }
        setSearchResults(resultSearchLinkables.data);
        return;
      } catch (err) {
        console.error(err);
      }
    }
    setSearchResults([]);
  }, []);

  const [internalError, setInternalError] = React.useState('');
  const [externalError, setExternalError] = React.useState('');
  const onSubmitCb = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      const formData = new FormData(e.currentTarget);

      const value = formData.get(activeTab)?.toString();

      if (activeTab === 'internal' && !value) {
        setInternalError('Please select an internal content item to link to.');
        return;
      }

      if (activeTab === 'external') {
        if (!value || !value.trim().length) {
          setExternalError('Please enter a valid URL or URI.');
          return;
        }
        if (!value.match(linkRegex)) {
          setExternalError(
            "Invalid URL or URI. Ensure it starts with 'https://', 'mailto:', or another supported protocol."
          );
          return;
        }
      }

      if (!value) {
        console.error("This shouldn't happen!", { activeTab, value });
        return;
      }
      setInternalError('');
      setExternalError('');
      setValue(value.toString());
    },
    [activeTab, setValue, setInternalError, externalError]
  );

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Content>
        <form onSubmit={onSubmitCb}>
          <Modal.Header>
            <Modal.Title>
              {formatMessage({
                id: 'lexical.components.link-modal.title',
                defaultMessage: 'Link Content',
              })}
            </Modal.Title>
          </Modal.Header>
          <Tabs.Root defaultValue={defaultTab} onValueChange={setActiveTab}>
            <Tabs.List
              aria-label={formatMessage({
                id: 'lexical.components.link-modal.tab-list.aria-label',
                defaultMessage: 'Do you want to link internal or external content?',
              })}
            >
              <Tabs.Trigger value="internal">
                {formatMessage({
                  id: 'lexical.components.link-modal.tabs.title.internal-link',
                  defaultMessage: 'Internal Link',
                })}
              </Tabs.Trigger>
              <Tabs.Trigger value="external">
                {formatMessage({
                  id: 'lexical.components.link-modal.tabs.title.external-link',
                  defaultMessage: 'External Link',
                })}
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="internal">
              <Box padding={4} style={{ minHeight: '60vh', overflowY: 'scroll' }}>
                <Field.Root error={internalError} onChange={handleSearch} required>
                  <Field.Label>
                    {formatMessage({
                      id: 'lexical.components.link-modal.tabs.content.internal.label',
                      defaultMessage: 'Search for content within Strapi to link to',
                    })}
                  </Field.Label>
                  <Field.Input
                    type="search"
                    placeholder={formatMessage({
                      id: 'lexical.components.link-modal.tabs.content.internal.placeholder',
                      defaultMessage: 'Search...',
                    })}
                    size="M"
                  />
                  <Field.Error />
                </Field.Root>
                {searchResults.length > 0 && (
                  <Radio.Group
                    name="internal"
                    defaultValue={currentType === 'internal' ? currentValue : undefined}
                  >
                    <Table colCount={2} rowCount={1} style={{ marginTop: '0.5rem' }}>
                      <Tbody>
                        {searchResults.map((result) => (
                          <Tr key={result.documentId}>
                            <Td>
                              <Radio.Item
                                value={`strapi://${result.collectionName}/${result.documentId}`}
                                id={result.documentId}
                              />
                            </Td>
                            <Td>
                              <label htmlFor={result.documentId}>
                                <Typography>
                                  {highlightText(result.label, q)} ({result.collectionName}:
                                  {result.id})
                                </Typography>
                              </label>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Radio.Group>
                )}
              </Box>
            </Tabs.Content>
            <Tabs.Content value="external">
              <Box padding={4} style={{ minHeight: '60vh', overflowY: 'scroll' }}>
                <Field.Root error={externalError} name="external" required>
                  <Field.Label>
                    {formatMessage({
                      id: 'lexical.components.link-modal.tabs.content.external.label',
                      defaultMessage: 'Enter URI to external content',
                    })}
                  </Field.Label>
                  <Field.Input
                    placeholder={formatMessage({
                      id: 'lexical.components.link-modal.tabs.content.external.placeholder',
                      defaultMessage: 'Enter external URL...',
                    })}
                    size="M"
                    type="url"
                    defaultValue={currentType === 'external' ? currentValue : ''}
                  />
                  <Field.Error />
                </Field.Root>
              </Box>
            </Tabs.Content>
          </Tabs.Root>
          <Modal.Footer>
            <Modal.Close>
              <Button variant="tertiary" onClick={() => setOpen(false)}>
                {formatMessage({
                  id: 'lexical.components.link-modal.button.cancel',
                  defaultMessage: 'Cancel',
                })}
              </Button>
            </Modal.Close>
            <Button type="submit">
              {formatMessage({
                id: 'lexical.components.link-modal.button.set-link',
                defaultMessage: 'Set Link',
              })}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};

export default LinkModal;
