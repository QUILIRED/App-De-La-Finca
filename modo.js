// Variables globales
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;

// Verificar si el usuario está logueado
if (!usuarioActual) {
    window.location.href = 'index.html';
}

document.getElementById('modo-comprador').addEventListener('click', () => {
    usuarioActual.modoSeleccionado = 'comprador';
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    window.location.href = 'dashboard-cliente.html';
});

document.getElementById('modo-vendedor').addEventListener('click', () => {
    usuarioActual.modoSeleccionado = 'vendedor';
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    window.location.href = 'dashboard-vendedor.html';
});