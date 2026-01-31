import { ToastService } from './toast.service';

describe('ToastService', () => {
  it('adds and dismisses a toast', () => {
    const service = new ToastService();
    const id = service.show('Gespeichert', 'success', 0);

    expect(service.toasts().length).toBe(1);

    service.dismiss(id);

    expect(service.toasts().length).toBe(0);
  });

  it('clears all toasts', () => {
    const service = new ToastService();
    service.success('Erfolg', 0);
    service.error('Fehler', 0);

    expect(service.toasts().length).toBe(2);

    service.clear();

    expect(service.toasts().length).toBe(0);
  });
});
