import React, { Fragment, ReactNode } from "react";
import { toast, ToastOptions } from "react-toastify";

interface BaseToastProps {
  title?: string;
  message: string;
  details?: string;
}

interface ErrorToastProps extends BaseToastProps {
  actions?: ReactNode;
}

interface MessageOnlyProps {
  message: string;
}

export const PrimaryToast: React.FC = () => (
  <div>
    <div className="toastify-body">
      <span role="img" aria-label="toast-text">
        👋 Jelly-o macaroon brownie tart ice cream croissant jelly-o apple pie.
      </span>
    </div>
  </div>
);

export const SuccessToast: React.FC<BaseToastProps> = ({ message }) => (
  <Fragment>
    <div className="toastify-body">
      <span role="img" aria-label="toast-text">
        {message}
      </span>
    </div>
  </Fragment>
);

export const ErrorToast: React.FC<ErrorToastProps> = ({
  message,
  details,
  actions,
}) => (
  <Fragment>
    <div className="toastify-body">
      <span role="img" aria-label="toast-text">
        {message}
      </span>
      {details && <div className="text-muted">{details}</div>}
      {actions && <>{actions}</>}
    </div>
  </Fragment>
);

export const WarningToast: React.FC<MessageOnlyProps> = ({ message }) => (
  <Fragment>
    <div className="toastify-body">
      <span role="img" aria-label="toast-text">
        {message}
      </span>
    </div>
  </Fragment>
);

export const InfoToast: React.FC<BaseToastProps> = ({ message, details }) => (
  <Fragment>
    <div className="toastify-body">
      <span role="img" aria-label="toast-text">
        {message}
      </span>
      {details && <div className="text-muted">{details}</div>}
    </div>
  </Fragment>
);

/* ------------------------------------------------------------------ */
/* Toast Helpers */
/* ------------------------------------------------------------------ */

const defaultToastOptions: ToastOptions = {
  position: "bottom-center",
  hideProgressBar: true,
};

export const notifyDefault = (): void => {
  toast(<PrimaryToast />, defaultToastOptions);
};

export const notifySuccess = ({ title, message }: BaseToastProps): void => {
  toast.success(
    <SuccessToast title={title} message={message} />,
    defaultToastOptions
  );
};

export const notifyError = ({
  title,
  message,
  details,
  time,
  actions,
}: ErrorToastProps & { time?: number | false }): void => {
  toast.error(
    <ErrorToast
      title={title}
      message={message}
      details={details}
      actions={actions}
    />,
    {
      ...defaultToastOptions,
      ...(time !== undefined ? { autoClose: time } : {}),
    }
  );
};

export const notifyWarning = ({ message }: MessageOnlyProps): void => {
  toast.warning(<WarningToast message={message} />, defaultToastOptions);
};

export const notifyInfo = ({ message, details }: BaseToastProps): void => {
  toast.info(
    <InfoToast message={message} details={details} />,
    defaultToastOptions
  );
};
