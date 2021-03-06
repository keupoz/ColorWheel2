import ColorWheel from "../../dist/ColorWheel2";

let input = document.querySelector("#tryInput") as HTMLInputElement,
    picker = new ColorWheel("#color-wheel", 256, (eventCode, eventName) => {
        // Do nothing if color is changed by input
        // (because it updates it)
        if (eventCode == 3) return;

        // Do nothing if color is chromatic
        if (eventName == "rotateWheel" && picker.color.HSV[1] == 0) return;

        updateInput();
    });

function updateInput() {
    // Change background and value of input
    input.style.background = input.value = picker.color.getName();
    // Make text color readable
    input.style.color = picker.color.isDark() ? "white" : "";
}

updateInput();

input.addEventListener("input", function () {
    if (this.value == "") {
        this.style.background = "";
        this.style.color = "";
    } else {
        try {
            // Set color
            picker.color.setName(this.value);
            picker.update();

            // Change background and value of input
            this.style.background = picker.color.hex;
            // Make text color readable
            this.style.color = picker.color.isDark() ? "white" : "";
        } catch (e) { }
    }
});
