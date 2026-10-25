export function confirmar(): Promise<boolean> {
  const dialogo = document.getElementById("confirmar") as HTMLDialogElement | null;
  if (!dialogo) return Promise.resolve(window.confirm("¿Estás seguro de realizar esta acción?"));

  const si = dialogo.querySelector<HTMLButtonElement>("[data-si]")!;
  const no = dialogo.querySelector<HTMLButtonElement>("[data-no]")!;

  return new Promise((resolve) => {
    function cerrar(valor: boolean) {
      si.removeEventListener("click", aceptar);
      no.removeEventListener("click", cancelar);
      dialogo!.removeEventListener("cancel", cancelar);
      dialogo!.removeEventListener("click", fuera);
      dialogo!.close();
      resolve(valor);
    }
    function aceptar() { cerrar(true); }
    function cancelar(e: Event) { e.preventDefault(); cerrar(false); }
    function fuera(e: MouseEvent) { if (e.target === dialogo) cerrar(false); }

    si.addEventListener("click", aceptar);
    no.addEventListener("click", cancelar);
    dialogo!.addEventListener("cancel", cancelar);
    dialogo!.addEventListener("click", fuera);
    dialogo!.showModal();
    no.focus();
  });
}
