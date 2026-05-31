import { Modal } from './modal';

export function confirmModal(message: string, onConfirm: () => void, options?: { confirmLabel?: string; danger?: boolean }): void {
  const modal = new Modal({
    title: 'Are you sure?',
    content: `<p style="margin:0;line-height:1.6">${message}</p>`,
    actions: [
      {
        label: 'Cancel',
        variant: 'ghost',
        onClick: () => modal.close(),
      },
      {
        label: options?.confirmLabel ?? 'Confirm',
        variant: options?.danger ? 'secondary' : 'primary',
        onClick: () => {
          modal.close();
          onConfirm();
        },
      },
    ],
  });
  modal.open();
}
