import { ToolbarItemProps } from '../../../../supportedNodeTypes';
import { useIntl } from 'react-intl';
import { useToolbarItemRenderDependencies } from '../../../context/ToolbarItemRenderDependenciesContext';

export function StrapiImage(_props: ToolbarItemProps) {
  const { formatMessage } = useIntl();
  const { setIsStrapiImageDialogOpen } = useToolbarItemRenderDependencies();

  return (
    <button
      onClick={() => setIsStrapiImageDialogOpen(true)}
      title={formatMessage({
        id: 'lexical.plugin.toolbar.insert.strapiimage.title',
        defaultMessage: 'Strapi Image',
      })}
      type="button"
      className="toolbar-item"
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.insert.strapiimage.aria',
        defaultMessage: 'Insert Strapi Image',
      })}
    >
      <i className="format image" />
    </button>
  );
}
