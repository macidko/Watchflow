import React from 'react';
import PropTypes from 'prop-types';
import ModalShell from './ModalShell';
import DetailModalContent from './DetailModalContent';

/**
 * DetailModal - Modal shell wrapper for detail content
 * Uses ModalShell for backdrop/close/focus management
 */
const DetailModal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <ModalShell onClose={onClose}>
      <DetailModalContent item={item} onClose={onClose} />
    </ModalShell>
  );
};

DetailModal.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    pageId: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired
};

export default DetailModal;