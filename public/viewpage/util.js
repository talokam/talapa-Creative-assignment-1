import { modalInfobox } from "./element.js";

export function info(title, body, closeModal) {
    if (closeModal) closeModal.hide();
    modalInfobox.title.innerHTML = title;
    modalInfobox.body.innerHTML = body;
    modalInfobox.modal.show();

}
