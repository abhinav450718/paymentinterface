document.addEventListener("DOMContentLoaded", function () {
    const qrDropZone = document.getElementById("qr-drop-zone");
    const qrImageInput = document.getElementById("qr-image");
    const upiIdElement = document.getElementById("upi-id");
    const upiNameElement = document.getElementById("upi-name");
    const currencyElement = document.getElementById("currency");
    const amountElement = document.getElementById("amount");
    const copyButtons = document.querySelectorAll(".copy-btn");

    const recipientNameElement = document.getElementById("payment-upi-name");
    const recipientIdElement = document.getElementById("payment-upi-id");
    const paymentAmountElement = document.getElementById("payment-amount");
    const recipientIconElement = document.getElementById("recipient-icon");

    const newUpiNameInput = document.getElementById("new-upi-name");

    copyButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-copy-target");
            const targetElement = document.getElementById(targetId);
            copyToClipboard(targetElement.textContent);
        });
    });

    function copyToClipboard(text) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }

    qrDropZone.addEventListener("paste", (event) => {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
                const imageData = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = () => {
                    const imageDataUrl = reader.result;
                    qrImageInput.src = imageDataUrl;
                    qrImageInput.style.display = 'block';
                    scanQrCode(imageDataUrl);
                };
                reader.readAsDataURL(imageData);
            }
        }
    });

    qrDropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    qrDropZone.addEventListener("drop", (event) => {
        event.preventDefault();
        const imageData = event.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const imageDataUrl = reader.result;
            qrImageInput.src = imageDataUrl;
            qrImageInput.style.display = 'block';
            scanQrCode(imageDataUrl);
        };
        reader.readAsDataURL(imageData);
    });

    function scanQrCode(imageDataUrl) {
        const img = document.createElement("img");
        img.src = imageDataUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, img.width, img.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);
            
            if (code) {
                const url = code.data;
                const urlObj = new URL(url);
                const urlParams = urlObj.searchParams;

                const upiId = urlParams.get('pa') || 'N/A';
                const upiName = urlParams.get('pn') || 'N/A';
                const currency = urlParams.get('cu') || 'N/A';
                const amount = urlParams.get('am') || 'N/A';

                upiIdElement.textContent = upiId;
                upiNameElement.textContent = upiName;
                currencyElement.textContent = currency;
                amountElement.textContent = amount;

                // Update payment UI
                recipientNameElement.textContent = upiName;
                recipientIdElement.textContent = upiId;
                paymentAmountElement.textContent = amount;

                // Update icon based on UPI name initials
                const initials = upiName.split(' ').map(word => word[0]).join('');
                recipientIconElement.textContent = initials;
            } else {
                console.error("QR code scan error");
            }
        };
    }

    document.querySelector(".update-button").addEventListener("click", () => {
        const newUpiName = newUpiNameInput.value.trim();
        if (newUpiName) {
            upiNameElement.textContent = newUpiName;
            recipientNameElement.textContent = newUpiName;

            // Update icon based on new UPI name initials
            const initials = newUpiName.split(' ').map(word => word[0]).join('');
            recipientIconElement.textContent = initials;
        }
    });
});
