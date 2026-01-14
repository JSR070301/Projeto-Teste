// js/main.js

// Claves de localStorage (deben coincidir con funciones.js y carrito.js)
const LS_PELICULA_SELECCIONADA  = "cineplus_pelicula_seleccionada";
const LS_ASIENTOS_OCUPADOS      = "cineplus_asientos_ocupados";
const LS_CARRITO                = "cineplus_carrito";
const LS_FUNCION_SELECCIONADA   = "cineplus_funcion_seleccionada";
const LS_ASIENTOS_SELECCIONADOS = "cineplus_asientos_seleccionados";

// Cartelera: 8 películas indicadas (CORREGIDO: TRAILER EMBED)
const PELICULAS = [
    {
        id: 1,
        titulo: "Wicked: Por Siempre",
        genero: "Musical",
        duracion: "145 min",
        poster: "img/posters/poster1.jpg",
        sinopsis: "La historia jamás contada de las brujas de Oz, donde la amistad y el destino se entrelazan en un mundo de magia.",
        trailer: "https://www.youtube.com/embed/R2Xubj7lazE",
        precio: 21.5
    },
    {
        id: 2,
        titulo: "Los Ilusionistas 3",
        genero: "Acción",
        duracion: "125 min",
        poster: "img/posters/poster2.jpg",
        sinopsis: "El grupo de magos regresa con el atraco más arriesgado de sus carreras, desafiando a la ley y a sus propios límites.",
        trailer: "https://www.youtube.com/embed/-E3lMRx7HRQ",
        precio: 20.0
    },
    {
        id: 3,
        titulo: "Jujutsu Kaisen: Ejecución",
        genero: "Animación",
        duracion: "110 min",
        poster: "img/posters/poster3.jpg",
        sinopsis: "Itadori y los hechiceros jujutsu enfrentan una misión que podría cambiar para siempre el equilibrio del mundo maldito.",
        trailer: "https://www.youtube.com/embed/OknvvwMcXa4",
        precio: 19.0
    },
    {
        id: 4,
        titulo: "El Sobreviviente",
        genero: "Drama",
        duracion: "118 min",
        poster: "img/posters/poster4.jpg",
        sinopsis: "Tras un accidente brutal, un hombre lucha por mantenerse con vida en un entorno hostil mientras enfrenta su pasado.",
        trailer: "https://www.youtube.com/embed/1rAF0zFMeIU",
        precio: 18.5
    },
    {
        id: 5,
        titulo: "Depredador: Tierras Salvajes",
        genero: "Ciencia Ficción",
        duracion: "112 min",
        poster: "img/posters/poster5.jpg",
        sinopsis: "Un comando ingresa a una jungla remota sin saber que una criatura letal los está cazando uno a uno.",
        trailer: "https://www.youtube.com/embed/43R9l7EkJwE",
        precio: 19.9
    },
    {
        id: 6,
        titulo: "Teléfono Negro 2",
        genero: "Terror",
        duracion: "102 min",
        poster: "img/posters/poster6.jpg",
        sinopsis: "Una nueva serie de desapariciones revela que el terror del pasado nunca se fue, y el teléfono vuelve a sonar.",
        trailer: "https://www.youtube.com/embed/vbjRY7KeZe0",
        precio: 18.0
    },
    {
        id: 7,
        titulo: "Terror En Shelby Oaks",
        genero: "Terror",
        duracion: "108 min",
        poster: "img/posters/poster7.jpg",
        sinopsis: "Una investigadora regresa a su pueblo natal para descubrir la verdad detrás de desapariciones ligadas a una vieja leyenda.",
        trailer: "https://www.youtube.com/embed/mptNOKkCBXU",
        precio: 18.0
    },
    {
        id: 8,
        titulo: "Zootopia 2",
        genero: "Animación",
        duracion: "100 min",
        poster: "img/posters/poster8.jpg",
        sinopsis: "Judy Hopps y Nick Wilde investigan un caso que pondrá en riesgo la confianza entre las especies de Zootopia.",
        trailer: "https://www.youtube.com/embed/5AwtptT8X8k",
        precio: 17.5
    }
];

/* ---------- CARTELERA (index.html) ---------- */

