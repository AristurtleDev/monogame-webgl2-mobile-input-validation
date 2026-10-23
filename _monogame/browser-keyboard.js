// MonoGame - Copyright (C) MonoGame Foundation, Inc
// This file is subject to the terms and conditions defined in
// file 'LICENSE.txt', which is part of this source code package.

import { keyboardInputStrings } from "./browser-input-resources.js";

/** Presents the existing KeyboardInput dialog using browser editing controls. */
export class BrowserKeyboard {
    /** @param {object} host Browser host coordinator. */
    constructor(host) {
        this.host = host;
        this.dialog = null;
        this.previousFocus = null;
    }

    /**
     * Presents one single-line text entry dialog. Mobile users may need to tap
     * the field to activate their software keyboard.
     * @param {string} title Dialog title.
     * @param {string} description Field description.
     * @param {string} defaultText Initial text.
     * @param {boolean} password Whether the field masks its value.
     */
    show(title, description, defaultText, password) {
        this.cancel();
        this.previousFocus = document.activeElement;
        const dialog = document.createElement("dialog");
        this.dialog = dialog;
        dialog.style.cssText = "box-sizing:border-box;width:min(28rem,calc(100% - 2rem));max-height:calc(100% - 2rem);overflow:auto;padding:1.5rem;border:0;border-radius:0.5rem;color:CanvasText;background:Canvas;font:1rem system-ui,sans-serif;";
        const heading = document.createElement("h2");
        heading.id = "monogame-keyboard-title";
        heading.textContent = title;
        heading.style.cssText = "margin:0 0 1rem;font-size:1.25rem;overflow-wrap:anywhere;";
        dialog.setAttribute("aria-labelledby", heading.id);
        const details = document.createElement("p");
        details.id = "monogame-keyboard-description";
        details.textContent = description;
        details.style.cssText = "overflow-wrap:anywhere;";
        dialog.setAttribute("aria-describedby", details.id);
        const form = document.createElement("form");
        form.method = "dialog";
        const input = document.createElement("input");
        input.type = password ? "password" : "text";
        input.value = defaultText;
        input.autocomplete = "off";
        input.spellcheck = false;
        input.setAttribute("autocorrect", "off");
        input.setAttribute("autocapitalize", password ? "none" : "sentences");
        input.setAttribute("aria-labelledby", heading.id);
        input.setAttribute("aria-describedby", details.id);
        input.style.cssText = "box-sizing:border-box;width:100%;padding:0.65rem;font:inherit;";
        const buttons = document.createElement("div");
        buttons.style.cssText = "display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1rem;";
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.textContent = keyboardInputStrings.cancel;
        cancel.style.cssText = "padding:0.65rem 1rem;font:inherit;";
        const confirm = document.createElement("button");
        confirm.type = "submit";
        confirm.textContent = keyboardInputStrings.confirm;
        confirm.style.cssText = cancel.style.cssText;
        buttons.append(cancel, confirm);
        form.append(input, buttons);
        dialog.append(heading, details, form);
        let composing = false;
        input.addEventListener("compositionstart", () => { composing = true; });
        input.addEventListener("compositionend", () => { composing = false; });

        const finish = (result) => {
            if (this.dialog !== dialog) {
                return;
            }
            this.cancel();
            this.host.native?.completeKeyboardInput(result ?? "", result == null ? 1 : 0);
        };
        cancel.addEventListener("click", () => finish(null));
        dialog.addEventListener("cancel", (event) => {
            event.preventDefault();
            finish(null);
        });
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            if (composing) {
                return;
            }
            finish(input.value);
        });
        // SDL listens on window; text entered in the dialog must stay out of game input.
        for (const eventName of ["keydown", "keyup", "keypress"]) {
            dialog.addEventListener(eventName, (event) => {
                event.stopPropagation();
                if (event.type === "keydown" && event.key === "Enter" && event.isComposing) {
                    event.preventDefault();
                }
            });
        }

        try {
            this.host.root.append(dialog);
            dialog.showModal();
            input.focus();
            input.setSelectionRange(defaultText.length, defaultText.length);
        }
        catch (error) {
            this.cancel();
            throw error;
        }
    }

    /** Removes the dialog without generating another native completion. */
    cancel() {
        const dialog = this.dialog;
        if (dialog == null) {
            return;
        }
        this.dialog = null;
        dialog.close();
        dialog.remove();
        const previousFocus = this.previousFocus;
        this.previousFocus = null;
        if (previousFocus?.isConnected && !this.host.isDisposed) {
            previousFocus.focus({ preventScroll: true });
        }
    }

    /** Cancels a pending request when its browser host is released. */
    dispose() {
        if (this.dialog != null) {
            this.cancel();
            this.host.native?.completeKeyboardInput("", 1);
        }
    }
}
