// Variables globales
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let productos = JSON.parse(localStorage.getItem('productos')) || [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
let calificaciones = JSON.parse(localStorage.getItem('calificaciones')) || [];
let sesiones = JSON.parse(localStorage.getItem('sesiones')) || [];
let mensajes = JSON.parse(localStorage.getItem('mensajes')) || [];
let chatVendedorId = null;

// Migrar carrito antiguo al nuevo formato
if (carrito.length > 0 && carrito[0].hasOwnProperty('nombre')) {
    const newCarrito = [];
    carrito.forEach(item => {
        const existing = newCarrito.find(c => c.id === item.id);
        if (existing) {
            existing.cantidad++;
        } else {
            newCarrito.push({id: item.id, cantidad: 1});
        }
    });
    carrito = newCarrito;
    localStorage.setItem('carrito', JSON.stringify(carrito));
}


// Eliminar productos subidos hasta ahora para permitir vendedores reales
if (!localStorage.getItem('productosReseteados')) {
    productos = [];
    localStorage.setItem('productos', JSON.stringify(productos));
    localStorage.setItem('productosReseteados', 'true');
}

// Elementos del DOM
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const vendedorBtn = document.getElementById('vendedor-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const agregarProductoModal = document.getElementById('agregar-producto-modal');
const carritoModal = document.getElementById('carrito-modal');
const ratingModal = document.getElementById('rating-modal');
const modoModal = document.getElementById('modo-modal');
const forgotPasswordModal = document.getElementById('forgot-password-modal');
const closeLogin = document.getElementById('close-login');
const closeRegister = document.getElementById('close-register');
const closeAgregar = document.getElementById('close-agregar');
const closeRating = document.getElementById('close-rating');
const closeForgot = document.getElementById('close-forgot');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const agregarProductoForm = document.getElementById('agregar-producto-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const carritoIcon = document.getElementById('carrito-icon');
const carritoCount = document.getElementById('carrito-count');
const carritoItems = document.getElementById('carrito-items');
const chatBtn = document.getElementById('chat-btn');
const submitRating = document.getElementById('submit-rating');
const stars = document.querySelectorAll('.star');
const clock = document.getElementById('clock');
const ratingsDisplay = document.getElementById('ratings-display');
const chatModal = document.getElementById('chat-modal');
const closeChat = document.getElementById('close-chat');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendMessage = document.getElementById('send-message');

// Funciones de utilidad
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function mostrarModal(modal) {
    modal.style.display = 'block';
}

function ocultarModal(modal) {
    modal.style.display = 'none';
}

function actualizarCarrito() {
    carritoCount.textContent = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function mostrarProductos() {
    const container = document.getElementById('productos-container');
    container.innerHTML = '';
    let productosAMostrar = productos.filter(p => p.vendedorId !== null); // Solo productos subidos por vendedores

    // Cambiar el título según el modo
    const titulo = document.querySelector('#productos h2');
    if (usuarioActual && usuarioActual.modoSeleccionado === 'vendedor') {
        titulo.textContent = 'Mis Productos';
        productosAMostrar = productos.filter(p => p.vendedorId === usuarioActual.id);
        // Agregar botón para agregar producto
        const addBtn = document.createElement('button');
        addBtn.textContent = 'Agregar Nuevo Producto';
        addBtn.onclick = () => mostrarModal(agregarProductoModal);
        addBtn.style.marginBottom = '20px';
        container.appendChild(addBtn);
    } else {
        titulo.textContent = 'Productos Disponibles';
    }

    productosAMostrar.forEach(producto => {
        const div = document.createElement('div');
        div.className = 'producto';
        let buttonHtml = '';
        let contentHtml = '';

        if (!usuarioActual) {
            // Usuarios no logueados: mostrar imagen, título y precio solo para productos reales de vendedores
            contentHtml = `
                <img src="${producto.imagen}" alt="${producto.nombre}" style="width:200px; height:150px;">
                <h3>${producto.nombre}</h3>
                <p>Precio: $${producto.precio}</p>
            `;
        } else if (usuarioActual.modoSeleccionado === 'comprador') {
            // Compradores: mostrar todo con selector de cantidad y botón agregar al carrito
            const vendedor = usuarios.find(u => u.id === producto.vendedorId);
            const nombreVendedor = vendedor ? vendedor.nombre : 'Desconocido';
            buttonHtml = `<button onclick="agregarAlCarrito(${producto.id})">Agregar al Carrito</button>`;
            contentHtml = `
                <img src="${producto.imagen}" alt="${producto.nombre}" style="width:200px; height:150px;">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p>Precio: $${producto.precio}</p>
                <p>Stock: ${producto.stock}</p>
                ${buttonHtml}
            `;
        } else if (usuarioActual.modoSeleccionado === 'vendedor' && producto.vendedorId === usuarioActual.id) {
            // Vendedores: mostrar todo con botones editar/eliminar
            buttonHtml = `<button onclick="editarProducto(${producto.id})">Editar</button>
                          <button onclick="eliminarProducto(${producto.id})">Eliminar</button>`;
            contentHtml = `
                <img src="${producto.imagen}" alt="${producto.nombre}" style="width:200px; height:150px;">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p>Precio: $${producto.precio}</p>
                <p>Stock: ${producto.stock}</p>
                ${buttonHtml}
            `;
        }

        div.innerHTML = contentHtml;
        container.appendChild(div);
    });
}

function actualizarInterfaz() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const vendedorBtn = document.getElementById('vendedor-btn');
    const header = document.querySelector('header');
    const carritoIcon = document.getElementById('carrito-icon');

    if (usuarioActual) {
        // Mostrar información del usuario
        let userInfo = document.getElementById('user-info');
        if (!userInfo) {
            userInfo = document.createElement('div');
            userInfo.id = 'user-info';
            userInfo.innerHTML = `<span id="user-name"></span> <button id="logout-btn">Cerrar Sesión</button> <button id="cambiar-modo-btn" style="display: none;">Cambiar a Modo Comprador</button>`;
            header.appendChild(userInfo);
        }
        document.getElementById('user-name').textContent = `Bienvenido, ${usuarioActual.nombre} (ID: ${usuarioActual.id})`;
        if (usuarioActual.tipos && usuarioActual.tipos.includes('comprador')) {
            document.getElementById('cambiar-modo-btn').style.display = 'inline-block';
        }
        // Agregar event listeners
        document.getElementById('logout-btn').addEventListener('click', logout);
        document.getElementById('cambiar-modo-btn').addEventListener('click', cambiarModo);
        if (usuarioActual.modoSeleccionado === 'vendedor') {
            vendedorBtn.style.display = 'inline-block';
            carritoIcon.style.display = 'none'; // Ocultar carrito para vendedores
        } else {
            carritoIcon.style.display = 'block'; // Mostrar carrito para compradores
        }
    } else {
        vendedorBtn.style.display = 'none';
        carritoIcon.style.display = 'none'; // Ocultar carrito para no logueados
        const userInfo = document.getElementById('user-info');
        if (userInfo) userInfo.remove();
        const modoIndicator = document.getElementById('modo-indicator');
        if (modoIndicator) modoIndicator.remove();
    }
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
    actualizarInterfaz();
}

function mostrarModalModo() {
    mostrarModal(modoModal);
}

function redirigirSegunModo() {
    if (usuarioActual.modoSeleccionado === 'comprador') {
        window.location.href = 'dashboard-cliente.html';
    } else if (usuarioActual.modoSeleccionado === 'vendedor') {
        window.location.href = 'dashboard-vendedor.html';
    }
}

function editarProducto(id) {
    // Implementar edición (simplificada)
    alert('Función de edición no implementada aún.');
}

function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        localStorage.setItem('productos', JSON.stringify(productos));
        mostrarProductos();
    }
}

function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (producto && producto.stock > 0) {
        const existing = carrito.find(c => c.id === id);
        if (existing) {
            existing.cantidad++;
        } else {
            carrito.push({id: id, cantidad: 1});
        }
        producto.stock--;
        actualizarCarrito();
        mostrarProductos();
        localStorage.setItem('productos', JSON.stringify(productos));
    }
}