function renderCartelera(lista) {
    const contenedor = document.getElementById("contenedorCartelera");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!lista.length) {
        contenedor.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">
                    No se encontraron películas con ese filtro.
                </div>
            </div>
        `;
        return;
    }

    lista.forEach(p => {
        const col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-lg-3";

        col.innerHTML = `
            <div class="card card-pelicula h-100 bg-dark text-light">
                <img src="${p.poster}" class="card-img-top" alt="${p.titulo}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${p.titulo}</h5>
                    <p><strong>Género:</strong> ${p.genero}</p>
                    <p><strong>Duración:</strong> ${p.duracion}</p>
                    <p><strong>Precio:</strong> S/ ${p.precio.toFixed(2)}</p>
                    <div class="mt-auto d-grid gap-2">
                        <button class="btn btn-outline-info btn-detalles"
                                data-id="${p.id}"
                                data-bs-toggle="modal"
                                data-bs-target="#modalPelicula">
                            Ver detalles
                        </button>
                        <button class="btn btn-primary btn-elegir" data-id="${p.id}">
                            Elegir función
                        </button>
                    </div>
                </div>
            </div>
        `;
        contenedor.appendChild(col);
    });

    agregarEventosBotones();
}

function llenarSelectGeneros() {
    const select = document.getElementById("filtroGenero");
    if (!select) return;

    const generos = Array.from(new Set(PELICULAS.map(p => p.genero))).sort();
    generos.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        select.appendChild(opt);
    });
}

function aplicarFiltros() {
    const genero = document.getElementById("filtroGenero").value;
    const termino = document.getElementById("busquedaTitulo").value.trim().toLowerCase();

    let filtradas = [...PELICULAS];

    if (genero !== "todos") {
        filtradas = filtradas.filter(p => p.genero === genero);
    }

    if (termino) {
        filtradas = filtradas.filter(p =>
            p.titulo.toLowerCase().includes(termino)
        );
    }

    renderCartelera(filtradas);
}

function agregarEventosBotones() {
    const btnDetalles = document.querySelectorAll(".btn-detalles");
    const btnElegir = document.querySelectorAll(".btn-elegir");

    btnDetalles.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id, 10);
            const peli = PELICULAS.find(p => p.id === id);

            document.getElementById("modalTitulo").textContent = peli.titulo;
            document.getElementById("modalGenero").textContent = peli.genero;
            document.getElementById("modalDuracion").textContent = peli.duracion;
            document.getElementById("modalSinopsis").textContent = peli.sinopsis;
            document.getElementById("modalPoster").src = peli.poster;
            document.getElementById("modalTrailer").src = peli.trailer;

            document.getElementById("btnElegirFuncionModal").dataset.id = peli.id;
        });
    });

    btnElegir.forEach(btn => {
        btn.addEventListener("click", () => {
            seleccionarPeliculaYRedirigir(parseInt(btn.dataset.id, 10));
        });
    });
}

function seleccionarPeliculaYRedirigir(id) {
    const peli = PELICULAS.find(p => p.id === id);
    localStorage.setItem(LS_PELICULA_SELECCIONADA, JSON.stringify(peli));
    window.location.href = "funciones.html";
}

function initCartelera() {
    if (!document.getElementById("contenedorCartelera")) return;

    llenarSelectGeneros();
    renderCartelera(PELICULAS);

    document.getElementById("filtroGenero").addEventListener("change", aplicarFiltros);
    document.getElementById("busquedaTitulo").addEventListener("input", aplicarFiltros);

    document.getElementById("btnLimpiarFiltros").addEventListener("click", () => {
        document.getElementById("filtroGenero").value = "todos";
        document.getElementById("busquedaTitulo").value = "";
        aplicarFiltros();
    });

    document.getElementById("btnElegirFuncionModal").addEventListener("click", (e) => {
        seleccionarPeliculaYRedirigir(parseInt(e.currentTarget.dataset.id, 10));
    });

    const modal = document.getElementById("modalPelicula");
    if (modal) {
        modal.addEventListener("hidden.bs.modal", () => {
            document.getElementById("modalTrailer").src = "";
        });
    }
}

/* ---------- CONTACTO ---------- */

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function initContacto() {
    const form = document.getElementById("formContacto");
    const alerta = document.getElementById("alertaContacto");
    if (!form || !alerta) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombreContacto").value.trim();
        const email = document.getElementById("emailContacto").value.trim();
        const mensaje = document.getElementById("mensajeContacto").value.trim();

        if (!nombre || !email || !mensaje) {
            alerta.innerHTML = `
                <div class="alert alert-danger">Todos los campos son obligatorios.</div>
            `;
            return;
        }

        if (!validarEmail(email)) {
            alerta.innerHTML = `
                <div class="alert alert-danger">Ingresa un email válido.</div>
            `;
            return;
        }

        alerta.innerHTML = `
            <div class="alert alert-success">¡Mensaje enviado!</div>
        `;
        form.reset();
    });
}

/* ---------- INICIALIZACIÓN GENERAL ---------- */

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("contenedorCartelera")) initCartelera();
    if (document.getElementById("formContacto")) initContacto();
});
