// Variables globales
let productos = JSON.parse(localStorage.getItem('productos')) || [];
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
let galeria = JSON.parse(localStorage.getItem('galeria')) || {};
let sesiones = JSON.parse(localStorage.getItem('sesiones')) || [];
let editandoProducto = null;

// Verificar si el usuario está logueado y es vendedor
if (!usuarioActual || usuarioActual.modoSeleccionado !== 'vendedor') {
    window.location.href = 'index.html';
}

// Inicializar galería del usuario si no existe
if (!galeria[usuarioActual.id]) {
    galeria[usuarioActual.id] = [];
    localStorage.setItem('galeria', JSON.stringify(galeria));
}

// Elementos del DOM
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const cambiarModoBtn = document.getElementById('cambiar-modo-btn');
const agregarProductoBtn = document.getElementById('agregar-producto-btn');
const agregarProductoModal = document.getElementById('agregar-producto-modal');
const closeAgregar = document.getElementById('close-agregar');
const agregarProductoForm = document.getElementById('agregar-producto-form');
const clock = document.getElementById('clock');
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

function mostrarProductos() {
    const container = document.getElementById('productos-container');
    container.innerHTML = '';
    const productosVendedor = productos.filter(p => p.vendedorId === usuarioActual.id);
    productosVendedor.forEach(producto => {
        const div = document.createElement('div');
        div.className = 'producto';
        div.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" style="width:200px; height:150px;">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <p>Precio: $${producto.precio}</p>
            <p>Stock: ${producto.stock}</p>
            <button onclick="editarProducto(${producto.id})">Editar</button>
            <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
        `;
        container.appendChild(div);
    });
}

function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        editandoProducto = id;
        document.getElementById('producto-id').value = producto.id;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('descripcion').value = producto.descripcion;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('stock').value = producto.stock;
        document.getElementById('imagen').value = producto.imagen;
        document.getElementById('imagen-seleccionada').textContent = 'Imagen actual';
        document.getElementById('submit-btn').textContent = 'Actualizar Producto';
        document.querySelector('#agregar-producto-modal h2').textContent = 'Editar Producto';
        mostrarModal(agregarProductoModal);
    }
}

function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        localStorage.setItem('productos', JSON.stringify(productos));
        mostrarProductos();
    }
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
    usuarioActual.modoSeleccionado = 'comprador';
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    window.location.href = 'dashboard-cliente.html';
}

// Funciones para productos
document.getElementById('seleccionar-imagen-btn').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file) {
        const imagenSeleccionada = document.getElementById('imagen-seleccionada');
        imagenSeleccionada.textContent = file.name;
        const imagen = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        document.getElementById('imagen').value = imagen;
    }
});

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

agregarProductoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const precio = document.getElementById('precio').value;
    const stock = document.getElementById('stock').value;
    const imagen = document.getElementById('imagen').value;

    if (!imagen) {
        alert('Debes seleccionar una imagen.');
        return;
    }

    if (editandoProducto) {
        // Actualizar producto existente
        const producto = productos.find(p => p.id === editandoProducto);
        if (producto) {
            producto.nombre = nombre;
            producto.descripcion = descripcion;
            producto.precio = parseFloat(precio);
            producto.stock = parseInt(stock);
            producto.imagen = imagen;
            localStorage.setItem('productos', JSON.stringify(productos));
            alert('Producto actualizado exitosamente.');
        }
    } else {
        // Agregar nuevo producto
        const nuevoProducto = {
            id: Date.now(),
            nombre,
            descripcion,
            precio: parseFloat(precio),
            stock: parseInt(stock),
            imagen,
            vendedorId: usuarioActual.id
        };
        productos.push(nuevoProducto);
        localStorage.setItem('productos', JSON.stringify(productos));
        alert('Producto agregado exitosamente.');
    }

    ocultarModal(agregarProductoModal);
    agregarProductoForm.reset();
    document.getElementById('imagen-seleccionada').textContent = '';
    editandoProducto = null;
    document.getElementById('submit-btn').textContent = 'Agregar Producto';
    document.querySelector('#agregar-producto-modal h2').textContent = 'Agregar Nuevo Producto';
    mostrarProductos();
});

// Reloj
function actualizarReloj() {
    const ahora = new Date();
    clock.textContent = ahora.toLocaleTimeString();
}
setInterval(actualizarReloj, 1000);

// Event listeners
logoutBtn.addEventListener('click', logout);
cambiarModoBtn.addEventListener('click', cambiarModo);
editProfileBtn.addEventListener('click', () => {
    document.getElementById('edit-name').value = usuarioActual.nombre;
    document.getElementById('edit-email').value = usuarioActual.email;
    document.getElementById('edit-phone').value = usuarioActual.telefono || '';
    mostrarModal(editProfileModal);
});
agregarProductoBtn.addEventListener('click', () => {
    editandoProducto = null;
    agregarProductoForm.reset();
    document.getElementById('imagen-seleccionada').textContent = '';
    document.getElementById('submit-btn').textContent = 'Agregar Producto';
    document.querySelector('#agregar-producto-modal h2').textContent = 'Agregar Nuevo Producto';
    mostrarModal(agregarProductoModal);
});
closeAgregar.addEventListener('click', () => ocultarModal(agregarProductoModal));
closeEditProfile.addEventListener('click', () => ocultarModal(editProfileModal));

// Cerrar modales al hacer clic fuera
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        ocultarModal(event.target);
    }
});

// Inicialización
userName.innerHTML = `Bienvenido, ${usuarioActual.nombre} (ID: ${usuarioActual.id})`;
if (usuarioActual.tipos && usuarioActual.tipos.includes('comprador')) {
    cambiarModoBtn.style.display = 'inline-block';
}

// Agregar indicador de modo
const header = document.querySelector('header');
const modoIndicator = document.createElement('div');
modoIndicator.id = 'modo-indicator';
modoIndicator.textContent = '● Modo Vendedor';
header.appendChild(modoIndicator);
mostrarProductos();
actualizarReloj();