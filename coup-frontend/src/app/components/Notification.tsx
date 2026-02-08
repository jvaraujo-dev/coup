'use client';

const Notification = ({
                          message,
                          isError,
                          onClose
                      }: {
    message: string;
    isError: boolean;
    onClose: () => void
}) => {
    if (!message) return null;

    return (
        <div className="notification-container">
            <div className={`notification-toast ${isError ? 'notification-error' : 'notification-success'}`}>
                <span>{message}</span>
                <button onClick={onClose} className="notification-close-btn">
                    &times;
                </button>
            </div>
        </div>
    );
};

export default Notification