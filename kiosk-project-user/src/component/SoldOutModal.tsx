import Modal from "react-modal";

interface SoldOutModalProps{
    isOpen : boolean;
    onClose : () => void;
    message : string;
}

const SoldOutModal =({isOpen, onClose, message}: SoldOutModalProps)=>{
    return (
        <Modal
          isOpen={isOpen}
          onRequestClose={onClose}
          className="sold-out-modal"
          overlayClassName="sold-out-overlay"
        >
          <div className="sold-out-content">
            <h2>❌ 품절</h2>
            <p>{message}</p>
            <button className="sold-out-btn" onClick={onClose}>
              닫기
            </button>
          </div>
        </Modal>
      );
    };
    
    export default SoldOutModal;