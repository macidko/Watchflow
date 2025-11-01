import React from 'react';
import PropTypes from 'prop-types';
import ModalShell from './ModalShell';
import ShowAllModalContent from './ShowAllModalContent';
import { t } from '../../i18n';
import '../../css/components/modals/ShowAllModal.css';

const ShowAllModal = ({ title, items = [], onClose, onCardClick }) => {
  return (
    <ModalShell
      isOpen={true}
      onClose={onClose}
      title={
        <div className="show-all-modal-header-title-group">
          <span className="show-all-modal-header-title">
            {title}
          </span>
          <div className="show-all-modal-header-count">
            {items.length} {t('common.content')}
          </div>
        </div>
      }
      size="full"
    >
      <ShowAllModalContent
        items={items}
        onCardClick={onCardClick}
      />
    </ModalShell>
  );
};

ShowAllModal.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func.isRequired,
  onCardClick: PropTypes.func
};

export default ShowAllModal;