function mostrarCarrito() {
    carritoItems.innerHTML = '';
    let total = 0;
    carrito.forEach((item, index) => {
        const producto = productos.find(p => p.id === item.id);
        if (producto) {
            const subtotal = parseFloat(producto.precio) * item.cantidad;
            total += subtotal;
            const div = document.createElement('div');
            div.innerHTML = `
                <p>${producto.nombre} - Cantidad: ${item.cantidad} - Precio unitario: $${producto.precio} - Subtotal: $${subtotal.toFixed(2)}</p>
                <button onclick="removerDelCarrito(${index})">Remover uno</button>
                <button onclick="removerTodosDelCarrito(${index})">Remover todos</button>
            `;
            carritoItems.appendChild(div);
        }
    });
    // Mostrar total
    const totalDiv = document.createElement('div');
    totalDiv.innerHTML = `<p><strong>Total: $${total.toFixed(2)}</strong></p>`;
    carritoItems.appendChild(totalDiv);
}

function mostrarChat() {
    chatMessages.innerHTML = '';
    const mensajesFiltrados = mensajes.filter(m => (m.deUsuarioId === usuarioActual.id && m.paraUsuarioId === chatVendedorId) || (m.deUsuarioId === chatVendedorId && m.paraUsuarioId === usuarioActual.id));
    mensajesFiltrados.forEach(m => {
        const isFromMe = m.deUsuarioId === usuarioActual.id;
        const div = document.createElement('div');
        div.className = isFromMe ? 'message user' : 'message other';
        div.textContent = m.mensaje;
        chatMessages.appendChild(div);
    });
    mostrarModal(chatModal);
}

