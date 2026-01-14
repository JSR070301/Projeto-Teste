// js/funciones.js

const LS_PELICULA_SELECCIONADA  = "cineplus_pelicula_seleccionada";
const LS_ASIENTOS_OCUPADOS      = "cineplus_asientos_ocupados";
const LS_CARRITO                = "cineplus_carrito";
const LS_FUNCION_SELECCIONADA   = "cineplus_funcion_seleccionada";
const LS_ASIENTOS_SELECCIONADOS = "cineplus_asientos_seleccionados";

const FILAS = ["A", "B", "C", "D", "E", "F"];
const COLUMNAS = 8;

let peliculaSeleccionada = null;
let asientosSeleccionados = [];

function cargarPeliculaSeleccionada() {
    const spanNombre = document.getElementById("nombrePeliculaSeleccionada");
    const data = localStorage.getItem(LS_PELICULA_SELECCIONADA);

    if (!data) {
        spanNombre.textContent = "Ninguna (elige una película en la cartelera)";
        return;
    }

    peliculaSeleccionada = JSON.parse(data);
    spanNombre.textContent = peliculaSeleccionada.titulo;
}

function obtenerAsientosOcupados() {
    const data = localStorage.getItem(LS_ASIENTOS_OCUPADOS);
    return data ? JSON.parse(data) : {};
}

function guardarAsientosOcupados(obj) {
    localStorage.setItem(LS_ASIENTOS_OCUPADOS, JSON.stringify(obj));
}

function getClaveFuncion(movieId, fecha, hora) {
    return `${movieId}|${fecha}|${hora}`;
}

function validarFechaHora(fechaStr, horaStr) {
    if (!fechaStr || !horaStr) return false;
    const ahora = new Date();
    const fechaHoraSeleccionada = new Date(`${fechaStr}T${horaStr}`);
    return fechaHoraSeleccionada >= ahora;
}

function renderMapaAsientos() {
    const fecha = document.getElementById("fechaFuncion").value;
    const hora = document.getElementById("horaFuncion").value;

    if (!peliculaSeleccionada) {
        alert("Primero selecciona una película en la cartelera.");
        return;
    }

    if (!fecha || !hora) {
        alert("Selecciona fecha y hora de la función.");
        return;
    }

    if (!validarFechaHora(fecha, hora)) {
        alert("La fecha y hora no pueden ser pasadas.");
        return;
    }

    const funcion = { movieId: peliculaSeleccionada.id, fecha, hora };
    localStorage.setItem(LS_FUNCION_SELECCIONADA, JSON.stringify(funcion));

    const ocupadosGlobal = obtenerAsientosOcupados();
    const clave = getClaveFuncion(peliculaSeleccionada.id, fecha, hora);
    const asientosOcupados = new Set(ocupadosGlobal[clave] || []);

    const prevSeleccion = localStorage.getItem(LS_ASIENTOS_SELECCIONADOS);
    asientosSeleccionados = prevSeleccion ? JSON.parse(prevSeleccion) : [];

    const contenedor = document.getElementById("contenedorAsientos");
    contenedor.innerHTML = "";

    FILAS.forEach(fila => {
        const filaDiv = document.createElement("div");
        filaDiv.className = "fila-asientos";

        for (let col = 1; col <= COLUMNAS; col++) {
            const asientoId = `${fila}${col}`;
            const btn = document.createElement("button");
            btn.textContent = asientoId;
            btn.classList.add("asiento");

            if (asientosOcupados.has(asientoId)) {
                btn.classList.add("ocupado");
                btn.disabled = true;
            } else if (asientosSeleccionados.includes(asientoId)) {
                btn.classList.add("seleccionado");
            }

            btn.addEventListener("click", () => {
                if (btn.classList.contains("ocupado")) return;

                if (btn.classList.contains("seleccionado")) {
                    btn.classList.remove("seleccionado");
                    asientosSeleccionados = asientosSeleccionados.filter(a => a !== asientoId);
                } else {
                    btn.classList.add("seleccionado");
                    if (!asientosSeleccionados.includes(asientoId)) {
                        asientosSeleccionados.push(asientoId);
                    }
                }

                localStorage.setItem(LS_ASIENTOS_SELECCIONADOS, JSON.stringify(asientosSeleccionados));
            });

            filaDiv.appendChild(btn);
        }

        contenedor.appendChild(filaDiv);
    });
}

function limpiarSeleccionAsientos() {
    asientosSeleccionados = [];
    localStorage.removeItem(LS_ASIENTOS_SELECCIONADOS);
    renderMapaAsientos();
}

function agregarBoletosAlCarrito() {
    if (!peliculaSeleccionada) {
        alert("Primero selecciona una película en la cartelera.");
        return;
    }

    const fecha = document.getElementById("fechaFuncion").value;
    const hora = document.getElementById("horaFuncion").value;

    if (!fecha || !hora) {
        alert("Selecciona fecha y hora de la función.");
        return;
    }

    if (!validarFechaHora(fecha, hora)) {
        alert("La fecha y hora no pueden ser pasadas.");
        return;
    }

    if (!asientosSeleccionados.length) {
        alert("Selecciona al menos un asiento.");
        return;
    }

    const dataCarrito = localStorage.getItem(LS_CARRITO);
    const carrito = dataCarrito ? JSON.parse(dataCarrito) : [];

    const item = {
        movieId: peliculaSeleccionada.id,
        titulo: peliculaSeleccionada.titulo,
        fecha,
        hora,
        asientos: [...asientosSeleccionados],
        precioBoleto: peliculaSeleccionada.precio || 18.5
    };

    carrito.push(item);
    localStorage.setItem(LS_CARRITO, JSON.stringify(carrito));

    alert("Boletos agregados al carrito.");
    window.location.href = "carrito.html";
}

function initFunciones() {
    cargarPeliculaSeleccionada();

    document.getElementById("btnGenerarMapa").addEventListener("click", renderMapaAsientos);
    document.getElementById("btnLimpiarSeleccion").addEventListener("click", limpiarSeleccionAsientos);
    document.getElementById("btnAgregarCarrito").addEventListener("click", agregarBoletosAlCarrito);
}

document.addEventListener("DOMContentLoaded", initFunciones);
