// Variables globales
let productos = []; // Limpiar productos del frontend
localStorage.setItem('productos', JSON.stringify(productos));
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
let calificaciones = JSON.parse(localStorage.getItem('calificaciones')) || [];
let usuarios = []; // Limpiar usuarios del frontend
let sesiones = []; // Limpiar sesiones del frontend
localStorage.setItem('usuarios', JSON.stringify(usuarios));
localStorage.setItem('sesiones', JSON.stringify(sesiones));

// Verificar si el usuario está logueado y es comprador
if (!usuarioActual || usuarioActual.modoSeleccionado !== 'comprador') {
    alert('Debes iniciar sesión como comprador para acceder a esta página.');
    window.location.href = 'index.html';
}

// Elementos del DOM
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const cambiarModoBtn = document.getElementById('cambiar-modo-btn');
const carritoIcon = document.getElementById('carrito-icon');
const carritoCount = document.getElementById('carrito-count');
const carritoModal = document.getElementById('carrito-modal');
const carritoItems = document.getElementById('carrito-items');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutDiv = document.getElementById('checkout');
const checkoutTotal = document.getElementById('checkout-total');
const checkoutForm = document.getElementById('checkout-form');
const ratingModal = document.getElementById('rating-modal');
const closeRating = document.getElementById('close-rating');
const submitRating = document.getElementById('submit-rating');
const stars = document.querySelectorAll('.star');
const clock = document.getElementById('clock');
const ratingsDisplay = document.getElementById('ratings-display');
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const closeEditProfile = document.getElementById('close-edit-profile');
const editProfileForm = document.getElementById('edit-profile-form');

// Funciones de utilidad
function mostrarModal(modal) {
    modal.style.display = 'block';
}

function ocultarModal(modal) {
    modal.style.display = 'none';
}

