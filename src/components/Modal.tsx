type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal = ({ title, onClose, children }: ModalProps) => {
  return (
    // オーバーレイ（背景の暗い部分）
    <div style={styles.overlay} onClick={onClose}>
      {/* コンテンツ部分（クリックが背景に伝わらないように止める）*/}
      <div style={styles.content} onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        {/* 中身（各フォームが入る）*/}
        <div style={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "420px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #eee",
  },
  title: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#888",
    lineHeight: 1,
  },
  body: {
    padding: "20px",
  },
};

export default Modal;