import { loadProducts, setupRentalModalControls } from '../features/products/services';

function registerEvents() {
    const loadButton = document.getElementById('getProducts');

    if (!loadButton) {
        console.error('Bouton de chargement introuvable.');
        return;
    }

    loadButton.addEventListener('click', () => {
        void loadProducts();
    });

    setupRentalModalControls();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerEvents);
} else {
    registerEvents();
}