function removerDelCarrito(index) {
    const item = carrito[index];
    item.cantidad--;
    if (item.cantidad <= 0) {
        carrito.splice(index, 1);
    }
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

function removerTodosDelCarrito(index) {
    const item = carrito.splice(index, 1)[0];
    // Devolver stock
    const producto = productos.find(p => p.id === item.id);
    if (producto) {
        producto.stock += item.cantidad;
        localStorage.setItem('productos', JSON.stringify(productos));
    }
    actualizarCarrito();
    mostrarCarrito();
    mostrarProductos();
}

// Funciones de registro y login
registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const nombre = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const tiposSeleccionados = Array.from(document.querySelectorAll('input[name="register-type"]:checked')).map(cb => cb.value);

    if (tiposSeleccionados.length === 0) {
        alert('Debes seleccionar al menos un tipo de usuario.');
        return;
    }

    // Verificar si el email ya existe
    if (usuarios.find(u => u.email === email)) {
        alert('El email ya está registrado.');
        return;
    }

    const hashedPassword = await hashPassword(password);

    const nuevoUsuario = {
        id: Date.now(),
        nombre,
        email,
        telefono: phone,
        password: hashedPassword,
        tipos: tiposSeleccionados
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    alert('Registro exitoso. Ahora puedes iniciar sesión.');
    ocultarModal(registerModal);
    registerForm.reset();
});

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    // Consultar si el email está activo (registrado)
    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) {
        alert('El correo electrónico no está registrado.');
        return;
    }

    const hashedPassword = await hashPassword(password);
    if (usuario.password === hashedPassword) {
        // Migrar usuarios antiguos con 'tipo' a 'tipos'
        if (usuario.tipo && !usuario.tipos) {
            usuario.tipos = [usuario.tipo];
            delete usuario.tipo;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }

        usuarioActual = usuario;
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));

        // Registrar sesión de login
        sesiones.push({
            id: Date.now(),
            usuarioId: usuario.id,
            action: 'login',
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('sesiones', JSON.stringify(sesiones));

        // Acordar credenciales automáticamente si está marcado
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
            localStorage.setItem('rememberedPassword', password);
        } else {
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberedPassword');
        }

        ocultarModal(loginModal);
        loginForm.reset();

        // Si tiene múltiples tipos, redirigir a página de selección de modo
        if (usuario.tipos.length > 1) {
            window.location.href = 'modo.html';
        } else {
            // Solo un tipo, redirigir directamente
            usuarioActual.modoSeleccionado = usuario.tipos[0];
            localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
            if (usuario.tipos[0] === 'comprador') {
                window.location.href = 'dashboard-cliente.html';
            } else {
                window.location.href = 'dashboard-vendedor.html';
            }
        }
    } else {
        alert('Credenciales incorrectas.');
    }
});

// Funciones para productos (vendedores)

agregarProductoForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!usuarioActual || usuarioActual.modoSeleccionado !== 'vendedor') {
        alert('Solo vendedores pueden agregar productos.');
        return;
    }

    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const precio = document.getElementById('precio').value;
    const stock = document.getElementById('stock').value;
    const imagenInput = document.getElementById('imagen');
    const file = imagenInput.files[0];

    if (!file) {
        alert('Debes seleccionar una imagen.');
        return;
    }

    // Convertir archivo a data URL
    const imagen = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

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
    ocultarModal(agregarProductoModal);
    agregarProductoForm.reset();
    mostrarProductos();
});

// Funciones del carrito

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

