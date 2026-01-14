// js/carrito.js

const LS_CARRITO          = "cineplus_carrito";
const LS_ASIENTOS_OCUPADOS = "cineplus_asientos_ocupados";

let carrito = [];
let descuentoPorcentaje = 0;

function cargarCarrito() {
    const data = localStorage.getItem(LS_CARRITO);
    carrito = data ? JSON.parse(data) : [];
}

function guardarCarrito() {
    localStorage.setItem(LS_CARRITO, JSON.stringify(carrito));
}

function renderCarrito() {
    const tbody = document.getElementById("tbodyCarrito");
    tbody.innerHTML = "";

    if (!carrito.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    No hay boletos en el carrito.
                </td>
            </tr>
        `;
        actualizarTotales();
        return;
    }

    carrito.forEach((item, index) => {
        const tr = document.createElement("tr");
        const cantidad = item.asientos.length;
        const subtotal = item.precioBoleto * cantidad;

        tr.innerHTML = `
            <td>${item.titulo}</td>
            <td>${item.fecha}</td>
            <td>${item.hora}</td>
            <td>${item.asientos.join(", ")}</td>
            <td>S/ ${item.precioBoleto.toFixed(2)}</td>
            <td>${cantidad}</td>
            <td>S/ ${subtotal.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger btn-eliminar-item" data-index="${index}">
                    <i class="bi bi-trash3"></i>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    document.querySelectorAll(".btn-eliminar-item").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.index, 10);
            carrito.splice(idx, 1);
            guardarCarrito();
            renderCarrito();
        });
    });

    actualizarTotales();
}

function actualizarTotales() {
    const totalBruto = carrito.reduce((acc, item) => {
        return acc + item.precioBoleto * item.asientos.length;
    }, 0);

    const montoDescuento = totalBruto * (descuentoPorcentaje / 100);
    const totalPagar = totalBruto - montoDescuento;

    document.getElementById("totalBruto").textContent = totalBruto.toFixed(2);
    document.getElementById("montoDescuento").textContent = montoDescuento.toFixed(2);
    document.getElementById("totalPagar").textContent = totalPagar.toFixed(2);

    const btnConfirmar = document.getElementById("btnConfirmarCompra");
    if (btnConfirmar) btnConfirmar.disabled = carrito.length === 0;
}

function mostrarAlerta(idContenedor, tipo, mensaje) {
    const cont = document.getElementById(idContenedor);
    cont.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>
    `;
}

function aplicarCupon() {
    const input = document.getElementById("cuponDescuento");
    const cupon = input.value.trim().toUpperCase();

    if (!cupon) {
        descuentoPorcentaje = 0;
        actualizarTotales();
        mostrarAlerta("alertasCarrito", "info", "No se aplicó ningún cupón.");
        return;
    }

    if (cupon === "CINEPLUS10") {
        descuentoPorcentaje = 10;
        actualizarTotales();
        mostrarAlerta("alertasCarrito", "success", "Cupón aplicado: 10% de descuento.");
    } else {
        descuentoPorcentaje = 0;
        actualizarTotales();
        mostrarAlerta("alertasCarrito", "danger", "Cupón no válido.");
    }
}

function vaciarCarrito() {
    if (!carrito.length) return;
    if (!confirm("¿Seguro que deseas vaciar el carrito?")) return;

    carrito = [];
    guardarCarrito();
    renderCarrito();
}

function descargarArchivoTexto(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function confirmarCompra() {
    if (!carrito.length) {
        mostrarAlerta("alertasCarrito", "warning", "No hay boletos en el carrito.");
        return;
    }

    const totalBruto = carrito.reduce((acc, item) => acc + item.precioBoleto * item.asientos.length, 0);
    const montoDescuento = totalBruto * (descuentoPorcentaje / 100);
    const totalPagar = totalBruto - montoDescuento;

    const dataOcupados = localStorage.getItem(LS_ASIENTOS_OCUPADOS);
    const ocupados = dataOcupados ? JSON.parse(dataOcupados) : {};

    carrito.forEach(item => {
        const clave = `${item.movieId}|${item.fecha}|${item.hora}`;
        if (!ocupados[clave]) ocupados[clave] = [];
        item.asientos.forEach(a => {
            if (!ocupados[clave].includes(a)) {
                ocupados[clave].push(a);
            }
        });
    });

    localStorage.setItem(LS_ASIENTOS_OCUPADOS, JSON.stringify(ocupados));

    let contenido = "CINEPLUS - COMPROBANTE DE COMPRA DE BOLETOS\n";
    contenido += "------------------------------------------\n\n";

    carrito.forEach((item, idx) => {
        contenido += `Boleto ${idx + 1}\n`;
        contenido += `Película: ${item.titulo}\n`;
        contenido += `Fecha: ${item.fecha}\n`;
        contenido += `Hora: ${item.hora}\n`;
        contenido += `Asientos: ${item.asientos.join(", ")}\n`;
        contenido += `Precio por boleto: S/ ${item.precioBoleto.toFixed(2)}\n`;
        contenido += `Cantidad: ${item.asientos.length}\n`;
        contenido += `Subtotal: S/ ${(item.precioBoleto * item.asientos.length).toFixed(2)}\n`;
        contenido += "------------------------------------------\n\n";
    });

    contenido += `Total antes de descuento: S/ ${totalBruto.toFixed(2)}\n`;
    contenido += `Descuento aplicado: ${descuentoPorcentaje}% (S/ ${montoDescuento.toFixed(2)})\n`;
    contenido += `TOTAL A PAGAR: S/ ${totalPagar.toFixed(2)}\n`;

    descargarArchivoTexto(contenido, "boletos.txt");

    carrito = [];
    guardarCarrito();
    renderCarrito();
    mostrarAlerta("alertasCarrito", "success", "Compra realizada con éxito. Se descargó el archivo de boletos.");
}

function initCarrito() {
    cargarCarrito();
    renderCarrito();

    document.getElementById("btnAplicarCupon").addEventListener("click", aplicarCupon);
    document.getElementById("btnVaciarCarrito").addEventListener("click", vaciarCarrito);
    document.getElementById("btnConfirmarCompra").addEventListener("click", confirmarCompra);
}

document.addEventListener("DOMContentLoaded", initCarrito);