function actualizarCarrito() {
    carritoCount.textContent = carrito.length;
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function mostrarProductos() {
    const container = document.getElementById('productos-container');
    container.innerHTML = '';
    const productosAMostrar = productos.filter(p => p.vendedorId !== null); // Solo productos subidos por vendedores
    productosAMostrar.forEach(producto => {
        const vendedor = usuarios.find(u => u.id === producto.vendedorId);
        const nombreVendedor = vendedor ? vendedor.nombre : 'Desconocido';
        const div = document.createElement('div');
        div.className = 'producto';
        div.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" style="width:200px; height:150px;">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <p>Precio: ${parseFloat(producto.precio).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} PESOS COP</p>
            <p>Stock: ${producto.stock}</p>
            <p>Vendedor: ${nombreVendedor}</p>
            <button onclick="agregarAlCarrito(${producto.id})">Agregar al Carrito</button>
        `;
        container.appendChild(div);
    });
}

function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (producto && producto.stock > 0) {
        carrito.push(producto);
        producto.stock--;
        actualizarCarrito();
        mostrarProductos();
        localStorage.setItem('productos', JSON.stringify(productos));
    }
}

function mostrarCarrito() {
    carritoItems.innerHTML = '';
    let subtotal = 0;
    let costoEnvioTotal = 0;
    carrito.forEach((item, index) => {
        subtotal += parseFloat(item.precio);
        costoEnvioTotal += (parseFloat(item.costo_envio) || 0);
        const div = document.createElement('div');
        div.innerHTML = `
            <p>${item.nombre} - ${parseFloat(item.precio).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} PESOS COP</p>
            <button onclick="removerDelCarrito(${index})">Remover</button>
        `;
        carritoItems.appendChild(div);
    });
    const total = subtotal + costoEnvioTotal;
    checkoutTotal.textContent = `Subtotal: ${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} PESOS COP\nEnvío: ${costoEnvioTotal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} PESOS COP\nTotal: ${total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} PESOS COP`;
}

function removerDelCarrito(index) {
    const item = carrito.splice(index, 1)[0];
    // Devolver stock
    const producto = productos.find(p => p.id === item.id);
    if (producto) {
        producto.stock++;
        localStorage.setItem('productos', JSON.stringify(productos));
    }
    actualizarCarrito();
    mostrarCarrito();
    mostrarProductos();
}

function logout() {
    if (usuarioActual) {
        // Registrar sesión de logout
        sesiones.push({
            id: Date.now(),
            usuarioId: usuarioActual.id,
            action: 'logout',
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('sesiones', JSON.stringify(sesiones));
    }
    usuarioActual = null;
    localStorage.removeItem('usuarioActual');
    window.location.href = 'index.html';
}

function cambiarModo() {
    usuarioActual.modoSeleccionado = 'vendedor';
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    window.location.href = 'dashboard-vendedor.html';
}

// Funciones del carrito
editProfileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const telefono = document.getElementById('edit-phone').value;

    // Verificar si el email ya existe en otro usuario
    if (usuarios.find(u => u.email === email && u.id !== usuarioActual.id)) {
        alert('El email ya está registrado por otro usuario.');
        return;
    }

    usuarioActual.nombre = nombre;
    usuarioActual.email = email;
    usuarioActual.telefono = telefono;

    // Actualizar en usuarios
    const index = usuarios.findIndex(u => u.id === usuarioActual.id);
    if (index !== -1) {
        usuarios[index] = usuarioActual;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    }

    alert('Perfil actualizado exitosamente.');
    ocultarModal(editProfileModal);
    // Actualizar nombre en UI
    userName.innerHTML = `Bienvenido, ${usuarioActual.nombre} (ID: ${usuarioActual.id})`;
});

checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Calcular total incluyendo envío
    let subtotal = 0;
    let costoEnvioTotal = 0;
    carrito.forEach(item => {
        subtotal += parseFloat(item.precio);
        costoEnvioTotal += (parseFloat(item.costo_envio) || 0);
    });
    const total = subtotal + costoEnvioTotal;
    document.getElementById('pago-total').textContent = `Total a pagar: ${total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} PESOS COP`;
    mostrarModal(document.getElementById('pago-modal'));
});

// Reloj
function actualizarReloj() {
    const ahora = new Date();
    clock.textContent = ahora.toLocaleTimeString();
}
setInterval(actualizarReloj, 1000);

// Calificaciones
function mostrarCalificaciones() {
    const promedio = calificaciones.length > 0 ? (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length).toFixed(1) : 0;
    ratingsDisplay.textContent = `Calificación promedio: ${promedio} ★ (${calificaciones.length} votos)`;
}

submitRating.addEventListener('click', function() {
    const rating = document.querySelector('.star.active');
    if (rating) {
        calificaciones.push(parseInt(rating.dataset.value));
        localStorage.setItem('calificaciones', JSON.stringify(calificaciones));
        mostrarCalificaciones();
        ocultarModal(ratingModal);
    }
});

stars.forEach(star => {
    star.addEventListener('click', function() {
        stars.forEach(s => s.classList.remove('active'));
        this.classList.add('active');
        let value = parseInt(this.dataset.value);
        for (let i = 0; i < value; i++) {
            stars[i].classList.add('active');
        }
    });
});

// Event listeners
logoutBtn.addEventListener('click', logout);
cambiarModoBtn.addEventListener('click', cambiarModo);
editProfileBtn.addEventListener('click', () => {
    document.getElementById('edit-name').value = usuarioActual.nombre;
    document.getElementById('edit-email').value = usuarioActual.email;
    document.getElementById('edit-phone').value = usuarioActual.telefono || '';
    mostrarModal(editProfileModal);
});
carritoIcon.addEventListener('click', () => {
    mostrarCarrito();
    mostrarModal(carritoModal);
});
checkoutBtn.addEventListener('click', () => checkoutDiv.style.display = 'block');

document.querySelectorAll('.close').forEach(close => {
    close.addEventListener('click', () => {
        ocultarModal(carritoModal);
    });
});

closeRating.addEventListener('click', () => ocultarModal(ratingModal));
closeEditProfile.addEventListener('click', () => ocultarModal(editProfileModal));

document.getElementById('close-pago').addEventListener('click', () => {
    ocultarModal(document.getElementById('pago-modal'));
});

document.getElementById('confirmar-pago-btn').addEventListener('click', () => {
    // Calcular total incluyendo envío
    let subtotal = 0;
    let costoEnvioTotal = 0;
    carrito.forEach(item => {
        subtotal += parseFloat(item.precio);
        costoEnvioTotal += (parseFloat(item.costo_envio) || 0);
    });
    const total = subtotal + costoEnvioTotal;
    // Enviar mensaje al número central
    const mensaje = `Hola, he realizado el pago de ${total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} PESOS COP por mis productos. Adjunto comprobante.`;
    window.open(`https://wa.me/573126278124?text=${encodeURIComponent(mensaje)}`, '_blank');
    ocultarModal(document.getElementById('pago-modal'));
    alert('Pago confirmado. Envía el comprobante por WhatsApp.');
});

// Cerrar modales al hacer clic fuera
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        ocultarModal(event.target);
    }
});

// Inicialización
userName.innerHTML = `Bienvenido, ${usuarioActual.nombre} (ID: ${usuarioActual.id})`;
if (usuarioActual.tipos && usuarioActual.tipos.includes('vendedor')) {
    cambiarModoBtn.style.display = 'inline-block';
}

// Agregar indicador de modo
const header = document.querySelector('header');
const modoIndicator = document.createElement('div');
modoIndicator.id = 'modo-indicator';
modoIndicator.textContent = '● Modo Comprador';
header.appendChild(modoIndicator);
mostrarProductos();
actualizarCarrito();
mostrarCalificaciones();
actualizarReloj();

// Mostrar modal de calificación después de 10 segundos
setTimeout(() => {
    if (!localStorage.getItem('ratingShown')) {
        mostrarModal(ratingModal);
        localStorage.setItem('ratingShown', 'true');
    }
}, 10000);