
const injectWhatsApp = ()=>{
    const header = document.querySelector(".header-announcement-bar-wrapper");
    const whatsAppElm = `<a target="_blank" href="https://wa.me/6580306454?text=Hello,%20can%20you%20tell%20me%20more%20about%20SgFitFam?%20;)" class="wabutton">
    <img src="https://www.freepnglogos.com/uploads/whatsapp-logo-app-png-4.png" width="50px" height="50px">
    </a>
    <style>
    .wabutton {
    position: fixed;
    display: inline;
    right: 10px;
    bottom: 10px;
    transform: translatey(200%);
    transition: transform 200ms;
    animation: load-fadein 300ms ease-in-out 1000ms;
    animation-fill-mode: forwards;
    z-index: 10;
    filter: drop-shadow(4px 4px 3px rgba(60,60,60,.2));
    }
    </style>`;
    header.insertAdjacentHTML('beforeend', whatsAppElm)
}
injectWhatsApp()