// Event listeners para mostrar/ocultar contraseña
document.getElementById('show-password-login').addEventListener('change', function() {
    const passwordInput = document.getElementById('login-password');
    passwordInput.type = this.checked ? 'text' : 'password';
});

document.getElementById('show-password-register').addEventListener('change', function() {
    const passwordInput = document.getElementById('register-password');
    passwordInput.type = this.checked ? 'text' : 'password';
});

// Event listener para forgot password
document.getElementById('forgot-password-link').addEventListener('click', function(e) {
    e.preventDefault();
    mostrarModal(forgotPasswordModal);
});

forgotPasswordForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const usuario = usuarios.find(u => u.email === email);
    if (usuario) {
        alert('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    } else {
        alert('El correo electrónico no está registrado.');
    }
    ocultarModal(forgotPasswordModal);
    forgotPasswordForm.reset();
});

// Event listeners para modales
loginBtn.addEventListener('click', () => mostrarModal(loginModal));
registerBtn.addEventListener('click', () => mostrarModal(registerModal));
vendedorBtn.addEventListener('click', () => mostrarModal(agregarProductoModal));
carritoIcon.addEventListener('click', () => {
    mostrarCarrito();
    mostrarModal(carritoModal);
});
chatBtn.addEventListener('click', () => {
    const vendedores = [...new Set(carrito.map(item => productos.find(p => p.id === item.id).vendedorId))];
    if (vendedores.length === 0) {
        alert('No hay productos en el carrito.');
        return;
    }
    if (vendedores.length === 1) {
        chatVendedorId = vendedores[0];
        mostrarChat();
    } else {
        // Para múltiples vendedores, chatear con el primero por ahora
        chatVendedorId = vendedores[0];
        mostrarChat();
    }
});

document.getElementById('pago-btn').addEventListener('click', () => {
    // Calcular total
    let total = 0;
    carrito.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (producto) {
            total += parseFloat(producto.precio) * item.cantidad;
        }
    });
    if (total > 0) {
        // Obtener vendedores
        const vendedores = [...new Set(carrito.map(item => productos.find(p => p.id === item.id).vendedorId))];
        if (vendedores.length === 1) {
            const vendedor = usuarios.find(u => u.id === vendedores[0]);
            if (vendedor && vendedor.telefono) {
                const mensaje = `Hola, quiero pagar $${total.toFixed(2)} por mis productos.`;
                window.open(`https://wa.me/${vendedor.telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
            } else {
                alert('No se pudo contactar al vendedor.');
            }
        } else {
            alert('Carrito con múltiples vendedores, contacta directamente.');
        }
    } else {
        alert('No hay productos en el carrito.');
    }
});
sendMessage.addEventListener('click', () => {
    const mensaje = chatInput.value.trim();
    if (mensaje) {
        mensajes.push({
            id: Date.now(),
            deUsuarioId: usuarioActual.id,
            paraUsuarioId: chatVendedorId,
            mensaje,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('mensajes', JSON.stringify(mensajes));
        chatInput.value = '';
        mostrarChat();
    }
});

closeLogin.addEventListener('click', () => ocultarModal(loginModal));
closeRegister.addEventListener('click', () => ocultarModal(registerModal));
closeAgregar.addEventListener('click', () => ocultarModal(agregarProductoModal));
closeRating.addEventListener('click', () => ocultarModal(ratingModal));
closeForgot.addEventListener('click', () => ocultarModal(forgotPasswordModal));
closeChat.addEventListener('click', () => ocultarModal(chatModal));

document.getElementById('modo-comprador').addEventListener('click', () => {
    usuarioActual.modoSeleccionado = 'comprador';
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    ocultarModal(modoModal);
    actualizarInterfaz();
});

document.getElementById('modo-vendedor').addEventListener('click', () => {
    usuarioActual.modoSeleccionado = 'vendedor';
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    ocultarModal(modoModal);
    actualizarInterfaz();
});

document.querySelectorAll('.close').forEach(close => {
    close.addEventListener('click', () => {
        ocultarModal(carritoModal);
    });
});

// Cerrar modales al hacer clic fuera
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        ocultarModal(event.target);
    }
});

// Inicialización
actualizarInterfaz();
actualizarCarrito();
mostrarCalificaciones();
actualizarReloj();

// Credenciales no se cargan automáticamente para mantener campos en blanco

// Mostrar modal de calificación después de 10 segundos
setTimeout(() => {
    if (!localStorage.getItem('ratingShown')) {
        mostrarModal(ratingModal);
        localStorage.setItem('ratingShown', 'true');
    }
}, 10000);